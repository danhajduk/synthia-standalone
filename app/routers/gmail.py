# Standard library imports
from datetime import datetime, time
import sqlite3
import logging
import json

# Third-party imports
import pytz
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta

# Application-specific imports
from gmail_service import GmailService
from utils.database import get_db_path
from utils.classifier import classify_email_batch
from utils.trainer import train_local_classifier

# Initialize router and logging
router = APIRouter()
db_path = get_db_path()
logging.basicConfig(level=logging.INFO)

# Models
class CategoryUpdate(BaseModel):
    id: str
    category: str

# Routes
@router.get("/fetch")
def fetch_emails_since_midnight():
    """
    Fetch unread emails since midnight and store them in the database.
    """
    try:
        # Calculate midnight in local timezone
        local_tz = pytz.timezone("America/Los_Angeles")
        now_local = datetime.now(local_tz)
        local_midnight = datetime.combine(now_local.date(), time.min)
        query_date = local_midnight.strftime("%Y-%m-%d")

        # Fetch emails using GmailService
        gmail = GmailService(token_path="/data/token.json")
        emails = gmail.fetch_emails(since=query_date, unread_only=True)
        logging.info(f"📥 Fetched {len(emails)} emails")

        # Insert emails into the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        inserted = 0
        for email in emails:
            cursor.execute("""
                INSERT OR IGNORE INTO emails (
                    id, sender, sender_email, subject, body,
                    received_at, category, predicted_by,
                    confidence, manual_override, override_timestamp, model_version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                email.get("id"),
                email.get("sender"),
                email.get("email"),
                email.get("subject"),
                email.get("body", ""),
                email.get("received_at"),
                email.get("category", "Uncategorized"),
                email.get("predicted_by", "none"),
                email.get("confidence"),
                email.get("manual_override", 0),
                email.get("override_timestamp"),
                email.get("model_version")
            ))
            inserted += cursor.rowcount

        conn.commit()
        conn.close()

        return JSONResponse({"fetched": len(emails), "inserted": inserted})
    except Exception as e:
        logging.error(f"❌ Error fetching emails: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/list")
def list_emails():
    """
    Retrieve a list of stored emails from the database.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, sender, sender_email, subject, category, received_at, predicted_by, confidence
            FROM emails
            ORDER BY received_at DESC
            LIMIT 100
        """)
        rows = cursor.fetchall()
        conn.close()

        emails = [
            {
                "id": row[0],
                "sender": row[1],
                "email": row[2],
                "subject": row[3],
                "category": row[4],
                "received_at": row[5],
                "predicted_by": row[6]
            }
            for row in rows
        ]

        return JSONResponse({"emails": emails})
    except Exception as e:
        logging.error(f"❌ Error listing emails: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/labels")
def list_labels():
    """
    Retrieve a list of available email labels from the database.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT label FROM labels ORDER BY label")
        rows = cursor.fetchall()
        conn.close()

        return JSONResponse({"labels": [row[0] for row in rows]})
    except Exception as e:
        logging.error(f"❌ Error listing labels: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/categorize")
def update_email_category(data: CategoryUpdate):
    """
    Update the category of a specific email and refresh sender reputation.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get sender info
        cursor.execute("SELECT sender_email, sender FROM emails WHERE id = ?", (data.id,))
        row = cursor.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error": "Email not found"})

        sender_email, sender_name = row

        # Update email classification
        cursor.execute("""
            UPDATE emails
            SET category = ?, predicted_by = ?, manual_override = 1, override_timestamp = ?
            WHERE id = ?
        """, (
            data.category,
            "manual",
            datetime.utcnow().isoformat(),
            data.id
        ))

        conn.commit()
        conn.close()

        # ✅ Update sender reputation
        from utils.database import update_sender_reputation
        update_sender_reputation(sender_email, sender_name, data.category)

        return JSONResponse({"status": "updated"})

    except Exception as e:
        logging.error(f"❌ Failed to update category: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/ai_classify")
def ai_classify_emails():
    """
    Use AI to classify unclassified emails and update their categories in the database.
    """
    try:
        result = classify_email_batch()
        if result is None:
            return JSONResponse(status_code=500, content={"error": "Classification failed"})

        return JSONResponse({"classified": len(result), "details": result})
    except Exception as e:
        logging.error(f"❌ Error during AI classification: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/train/manual")
def train_from_manual():
    success = train_local_classifier(source="manual")
    return JSONResponse({"status": "ok" if success else "no_data", "source": "manual"})

@router.post("/train/openai")
def train_from_openai():
    success = train_local_classifier(source="openai")
    return JSONResponse({"status": "ok" if success else "no_data", "source": "openai"})

@router.get("/debug/fetch14")
def fetch_last_14_days():
    """
    Fetch all emails from the last 14 days (excluding today) and insert them into the database.
    """
    try:
        logging.info("📥 Debug: Fetching all emails from the last 14 days (excluding today)")
        gmail = GmailService(token_path="/data/token.json")

        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=90)
        query_date = start_date.strftime("%Y-%m-%d")

        emails = gmail.fetch_emails(since=query_date, unread_only=False)
        logging.info(f"📬 Retrieved {len(emails)} total emails")

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        inserted = 0

        for email in emails:
            received_str = email.get("received_at")
            if not received_str:
                continue

            received_date = datetime.fromisoformat(received_str).date()
            if received_date >= end_date:
                # Skip emails from today
                continue
            required_fields = ["id", "sender", "email", "subject", "received_at"]
            missing_fields = [field for field in required_fields if not email.get(field)]

            if missing_fields:
                logging.warning(f"⏭️ Skipping email with missing fields: {missing_fields}, ID: {email.get('id')}")
                continue

            cursor.execute("""
                INSERT OR IGNORE INTO emails (
                    id, sender, sender_email, subject, body,
                    received_at, category, predicted_by,
                    confidence, manual_override, override_timestamp, model_version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                email.get("id"),
                email.get("sender"),
                email.get("email"),
                email.get("subject"),
                email.get("body", ""),
                email.get("received_at"),
                email.get("category", "Uncategorized"),
                email.get("predicted_by"),
                email.get("confidence"),
                email.get("manual_override", 0),
                email.get("override_timestamp"),
                email.get("model_version")
            ))
            inserted += cursor.rowcount

        conn.commit()
        conn.close()

        return JSONResponse({"fetched": len(emails), "inserted": inserted})
    except Exception as e:
        logging.error(f"❌ Fetch 14 days error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

import time

@router.get("/debug/classify-all")
def classify_all_in_batches():
    """
    Classifies all unclassified emails using OpenAI in batches of 20.
    Logs estimated time remaining after each batch.
    """
    total_classified = 0
    batch_count = 0
    batch_times = []

    try:
        while True:
            # Start timing the batch
            start_time = time.time()

            result = classify_email_batch()
            if not result:
                break

            # End timing
            elapsed = time.time() - start_time
            batch_times.append(elapsed)

            total_classified += len(result)
            batch_count += 1

            # Estimate remaining
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) FROM emails
                WHERE category IS NULL OR category = 'Uncategorized'
            """)
            remaining = cursor.fetchone()[0]
            conn.close()

            avg_batch_time = sum(batch_times) / len(batch_times)
            batches_left = (remaining // 20) + (1 if remaining % 20 else 0)
            eta = int(avg_batch_time * batches_left)

            mins, secs = divmod(eta, 60)
            logging.info(f"🔄 Batch {batch_count} classified {len(result)} emails — 📨 {remaining} remaining unclassified — ⏳ ETA: {mins}m {secs}s")

        # Final check
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
        """)
        final_remaining = cursor.fetchone()[0]
        conn.close()

        logging.info(f"✅ All batches complete — 📨 Final unclassified emails: {final_remaining}")

        return JSONResponse({
            "status": "completed",
            "batches": batch_count,
            "total_classified": total_classified,
            "remaining_unclassified": final_remaining
        })

    except Exception as e:
        logging.error(f"❌ Error during batch classification: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/reputation")
def list_sender_reputation():
    """
    List sender reputation stats.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sender_email, sender_name, reputation_score, reputation_state, classification_counts, last_updated
            FROM sender_reputation
            ORDER BY reputation_score DESC
            LIMIT 100
        """)
        rows = cursor.fetchall()
        conn.close()

        results = []
        for row in rows:
            results.append({
                "email": row[0],
                "name": row[1],
                "score": row[2],
                "state": row[3],
                "counts": json.loads(row[4]),
                "updated": row[5]
            })

        return JSONResponse({"senders": results})
    except Exception as e:
        logging.error(f"❌ Reputation fetch failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    
@router.post("/reputation/recalculate")
def recalculate_all_sender_reputations():
    """
    Recalculate reputation data for all senders based on existing email classifications.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sender_email, sender, category
            FROM emails
            WHERE sender_email IS NOT NULL AND category IS NOT NULL
        """)
        rows = cursor.fetchall()
        conn.close()

        from collections import defaultdict, Counter
        sender_data = defaultdict(lambda: {"name": "", "counts": Counter()})

        for email, name, category in rows:
            sender_data[email]["name"] = name
            sender_data[email]["counts"][category] += 1

        from utils.database import update_sender_reputation

        for email, data in sender_data.items():
            for label, count in data["counts"].items():
                # Simulate repeated updates
                for _ in range(count):
                    update_sender_reputation(email, data["name"], label)

        return JSONResponse({
            "status": "recalculated",
            "senders_updated": len(sender_data)
        })

    except Exception as e:
        logging.error(f"❌ Reputation recalculation failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

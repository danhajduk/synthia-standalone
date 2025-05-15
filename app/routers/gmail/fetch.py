# Standard library imports
from datetime import datetime, time, timedelta
import sqlite3
import logging
import time



# Third-party imports
import pytz
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Application-specific imports
from app.gmail_service import GmailService
from app.utils.database import get_db_path
from app.utils.classifier import classify_email_batch
from app.utils.automations import run_full_classification_pipeline

# Initialize router
router = APIRouter()
db_path = get_db_path()

@router.get("/")
async def fetch_emails():
    return {"message": "Fetching emails"}

@router.get("/fetch")
def fetch_emails_since_midnight():
    """
    Fetch unread emails since local midnight and insert them into the database.
    """
    try:
        # Calculate midnight in local timezone using timedelta
        local_tz = pytz.timezone("America/Los_Angeles")
        now_local = datetime.now(local_tz)
        local_midnight = (now_local - timedelta(hours=now_local.hour, minutes=now_local.minute, seconds=now_local.second, microseconds=now_local.microsecond))
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
                    id, sender, sender_email, subject,
                    received_at, category, predicted_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                email.get("id"),
                email.get("sender"),
                email.get("email"),
                email.get("subject"),
                email.get("received_at"),
                email.get("category", "Uncategorized"),
                email.get("predicted_by", "none")
            ))
            inserted += cursor.rowcount

        conn.commit()
        conn.close()

        return JSONResponse({"fetched": len(emails), "inserted": inserted})
    except Exception as e:
        logging.error(f"❌ Failed to fetch emails: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/debug/fetch14")
def fetch_last_14_days():
    """
    Fetch all emails from the last 14 days (excluding today) and insert them into the database.
    """
    try:
        logging.info("📥 Debug: Fetching all emails from the last 14 days (excluding today)")
        gmail = GmailService(token_path="/data/token.json")

        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=14)
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

@router.get("/debug/fetch90")
def fetch_last_90_days():
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


@router.get("/debug/classify-all")
def classify_all_in_batches():
    """
    Classifies all unclassified emails using OpenAI in batches of 20.
    Logs duration of each batch and estimates remaining time.
    """
    total_classified = 0
    batch_count = 0
    total_time = 0

    try:
        # Get initial count
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
        """)
        initial_remaining = cursor.fetchone()[0]
        conn.close()

        logging.info(f"🚀 Starting classification of {initial_remaining} unclassified emails...")

        while True:
            start_time = time.time()
            result = classify_email_batch()
            end_time = time.time()

            if not result:
                break

            batch_time = end_time - start_time
            total_time += batch_time
            batch_count += 1
            total_classified += len(result)

            # Estimate remaining
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) FROM emails
                WHERE category IS NULL OR category = 'Uncategorized'
            """)
            remaining = cursor.fetchone()[0]
            conn.close()

            avg_time = total_time / batch_count
            est_remaining_time = avg_time * (remaining // 100 + (1 if remaining % 100 else 0))
            eta = f"{int(est_remaining_time // 60)}m {int(est_remaining_time % 60)}s"

            logging.info(
                f"🔄 Batch {batch_count} classified {len(result)} emails in {batch_time:.2f}s — "
                f"📨 {remaining} remaining unclassified — ⏳ ETA: {eta}"
            )

        logging.info(
            f"✅ All batches complete — 📨 Final unclassified emails: {remaining} "
            f"— ⏱️ Total duration: {total_time:.2f}s"
        )

        return JSONResponse({
            "status": "completed",
            "batches": batch_count,
            "total_classified": total_classified,
            "remaining_unclassified": remaining
        })

    except Exception as e:
        logging.error(f"❌ Error during batch classification: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/debug/classify-one-batch")
def classify_one_batch():
    """
    Classifies a single batch of unclassified emails using OpenAI.
    """
    try:
        result = classify_email_batch()
        batch_size = len(result) if result else 0

        # Check how many unclassified emails remain
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
        """)
        remaining = cursor.fetchone()[0]
        conn.close()

        logging.info(f"🧠 Classified {batch_size} emails in one batch — 📨 {remaining} remaining unclassified")

        return JSONResponse({
            "status": "completed" if batch_size else "skipped",
            "batch_size": batch_size,
            "remaining_unclassified": remaining
        })

    except Exception as e:
        logging.error(f"❌ Error during single batch classification: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/debug/fetch-6m")
def fetch_last_90_days():
    """
    Fetch all emails from the last 14 days (excluding today) and insert them into the database.
    """
    try:
        logging.info("📥 Debug: Fetching all emails from the last 14 days (excluding today)")
        gmail = GmailService(token_path="/data/token.json")

        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=182)
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

from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import sqlite3
import logging




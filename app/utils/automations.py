import sqlite3
import logging
import json
import time
from fastapi import BackgroundTasks
from fastapi.responses import JSONResponse

from collections import Counter
from datetime import datetime, timedelta
from app.utils.database import get_db_path, update_sender_reputation, save_system_value
from app.utils.classifier import check_sender_spamhaus, predict_with_local_model, classify_email_batch
from app.gmail_service import GmailService

CONFIDENCE_THRESHOLD = 80  # Customize this if you like

async def run_full_classification_pipeline():
    logging.info("🚀 Starting full classification pipeline...")

    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Step 1: Fetch unclassified emails
    cursor.execute("""
        SELECT id, sender, sender_email, subject
        FROM emails
        WHERE category IS NULL OR category = 'Uncategorized'
    """)
    emails = cursor.fetchall()
    conn.close()

    if not emails:
        logging.info("✅ No unclassified emails found.")
        return {"status": "done", "processed": 0}

    logging.info(f"📬 Found {len(emails)} unclassified emails.")

    remaining_for_openai = []

    for email_id, sender, sender_email, subject in emails:
        # Step 2: Spamhaus check
        if check_sender_spamhaus(sender_email):
            logging.info(f"⚠️ {sender_email} listed in Spamhaus. Marking as Suspected Spam.")
            mark_classification(email_id, "Suspected Spam", "spamhaus")
            update_sender_reputation(sender_email, sender, "Suspected Spam")
            continue

        # Step 3: Try local classifier
        prediction, confidence = predict_with_local_model(sender, sender_email, subject)
        if prediction and confidence >= CONFIDENCE_THRESHOLD:
            logging.info(f"✅ {email_id} classified as {prediction} ({confidence}%) by local model.")
            mark_classification(email_id, prediction, "local", confidence)
            update_sender_reputation(sender_email, sender, prediction)
        else:
            remaining_for_openai.append({
                "id": email_id,
                "sender_name": sender,
                "sender_email": sender_email,
                "subject": subject
            })

    logging.info(f"🤖 {len(remaining_for_openai)} emails queued for OpenAI classification...")

    # Step 4: Classify remaining with OpenAI in batches of 40
    total_openai = 0
    for i in range(0, len(remaining_for_openai), 40):
        batch = remaining_for_openai[i:i + 40]
        result = classify_email_batch(batch)
        if result:
            total_openai += len(result)

    logging.info("✅ Pipeline complete.")
    return {
        "status": "done",
        "local_classified": len(emails) - len(remaining_for_openai),
        "openai_classified": total_openai,
        "total": len(emails)
    }


def mark_classification(email_id, category, predicted_by, confidence=None):
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE emails
        SET category = ?, predicted_by = ?, confidence = ?
        WHERE id = ?
    """, (category, predicted_by, confidence, email_id))
    conn.commit()
    conn.close()


def fetch_last_hour_emails(background_tasks: BackgroundTasks = None):
    """
    Fetches emails from the last hour and triggers classification pipeline asynchronously.
    """
    try:
        if background_tasks is None:
            background_tasks = BackgroundTasks()  # Create a new instance if not provided

        logging.info("⏰ Fetching emails from the last hour...")
        gmail = GmailService(token_path="/data/token.json")

        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        query_date = one_hour_ago.strftime("%Y-%m-%d")

        emails = gmail.fetch_emails(since=query_date, unread_only=False)

        inserted = 0
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        for email in emails:
            received_at = email.get("received_at")
            if not received_at or datetime.fromisoformat(received_at) < one_hour_ago:
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

        logging.info(f"📥 Inserted {inserted} emails from last hour")

        # Run classification pipeline in background
        import asyncio
        asyncio.create_task(run_full_classification_pipeline())  # Properly schedule the coroutine

        return JSONResponse({
            "fetched": len(emails),
            "inserted": inserted,
            "status": "Classification pipeline started in background"
        })

    except Exception as e:
        logging.error(f"❌ Error fetching or processing emails: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

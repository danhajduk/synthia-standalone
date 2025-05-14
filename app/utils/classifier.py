# Standard library imports
import os
import logging
import time
import json
import sqlite3

# Third-party imports
import openai
import dns.resolver
from joblib import load
from collections import Counter
from fastapi import APIRouter

# Application-specific imports
from app.utils.database import get_db_path
from app.utils.trainer import combine_features

# Constants
openai.api_key = os.getenv("OPENAI_API_KEY")
db_path = get_db_path()
MODEL_PATH = "/data/local_classifier.joblib"
router = APIRouter()

def classify_email_batch():
    """
    Classifies a batch of unclassified emails using OpenAI's assistant and updates their categories in the database.
    """
    try:
        assistant_id = "asst_HCLbiRcnBGBuK40Ax5jxkRcB"
        logging.info("🧠 Classifying emails... (40)")

        # Fetch unclassified emails
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, sender, sender_email, subject, category
            FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
            LIMIT 40
        """)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            logging.info("No unclassified emails to process.")
            return []

        # Filter using Spamhaus
        emails_to_classify = []
        for row in rows:
            email_id, sender_name, sender_email, subject, category = row
            logging.debug(f"📨 Queued: {email_id} | {sender_name} <{sender_email}> | Subject: {subject} | DB Category: {category}")

            if check_sender_spamhaus(sender_email):
                logging.info(f"⚠️ Skipping {sender_email} (Spamhaus match)")
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("UPDATE emails SET category = ? WHERE id = ?", ("Suspected Spam", email_id))
                conn.commit()
                conn.close()
            else:
                emails_to_classify.append({
                    "id": email_id,
                    "sender_name": sender_name,
                    "sender_email": sender_email,
                    "subject": subject
                })

        if not emails_to_classify:
            logging.info("✅ All emails flagged as spam. Nothing sent to OpenAI.")
            return []

        # Create assistant thread
        thread = openai.beta.threads.create()

        # system_prompt = (
        #     "You are an email classification assistant. Classify each email below into exactly one of the following categories:\n\n"
        #     "• Important – High-priority or time-sensitive email\n"
        #     "• Data – Structured content or logs (e.g. appointments, reminders, receipts)\n"
        #     "• Regular – Everyday correspondence not requiring urgent attention\n"
        #     "• Work – Job-related or professional messages\n"
        #     "• Personal – From friends or family\n"
        #     "• Social – Social networks or events\n"
        #     "• Newsletters – Recurring subscription content\n"
        #     "• Notifications – Automated alerts from apps/services\n"
        #     "• Receipts – Purchase confirmations or billing info\n"
        #     "• System Updates – Notifications from platforms or operating systems\n"
        #     "• Flagged for Review – Ambiguous or requires human review\n"
        #     "• Suspected Spam – Possibly unwanted or unsolicited\n"
        #     "Only reply with a raw JSON array of objects using this format:\n"
        #     "[{\"id\": \"<email_id>\", \"category\": \"<chosen_category>\"}, ...]"
        # )
        system_prompt = ( "Please classify the following emails:")

        formatted_emails = "\n\n".join(
            f"ID: {email['id']}\nSender: {email['sender_name']} <{email['sender_email']}>\nSubject: {email['subject']}"
            for email in emails_to_classify
        )
        full_prompt = f"{system_prompt}\n\nEmails:\n{formatted_emails}"

        openai.beta.threads.messages.create(thread_id=thread.id, role="user", content=full_prompt)
        run = openai.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)

        while True:
            run_status = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
            if run_status.status == "completed":
                break
            elif run_status.status in ["failed", "cancelled", "expired"]:
                raise Exception(f"Run failed: {run_status.status}")
            time.sleep(1)

        messages = openai.beta.threads.messages.list(thread_id=thread.id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), None)

        if not reply:
            raise Exception("No response from assistant.")
        
        logging.debug("🧠 Assistant reply: %s", reply)

        # Clean up response formatting
        if reply.startswith("```json"):
            reply = reply.strip("`").strip().replace("json", "", 1).strip()
        elif reply.startswith("```"):
            reply = reply.strip("`").strip()

        parsed = json.loads(reply)

        VALID_CATEGORIES = {
            "Important", "Data", "Regular", "Work", "Personal",
            "Social", "Newsletters", "Notifications", "Receipts",
            "System Updates", "Flagged for Review", "Suspected Spam",
            "Confirmed Spam", "Phishing", "Blacklisted"
        }

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        for item in parsed:
            raw_category = item.get("category", "").strip().title()
            category = raw_category if raw_category in VALID_CATEGORIES else "Flagged For Review"
            cursor.execute(
                "UPDATE emails SET category = ?, predicted_by = ? WHERE id = ?",
                (category, "openai", item["id"])
            )
        conn.commit()
        conn.close()
        summary = Counter(item.get("category", "Uncategorized") for item in parsed)
        summary_str = ", ".join(f"{label}: {count}" for label, count in summary.items())
        logging.info(f"✅ Classified {len(parsed)} emails.")
        logging.info(f"📊 Classification summary: {summary_str}")
        return parsed

    except Exception as e:
        logging.error(f"Error during email classification: {e}")
        return None

def check_sender_spamhaus(email):
    """
    Checks if the sender's domain is listed in Spamhaus DBL.

    Args:
        email (str): The sender's email address.

    Returns:
        bool: True if the domain is listed in Spamhaus DBL, False otherwise.
    """
    if "@" not in email:
        return False
    domain = email.split("@")[1].lower()
    query = f"{domain}.dbl.spamhaus.org"
    try:
        dns.resolver.resolve(query, "A")
        return True  # Listed in Spamhaus DBL
    except dns.resolver.NXDOMAIN:
        logging.debug(f"{domain} is not listed in Spamhaus DBL.")
        return False  # Not listed
    except Exception as e:
        logging.warning(f"Spamhaus lookup failed for {domain}: {e}")
        return False  # On error, treat as not spammy

def predict_with_local_model(sender, sender_email, subject):
    """
    Predicts the category of an email using a local machine learning model.
    Updates the system table with the last prediction timestamp.

    Returns:
        tuple: (Predicted label, confidence percentage), or (None, None) if model is missing.
    """
    if not os.path.exists(MODEL_PATH):
        return None, None

    model = load(MODEL_PATH)
    input_text = combine_features(sender, sender_email, subject)
    predicted_label = model.predict([input_text])[0]
    predicted_proba = model.predict_proba([input_text])[0]
    confidence = max(predicted_proba)

    # ✅ Save last prediction timestamp
    save_system_value("local_model_last_prediction", datetime.utcnow().isoformat())

    return predicted_label, round(confidence * 100)


import openai
import os
import logging
import time
import json
import sqlite3
from utils.database import get_db_path
import dns.resolver

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
db_path = get_db_path()

def classify_email_batch():
    """
    Classifies a batch of unclassified emails using OpenAI's assistant and updates their categories in the database.

    This function:
    - Fetches up to 20 unclassified emails from the database.
    - Filters emails using Spamhaus to flag potential spam.
    - Sends the remaining emails to OpenAI for classification.
    - Updates the database with the classification results.

    Returns:
        list: A list of classified emails with their updated categories.
    """
    try:
        assistant_id = "asst_HCLbiRcnBGBuK40Ax5jxkRcB"
        logging.info("🧠 Classifying emails...")

        # Fetch unclassified emails
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, sender, sender_email, subject, category
            FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
            LIMIT 20
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

        system_prompt = (
            "Please classify each email below into one of the following categories:\n\n"
            "• Important – Emails that contain urgent, personal, financial, or security-related information.\n"
            "• Data – Emails that include appointments, tasks, reminders, receipts, or other structured actionable content.\n"
            "• Regular – General correspondence, newsletters, updates, or messages that do not require action.\n"
            "• Suspected Spam – Unwanted promotional or suspicious content.\n"
            "The output should be a raw JSON array of objects with 'id' and 'category'."
        )

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

        VALID_CATEGORIES = {"Important", "Data", "Regular", "Suspected Spam", "Uncategorized"}

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        for item in parsed:
            raw_category = item.get("category", "").strip().title()
            category = raw_category if raw_category in VALID_CATEGORIES else "Uncategorized"
            cursor.execute("UPDATE emails SET category = ? WHERE id = ?", (category, item["id"]))
        conn.commit()
        conn.close()
        logging.info(f"✅ Classified {len(parsed)} emails.")
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

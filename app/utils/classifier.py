import openai
import os
import logging
import time
import json
import sqlite3
from utils.database import get_db_path

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
db_path = get_db_path()

def classify_email_batch():
    """
    Classifies a batch of unclassified emails using the OpenAI assistant.
    Updates the database with the classification results.
    """
    try:
        assistant_id = "asst_HCLbiRcnBGBuK40Ax5jxkRcB"

        # Fetch unclassified emails from the database
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

        # Prepare emails for classification
        emails = []
        for row in rows:
            email = {
                "id": row[0],
                "sender_name": row[1],
                "sender_email": row[2],
                "subject": row[3]
            }
            logging.info(f"📨 Queued for classification: {email['id']} | {email['sender_name']} <{email['sender_email']}> | Subject: {email['subject']} | DB Category: {row[4]}")
            emails.append(email)

        # Create a thread for classification
        thread = openai.beta.threads.create()

        # System prompt for classification
        system_prompt = (
            "Please classify each email below into one of the following categories:\n\n"
            "• Important – Emails that contain urgent, personal, financial, or security-related information.\n"
            "• Data – Emails that include appointments, tasks, reminders, receipts, or other structured actionable content.\n"
            "• Regular – General correspondence, newsletters, updates, or messages that do not require action.\n"
            "• Suspected Spam – Unwanted promotional or suspicious content.\n"
            "• Uncategorized – If the category is unclear based on the subject and sender.\n\n"
            "The output should be a raw JSON array of objects with 'id' and 'category'."
        )

        # Format emails for the prompt
        formatted_emails = "\n\n".join(
            f"ID: {email['id']}\nSender: {email['sender_name']} <{email['sender_email']}>\nSubject: {email['subject']}"
            for email in emails
        )
        full_prompt = f"{system_prompt}\n\nEmails:\n{formatted_emails}"

        # Send the prompt to the assistant
        openai.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=full_prompt
        )

        # Run the classification process
        run = openai.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant_id
        )

        # Wait for the classification to complete
        while True:
            run_status = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
            if run_status.status == "completed":
                break
            elif run_status.status in ["failed", "cancelled", "expired"]:
                raise Exception(f"Run failed: {run_status.status}")
            time.sleep(1)

        # Retrieve the assistant's reply
        messages = openai.beta.threads.messages.list(thread_id=thread.id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), None)

        if not reply:
            raise Exception("No response from assistant.")

        logging.debug("🧠 Assistant reply: %s", reply)

        # Parse the assistant's reply
        if reply.startswith("```json"):
            reply = reply.strip("`").strip().replace("json", "", 1).strip()
        elif reply.startswith("```"):
            reply = reply.strip("`").strip()

        parsed = json.loads(reply)

        # Define valid categories
        VALID_CATEGORIES = {"Important", "Data", "Regular", "Suspected Spam", "Uncategorized"}

        # Update the database with the classification results
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        for item in parsed:
            raw_category = item.get("category", "").strip().title()  # Normalize casing
            category = raw_category if raw_category in VALID_CATEGORIES else "Uncategorized"
            
            cursor.execute(
                "UPDATE emails SET category = ? WHERE id = ?",
                (category, item["id"])
            )

        conn.commit()
        conn.close()

        return parsed

    except Exception as e:
        logging.error(f"Error during email classification: {e}")
        return None


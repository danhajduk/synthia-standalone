import os
import sqlite3
import json
import time
import logging
from collections import Counter
from datetime import datetime

import openai
import dns.resolver
from utils.trainer import combine_features
from utils.database import get_db_path

# Configuration
openai.api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("OPENAI_ASSISTANT_ID", "asst_HCLbiRcnBGBuK40Ax5jxkRcB")
db_path = get_db_path()

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

VALID_CATEGORIES = {
    "Important", "Data", "Regular", "Work", "Personal",
    "Social", "Newsletters", "Notifications", "Receipts",
    "System Updates", "Flagged for Review", "Suspected Spam",
    "Confirmed Spam", "Phishing", "Blacklisted"
}

def check_sender_spamhaus(email):
    try:
        domain = email.split("@")[1].lower()
        query = f"{domain}.dbl.spamhaus.org"
        dns.resolver.resolve(query, "A")
        return True
    except dns.resolver.NXDOMAIN:
        return False
    except:
        return False

def classify_batch(limit=40):
    logging.info("🔍 Fetching unclassified emails...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, sender, sender_email, subject
        FROM emails
        WHERE category IS NULL OR category = 'Uncategorized'
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    emails = []
    for row in rows:
        id, name, email, subject = row
        if check_sender_spamhaus(email):
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("UPDATE emails SET category = ? WHERE id = ?", ("Suspected Spam", id))
            conn.commit()
            conn.close()
            continue
        emails.append({"id": id, "sender_name": name, "sender_email": email, "subject": subject})

    if not emails:
        logging.info("✅ Nothing to classify.")
        return 0

    # Prepare prompt
    formatted = "\n\n".join(
        f"ID: {e['id']}\nSender: {e['sender_name']} <{e['sender_email']}>\nSubject: {e['subject']}"
        for e in emails
    )

    system_prompt = (
        "You are an email classification assistant. Classify each email below into exactly one of the following categories:\n\n"
        "• Important – High-priority or time-sensitive email\n"
        "• Data – Structured content or logs\n"
        "• Regular – Everyday correspondence\n"
        "• Work – Job-related or professional\n"
        "• Personal – From friends or family\n"
        "• Social – Social networks or events\n"
        "• Newsletters – Recurring subscription content\n"
        "• Notifications – Automated alerts from services\n"
        "• Receipts – Purchase confirmations or bills\n"
        "• System Updates – Platform/system notices\n"
        "• Flagged for Review – Needs human review\n"
        "• Suspected Spam – Possibly unwanted\n"
        "• Confirmed Spam – Verified as spam\n"
        "• Phishing – Dangerous or deceptive\n"
        "• Blacklisted – Domain on blocklist\n"
        "Only return a raw JSON array like:\n"
        '[{"id": "abc123", "category": "Work"}, ...]'
    )

    thread = openai.beta.threads.create()
    openai.beta.threads.messages.create(thread_id=thread.id, role="user", content=f"{system_prompt}\n\nEmails:\n{formatted}")
    run = openai.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)

    while True:
        status = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        if status.status == "completed":
            break
        elif status.status in ["failed", "cancelled", "expired"]:
            logging.error(f"❌ Run failed: {status.status}")
            return 0
        time.sleep(1)

    messages = openai.beta.threads.messages.list(thread_id=thread.id)
    reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), None)

    if not reply:
        logging.warning("⚠️ No reply from assistant")
        return 0

    try:
        if reply.startswith("```json"):
            reply = reply.strip("`").replace("json", "").strip()
        elif reply.startswith("```"):
            reply = reply.strip("`").strip()
        data = json.loads(reply)
    except Exception as e:
        logging.error(f"⚠️ Failed to parse assistant reply: {e}")
        return 0

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    for item in data:
        cat = item["category"].strip().title()
        cat = cat if cat in VALID_CATEGORIES else "Flagged for Review"
        cursor.execute("UPDATE emails SET category = ?, predicted_by = ? WHERE id = ?", (cat, "openai", item["id"]))
    conn.commit()
    conn.close()

    summary = Counter(item.get("category", "Unknown") for item in data)
    logging.info(f"✅ Classified {len(data)} emails")
    logging.info("📊 " + ", ".join(f"{k}: {v}" for k, v in summary.items()))
    return len(data)

if __name__ == "__main__":
    total = 0
    batch = 0
    while True:
        count = classify_batch()
        if count == 0:
            break
        batch += 1
        total += count
        logging.info(f"🔁 Batch {batch} complete — total classified: {total}")
        time.sleep(1)

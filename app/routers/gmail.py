# Import necessary modules and utilities
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, time
import sqlite3
import socket
import logging
import pytz

# Import custom utilities
from gmail_service import GmailService
from utils.database import get_db_path
from utils.classifier import classify_email_batch
from datetime import datetime, timedelta

# Initialize router and logging
router = APIRouter()
db_path = get_db_path()
logging.basicConfig(level=logging.INFO)

# Define request model for category updates
class CategoryUpdate(BaseModel):
    id: str
    category: str


@router.get("/check_spamhaus")
def check_spamhaus():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT sender_email FROM emails ORDER BY rowid DESC LIMIT 20")
        rows = cursor.fetchall()
        conn.close()

        def query_spamhaus(email):
            try:
                domain = email.split('@')[-1]
                ip = socket.gethostbyname(domain)
                reversed_ip = ".".join(reversed(ip.split('.')))
                query = f"{reversed_ip}.zen.spamhaus.org"
                socket.gethostbyname(query)
                return True  # Listed
            except socket.gaierror:
                return False  # Not listed or invalid
            except Exception as e:
                logging.warning(f"⚠️ Lookup failed for {email}: {e}")
                return None

        for row in rows:
            email = row[0]
            if not email or "@" not in email:
                continue
            result = query_spamhaus(email)
            logging.info(f"🔍 {email} → {'⚠️ Listed on Spamhaus' if result else '✅ Clean'}")

        return JSONResponse({"status": "checked", "count": len(rows)})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# Endpoint to update email category
@router.post("/categorize")
def update_category(data: CategoryUpdate):
    try:
        logging.info(f"🔧 Updating category: {data.id} → {data.category}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE emails SET category = ? WHERE id = ?", (data.category, data.id))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "updated"})
    except Exception as e:
        logging.error(f"❌ Failed to update category: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# Endpoint to fetch and store Gmail emails
@router.get("/fetch")
def fetch_and_store_gmail():
    try:
        logging.info("📥 Starting Gmail fetch...")
        gmail = GmailService(token_path="/data/token.json")
        emails = gmail.fetch_emails(
            since=datetime.now().strftime("%Y-%m-%d"),
            unread_only=True
        )
        logging.info(f"✅ Retrieved {len(emails)} emails")

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        for email in emails:
            cursor.execute("""
                INSERT OR IGNORE INTO emails (id, sender, sender_email, subject)
                VALUES (?, ?, ?, ?)""",
                (email["id"], email["sender"], email["email"], email["subject"])
            )
            logging.debug(f"Email received: {email['email']}")

        conn.commit()
        conn.close()
        return JSONResponse({"fetched": len(emails)})
    except Exception as e:
        logging.error(f"❌ Error during Gmail fetch: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# Endpoint to debug recent email entries
@router.get("/debug")
def debug_email_entries():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, sender, subject FROM emails ORDER BY rowid DESC LIMIT 5")
        rows = cursor.fetchall()
        conn.close()

        emails = [{"id": r[0], "sender": r[1], "subject": r[2]} for r in rows]
        return JSONResponse({"recent_emails": emails})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Endpoint to get unread emails since midnight
@router.get("/unread")
def get_unread_today():
    try:
        gmail = GmailService(token_path="/data/token.json")

        # Convert local midnight to UTC timestamp
        local_tz = pytz.timezone("America/Los_Angeles")
        now_local = datetime.now(local_tz)
        local_midnight = local_tz.localize(datetime.combine(now_local.date(), time.min))
        utc_midnight = local_midnight.astimezone(pytz.utc)
        timestamp = int(utc_midnight.timestamp())

        logging.info(f"🕒 Checking unread count since: {utc_midnight.strftime('%Y-%m-%d %H:%M:%S UTC')} (timestamp={timestamp})")

        unread_query = f"is:unread after:{timestamp}"
        response = gmail.service.users().messages().list(userId="me", q=unread_query).execute()
        unread_today = response.get("resultSizeEstimate", 0)

        return JSONResponse({"unread_today": unread_today})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Endpoint to list stored emails
@router.get("/list")
def list_stored_emails():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT id, sender, sender_email, subject, category FROM emails ORDER BY rowid DESC LIMIT 100")
        rows = cursor.fetchall()
        conn.close()

        emails = [{
            "id": r[0],
            "sender": r[1],
            "email": r[2],  # maps to sender_email in DB
            "subject": r[3],
            "category": r[4]
        } for r in rows]

        return JSONResponse(content={"emails": emails})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Endpoint to clear all tables
@router.post("/clear")
@router.get("/clear")
def clear_all_tables():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM emails")
        cursor.execute("DELETE FROM sender_reputation")
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "All tables cleared."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Endpoint to trigger email classification manually
@router.post("/classify")
def trigger_classification():
    try:
        result = classify_email_batch()
        return JSONResponse({"classified": len(result) if result else 0})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


#######################################3
# Debug section 
########################################

@router.get("/debug/fetch14")

def debug_fetch_14_days():
    try:
        logging.info("📥 Debug: Fetching emails from last 14 days")
        gmail = GmailService(token_path="/data/token.json")

        # Calculate 14 days ago as date string
        target_date = datetime.now() - timedelta(days=14)
        since_str = target_date.strftime("%Y-%m-%d")

        logging.info(f"📅 14 days ago (date string): {since_str}")

        emails = gmail.fetch_emails(since=since_str, unread_only=False)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        for email in emails:
            cursor.execute("""
                INSERT OR REPLACE INTO emails (id, sender, sender_email, subject)
                VALUES (?, ?, ?, ?)""",
                (email["id"], email["sender"], email["email"], email["subject"]))
        conn.commit()
        conn.close()

        return JSONResponse({"fetched": len(emails)})
    except Exception as e:
        logging.error(f"❌ Fetch 14 days error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/debug/classify-all")
def debug_classify_all():
    from utils.classifier import classify_email_batch
    total_classified = 0
    counter = 0
    while True:
        # Classify emails in batches
        counter += 1
        logging.info(f"🔄 Classifying batch {counter} : ({counter * 20})")
        result = classify_email_batch()
        if not result or len(result) == 0:
            break
        total_classified += len(result)

    return JSONResponse({"total": total_classified})

@router.post("/debug/backup")
def debug_copy_email_table():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS emails_backup")
        cursor.execute("CREATE TABLE emails_backup AS SELECT * FROM emails")
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "✅ Email table copied to 'emails_backup'"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/debug/restore")
def debug_restore_email_table():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS emails")
        cursor.execute("CREATE TABLE emails AS SELECT * FROM emails_backup")
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "✅ Email table restored from 'emails_backup'"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

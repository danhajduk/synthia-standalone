from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import sqlite3
from gmail_service import GmailService
from utils.database import get_db_path
import logging
from datetime import datetime, time
import pytz
from pydantic import BaseModel
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import sqlite3
import logging
from utils.database import get_db_path
from utils.classifier import classify_email_batch

router = APIRouter()
db_path = get_db_path()
logging.basicConfig(level=logging.INFO)

class CategoryUpdate(BaseModel):
    id: str
    category: str

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
        # Update sender reputation)
            logging.debug('Email received: {}'.format(email["email"]))

        conn.commit()
        conn.close()

        return JSONResponse({"fetched": len(emails)})

    except Exception as e:
        logging.error(f"❌ Error during Gmail fetch: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


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

@router.get("/list")
def list_stored_emails():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Print the table structure (still helpful)
        cursor.execute("PRAGMA table_info(emails);")
        columns = cursor.fetchall()
        # print("📊 Table structure for 'emails':")
        # for col in columns:
        #     print(f"  - {col[1]} ({col[2]})")

        # ✅ Use correct column name: sender_email
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
# New endpoint to trigger classification manually
@router.post("/classify")
def trigger_classification():
    try:
        result = classify_email_batch()
        return JSONResponse({"classified": len(result) if result else 0})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

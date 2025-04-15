from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from datetime import datetime
import sqlite3

from gmail_service import GmailService

router = APIRouter()
DB_PATH = "/data/gmail.sqlite"

@router.get("/unread")
def get_unread_today():
    try:
        gmail = GmailService(token_path="/data/token.json")
        unread = gmail.fetch_emails(since=datetime.now().strftime("%Y-%m-%d"), unread_only=True)
        return JSONResponse({"unread_today": len(unread)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/fetch")
def fetch_and_store_gmail():
    try:
        gmail = GmailService(token_path="/data/token.json")
        emails = gmail.fetch_emails(since=datetime.now().strftime("%Y-%m-%d"), unread_only=True)

        conn = sqlite3.connect(DB_PATH)
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
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/list")
def list_stored_emails():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, sender, subject, sender_email, category FROM emails ORDER BY rowid DESC LIMIT 100")
        rows = cursor.fetchall()
        conn.close()
        emails = [{
            "id": r[0],
            "sender": r[1],
            "subject": r[2],
            "sender_email": r[3],
            "category": r[4] or "Uncategorized"
        } for r in rows]
        return JSONResponse(content={"emails": emails})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/categorize")
async def update_category(request: Request):
    data = await request.json()
    email_id = data.get("id")
    category = data.get("category")
    if not email_id or not category:
        return JSONResponse(status_code=400, content={"error": "Missing id or category"})

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE emails SET category = ? WHERE id = ?", (category, email_id))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "updated"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# Standard library imports
import sqlite3
import logging
from datetime import datetime, time
import pytz  

# Third-party imports
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Application-specific imports
from utils.database import get_db_path


# Initialize router
router = APIRouter()
db_path = get_db_path()

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
                "predicted_by": row[6],
                "confidence": row[7]
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

@router.get("/unread")
def get_unread_today():
    try:
        local_tz = pytz.timezone("America/Los_Angeles")
        now_local = datetime.now(local_tz)
        local_midnight = datetime.combine(now_local.date(), time.min)
        midnight_str = local_midnight.isoformat()

        print(f"🔍 Checking unread since: {midnight_str}")

        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM emails
            WHERE category = 'Uncategorized' AND received_at >= ?
        """, (midnight_str,))
        count = cursor.fetchone()[0]
        conn.close()

        return JSONResponse({"unread_today": count})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
@router.get("/count")
def get_total_email_count():
    """
    Returns the total number of stored emails.
    """
    try:
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM emails")
        count = cursor.fetchone()[0]
        conn.close()

        return JSONResponse({"total_emails": count})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Standard library imports
import sqlite3
import logging
import json

# Third-party imports
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Application-specific imports
from app.utils.database import get_db_path, update_sender_reputation

router = APIRouter()
db_path = get_db_path()

from fastapi import Request
from pydantic import BaseModel

class EmailUpdateRequest(BaseModel):
    id: str
    new_label: str

@router.post("/manual-review/update-label")
def update_email_label(payload: EmailUpdateRequest):
    try:
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE emails
            SET category = ?, manual_override = 1, override_timestamp = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (payload.new_label, payload.id))

        conn.commit()
        conn.close()
        return {"status": "updated", "id": payload.id, "label": payload.new_label}
    except Exception as e:
        logging.error(f"❌ Failed to update label: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/manual-review")
def get_emails_for_manual_classification(tab: str = "flagged"):
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    if tab == "flagged":
        where_clause = "category = 'Flagged For Review'"
    elif tab == "suspected":
        where_clause = "category = 'Suspected Spam'"
    elif tab == "reviewed":
        where_clause = "category NOT IN ('Flagged for Review', 'Suspected Spam') AND predicted_by IS NOT NULL"
    else:
        where_clause = "1=1"  # fallback: return all

    cursor.execute(f"""
        SELECT id, sender, subject, body, sender_email, category, predicted_by, confidence
        FROM emails
        WHERE {where_clause}
        ORDER BY received_at DESC
        LIMIT 100
    """)

    emails = [
        {
            "id": row[0],
            "sender": row[1],
            "subject": row[2],
            "snippet": (row[3] or "")[:100],
            "sender_email": row[4],
            "suggested": row[5],
            "predicted_by": row[6],
            "confidence": row[7] or 0
        }
        for row in cursor.fetchall()
    ]

    conn.close()
    logging.info(f"Fetched {len(emails)} emails for manual classification in tab '{tab}'")  
    return emails

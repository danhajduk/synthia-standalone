
# Standard library imports
import sqlite3
import logging
import json

# Third-party imports
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Application-specific imports
from app.utils.database import get_db_path, update_sender_reputation

# Initialize router
router = APIRouter()
db_path = get_db_path()

@router.get("/reputation")
def list_sender_reputation():
    """
    List sender reputation stats.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sender_email, sender_name, reputation_score, reputation_state, classification_counts, last_updated
            FROM sender_reputation
            ORDER BY reputation_score DESC
            LIMIT 100
        """)
        rows = cursor.fetchall()
        conn.close()

        results = [
            {
                "email": row[0],
                "name": row[1],
                "score": row[2],
                "state": row[3],
                "counts": json.loads(row[4]),
                "updated": row[5]
            }
            for row in rows
        ]

        return JSONResponse({"senders": results})
    except Exception as e:
        logging.error(f"❌ Reputation fetch failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/reputation/recalculate")
def recalculate_all_sender_reputations():
    """
    Recalculate reputation data for all senders based on existing email classifications.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT sender_email, sender, category
            FROM emails
            WHERE sender_email IS NOT NULL AND category IS NOT NULL
        """)
        rows = cursor.fetchall()
        conn.close()

        from collections import defaultdict, Counter
        sender_data = defaultdict(lambda: {"name": "", "counts": Counter()})

        for email, name, category in rows:
            sender_data[email]["name"] = name
            sender_data[email]["counts"][category] += 1

        for email, data in sender_data.items():
            for label, count in data["counts"].items():
                for _ in range(count):
                    update_sender_reputation(email, data["name"], label)

        return JSONResponse({
            "status": "recalculated",
            "senders_updated": len(sender_data)
        })

    except Exception as e:
        logging.error(f"❌ Reputation recalculation failed: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# Standard library imports
import sqlite3
import logging
import json
# Third-party imports
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Application-specific imports
from app.utils.database import get_db_path

# Initialize router
router = APIRouter()
db_path = get_db_path()

@router.get("/stats")
def get_email_stats():
    """
    Return total email count, unclassified count, unread Gmail (if tracked),
    last pre-classification time, and last training time.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Total emails
        cursor.execute("SELECT COUNT(*) FROM emails")
        total = cursor.fetchone()[0]

        # Unclassified
        cursor.execute("""
            SELECT COUNT(*) FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
        """)
        unclassified = cursor.fetchone()[0]

        # Last pre-classify time (based on system table value)
        cursor.execute("""
            SELECT value
            FROM system
            WHERE key = 'local_model_last_prediction'
        """)
        row = cursor.fetchone()
        last_preclassify = None
        if row:
            try:
                value = json.loads(row[0])  # Ensure it's valid JSON
                if isinstance(value, dict):  # Ensure it's a dictionary
                    last_preclassify = value.get("timestamp")
            except json.JSONDecodeError:
                logging.error("❌ Failed to parse 'local_model_last_prediction' as JSON.")

        # Last trained model timestamp from system table
        cursor.execute("""
            SELECT value
            FROM system
            WHERE key = 'local_model_evaluation'
        """)
        row = cursor.fetchone()
        last_trained = None
        if row:
            try:
                value = json.loads(row[0])  # Ensure it's valid JSON
                if isinstance(value, dict):  # Ensure it's a dictionary
                    last_trained = value.get("timestamp")
            except json.JSONDecodeError:
                logging.error("❌ Failed to parse 'local_model_evaluation' as JSON.")

        conn.close()
        
        logging.debug(f"📊 Email stats: total={total}, unclassified={unclassified}, last_preclassify={last_preclassify}, last_trained={last_trained}")
        
        return JSONResponse({
            "total": total,
            "unclassified": unclassified,
            "unread": 14,  # TODO: Replace with real sync value
            "last_preclassify": last_preclassify,
            "last_trained": last_trained
        })

    except Exception as e:
        logging.error(f"❌ Failed to get email stats: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# Standard library imports
import sqlite3
import logging

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
    Return total email count and unclassified count.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM emails")
        total = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM emails
            WHERE category IS NULL OR category = 'Uncategorized'
        """)
        unclassified = cursor.fetchone()[0]

        conn.close()
        return JSONResponse({
            "total": total,
            "unclassified": unclassified
        })
    except Exception as e:
        logging.error(f"❌ Failed to get email stats: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

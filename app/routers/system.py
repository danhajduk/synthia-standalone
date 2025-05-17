# Standard library imports
import sqlite3
import json
import logging

# Third-party imports
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Application-specific imports
from app.utils.database import get_db_path

# Initialize router
router = APIRouter()
db_path = get_db_path()

@router.get("/api/hello")
def hello():
    """
    A simple endpoint to test the API.
    Returns a greeting message.
    """
    return JSONResponse({"backend": "ok"})

@router.post("/api/clear_all_tables")
def clear_all_tables():
    """
    Clears all data from the 'emails' and 'sender_reputation' tables.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM emails")
        cursor.execute("DELETE FROM sender_reputation")
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "All tables cleared."})
    except Exception as e:
        logging.error(f"❌ Error clearing tables: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/model/metrics")
def get_model_metrics():
    """
    Retrieves the evaluation metrics of the local machine learning model.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system WHERE key = ?", ("local_model_evaluation",))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return JSONResponse(status_code=404, content={"error": "No evaluation data found."})

        metrics = json.loads(row[0])
        return JSONResponse(content=metrics)

    except Exception as e:
        logging.error(f"❌ Error retrieving model metrics: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import sqlite3
from utils.database import get_db_path

# Create a router for system-related endpoints
router = APIRouter()
db_path = get_db_path()

@router.get("/api/hello")
def hello():
    """
    A simple endpoint to test the API.
    Returns a greeting message.
    """
    return JSONResponse({"message": "Hello from FastAPI!"})

@router.post("/api/clear_all_tables")
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

@router.get("/model/metrics")
def get_model_metrics():
    try:
        conn = sqlite3.connect(get_db_path())
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

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

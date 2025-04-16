from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Create a router for system-related endpoints
router = APIRouter()

@router.get("/api/hello")
def hello():
    """
    A simple endpoint to test the API.
    Returns a greeting message.
    """
    return JSONResponse({"message": "Hello from FastAPI!"})
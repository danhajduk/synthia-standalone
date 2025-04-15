from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/api/hello")
def hello():
    return JSONResponse({"message": "Hello from FastAPI!"})
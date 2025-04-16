from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from routers import gmail, openai_routes, system
from utils.database import initialize_database

router = APIRouter()

# Ensure data directory and initialize schema
initialize_database()

# Initialize FastAPI app
app = FastAPI()

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mount routers
app.include_router(system.router)
app.include_router(gmail.router, prefix="/api/gmail")
app.include_router(openai_routes.router, prefix="/api/openai")
app.include_router(openai_routes.router_ai, prefix="/api/ai")

# Serve main page
@app.get("/")
def index():
    return FileResponse("static/index.html")


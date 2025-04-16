from fastapi import APIRouter, FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import openai
import os
import logging
import time
import json
import sqlite3

from routers import gmail, openai_routes, system
from utils.database import initialize_database, get_db_path

# Setup logging
logging.basicConfig(level=logging.INFO)

# Initialize OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize database
initialize_database()
db_path = get_db_path()

# Define router (if needed for subroutes)
router = APIRouter()

# Initialize FastAPI app
app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(system.router)
app.include_router(gmail.router, prefix="/api/gmail")
app.include_router(openai_routes.router, prefix="/api/openai")
app.include_router(openai_routes.router_ai, prefix="/api/ai")

# Serve main UI page
@app.get("/")
def index():
    return FileResponse("static/index.html")


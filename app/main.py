# Import necessary modules and libraries
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

# Import application-specific modules
from routers import gmail, openai_routes, system
from utils.database import initialize_database, get_db_path

# Setup logging configuration
logging.basicConfig(level=logging.INFO)
# Suppress httpx INFO logs
logging.getLogger("httpx").setLevel(logging.WARNING)

# Initialize OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize the database
initialize_database()  # Ensures the database is set up
db_path = get_db_path()  # Retrieve the database path

# Define a router for subroutes (if needed)
router = APIRouter()

# Initialize the FastAPI application
app = FastAPI()

# Mount static files for serving assets (e.g., CSS, JS, images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers for different functionalities
app.include_router(system.router)  # System-related routes
app.include_router(gmail.router, prefix="/api/gmail")  # Gmail-related routes
app.include_router(openai_routes.router, prefix="/api/openai")  # OpenAI-related routes
app.include_router(openai_routes.router_ai, prefix="/api/ai")  # AI-specific routes

# Serve the main UI page (index.html) at the root endpoint
@app.get("/")
def index():
    """
    Serve the main UI page.
    """
    return FileResponse("static/index.html")


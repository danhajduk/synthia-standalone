from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import sqlite3
import os

from routers import gmail, openai_routes, system

# main.py or init script
try:
    cursor.execute("ALTER TABLE emails ADD COLUMN category TEXT DEFAULT 'Uncategorized';")
except sqlite3.OperationalError:
    pass  # Already exists

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

# Create SQLite DB if not exists
DB_PATH = "/data/gmail.sqlite"
Path("/data").mkdir(exist_ok=True)
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    sender TEXT,
    subject TEXT
)
""")
try:
    cursor.execute("ALTER TABLE emails ADD COLUMN sender_email TEXT;")
except sqlite3.OperationalError:
    pass
conn.commit()
conn.close()

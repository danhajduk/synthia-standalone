from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import gmail, openai_routes, system
from app.utils.database import initialize_database, get_db_path

app = FastAPI()

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
initialize_database()
db_path = get_db_path()

# API routes
app.include_router(system.router)
app.include_router(gmail.router, prefix="/api/gmail")
app.include_router(openai_routes.router, prefix="/api/openai")

# Serve React app from /frontend/dist
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")

@app.get("/")
def serve_root():
    return FileResponse("frontend/dist/index.html")

@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    return FileResponse("frontend/dist/index.html")

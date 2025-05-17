from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import concurrent.futures

import asyncio
from datetime import datetime, timedelta

from app.routers import gmail, openai_routes, system
from app.utils.database import initialize_database, get_db_path
from app.utils.automations import fetch_last_hour_emails, midnight_task, check_and_retrain_model
from app.routers.gmail.reputation import recalculate_all_sender_reputations


logging.getLogger("httpx").setLevel(logging.WARNING)
# Configure logging to include timestamps
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

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

# Limit the thread pool size
thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=2)  # Adjust max_workers as needed

@app.on_event("startup")
async def start_schedulers():
    async def periodic_fetch():
        while True:
            try:
                logging.info("⏰ Running scheduled fetch for last hour...")
                fetch_last_hour_emails()  # Call directly since it's sync
            except Exception as e:
                logging.error(f"⚠️ Scheduled fetch failed: {e}")
            await asyncio.sleep(600)  # Sleep for 10 minutes

    async def midnight_task_runner():
        while True:
            now = asyncio.get_event_loop().time() 
            midnight = (now // 86400 + 1) * 86400  # Calculate next midnight
            await asyncio.sleep(midnight - now)  # Sleep until midnight
            try:
                await midnight_task()  # Call the midnight_task function
            except Exception as e:
                logging.error(f"⚠️ Midnight task failed: {e}")

    async def friday_reputation_recalculation():
        while True:
            now = datetime.utcnow()
            # Calculate the next Friday at 2:00 AM
            days_until_friday = (4 - now.weekday()) % 7  # 4 corresponds to Friday
            next_friday = now + timedelta(days=days_until_friday)
            next_friday_2am = datetime.combine(next_friday.date(), datetime.min.time()) + timedelta(hours=2)
            seconds_until_next_run = (next_friday_2am - now).total_seconds()

            logging.info(f"⏳ Scheduled reputation recalculation in {seconds_until_next_run / 3600:.2f} hours.")
            await asyncio.sleep(seconds_until_next_run)  # Sleep until the next Friday at 2:00 AM

            try:
                logging.info("🔄 Running reputation recalculation...")
                await asyncio.get_running_loop().run_in_executor(thread_pool, recalculate_all_sender_reputations)
                logging.info("✅ Reputation recalculation completed.")
            except Exception as e:
                logging.error(f"❌ Reputation recalculation failed: {e}")

    # asyncio.create_task(periodic_fetch())
    # asyncio.create_task(midnight_task_runner())
    # asyncio.create_task(friday_reputation_recalculation())


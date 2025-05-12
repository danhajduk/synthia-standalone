# Standard library imports
from datetime import datetime, timedelta
import os
import time

# Third-party imports
import requests
import openai
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

# Set OpenAI API keys from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")
OPENAI_ADMIN_KEY = os.getenv("OPENAI_ADMIN_API_KEY")

# Initialize routers
router = APIRouter()
router_ai = APIRouter()

@router.post("/chat")
async def openai_chat(request: Request):
    """
    Handles chat requests using OpenAI's API.
    - Accepts a JSON payload with a "message" field.
    - Creates a thread, sends the user input, and retrieves the assistant's reply.
    """
    data = await request.json()
    user_input = data.get("message", "")
    assistant_id = "asst_HCLbiRcnBGBuK40Ax5jxkRcB"

    try:
        # Create a new thread and send the user message
        thread = openai.beta.threads.create()
        openai.beta.threads.messages.create(thread_id=thread.id, role="user", content=user_input)
        
        # Start a run and wait for completion
        run = openai.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)
        while True:
            run_status = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
            if run_status.status == "completed":
                break
            elif run_status.status in ["failed", "cancelled", "expired"]:
                raise Exception(f"Run failed: {run_status.status}")
            time.sleep(1)

        # Retrieve the assistant's reply
        messages = openai.beta.threads.messages.list(thread_id=thread.id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), "No reply")
        return JSONResponse({"reply": reply})

    except Exception as e:
        logging.error(f"❌ Error during OpenAI chat: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/cost")
def get_openai_monthly_cost():
    """
    Retrieves the current month's OpenAI usage and subscription limit.
    Requires the OpenAI Admin API key to be set.
    """
    if not OPENAI_ADMIN_KEY:
        return JSONResponse(status_code=500, content={"error": "Admin API key not set"})

    headers = {"Authorization": f"Bearer {OPENAI_ADMIN_KEY}"}
    now = datetime.utcnow()
    start_date = now.replace(day=1).strftime('%Y-%m-%d')
    end_date = now.strftime('%Y-%m-%d')

    usage_url = f"https://api.openai.com/v1/dashboard/billing/usage?start_date={start_date}&end_date={end_date}"
    subscription_url = "https://api.openai.com/v1/dashboard/billing/subscription"

    try:
        # Fetch usage and subscription data
        usage_response = requests.get(usage_url, headers=headers).json()
        sub_response = requests.get(subscription_url, headers=headers).json()

        # Calculate usage and limit
        total_usage = usage_response.get("total_usage", 0) / 100.0
        limit = sub_response.get("hard_limit_usd", 0)

        return JSONResponse({"used": round(total_usage, 2), "limit": round(limit, 2)})
    except Exception as e:
        logging.error(f"❌ Error retrieving OpenAI cost: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router_ai.get("/usage")
def get_ai_usage():
    """
    Retrieves OpenAI usage for the current and previous month.
    Requires the OpenAI Admin API key to be set.
    """
    if not OPENAI_ADMIN_KEY:
        return JSONResponse(status_code=500, content={"error": "Admin API key not set"})

    headers = {"Authorization": f"Bearer {OPENAI_ADMIN_API_KEY}"}
    now = datetime.utcnow()

    # Define date ranges for this month and last month
    this_month_start = now.replace(day=1).strftime("%Y-%m-%d")
    last_month_end = (now.replace(day=1) - timedelta(days=1))
    last_month_start = last_month_end.replace(day=1).strftime("%Y-%m-%d")
    last_month_end = last_month_end.strftime("%Y-%m-%d")

    def fetch_cost(start, end):
        """
        Helper function to fetch usage cost for a given date range.
        """
        url = f"https://api.openai.com/v1/dashboard/billing/usage?start_date={start}&end_date={end}"
        try:
            resp = requests.get(url, headers=headers)
            if resp.ok:
                return resp.json().get("total_usage", 0) / 100.0
        except Exception as e:
            logging.error(f"❌ Error fetching cost for range {start} to {end}: {e}")
        return 0.0

    try:
        # Fetch costs for this month and last month
        this_month_cost = fetch_cost(this_month_start, now.strftime("%Y-%m-%d"))
        last_month_cost = fetch_cost(last_month_start, last_month_end)
        return JSONResponse({
            "this_month": round(this_month_cost, 4),
            "last_month": round(last_month_cost, 4)
        })
    except Exception as e:
        logging.error(f"❌ Error retrieving AI usage: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

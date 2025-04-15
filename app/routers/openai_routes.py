from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import os
import requests
import openai
import time

openai.api_key = os.getenv("OPENAI_API_KEY")
OPENAI_ADMIN_KEY = os.getenv("OPENAI_ADMIN_API_KEY")

router = APIRouter()
router_ai = APIRouter()

@router.post("/chat")
async def openai_chat(request: Request):
    data = await request.json()
    user_input = data.get("message", "")
    assistant_id = "asst_HCLbiRcnBGBuK40Ax5jxkRcB"

    try:
        thread = openai.beta.threads.create()
        openai.beta.threads.messages.create(thread_id=thread.id, role="user", content=user_input)
        run = openai.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)

        while True:
            run_status = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
            if run_status.status == "completed":
                break
            elif run_status.status in ["failed", "cancelled", "expired"]:
                raise Exception(f"Run failed: {run_status.status}")
            time.sleep(1)

        messages = openai.beta.threads.messages.list(thread_id=thread.id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), "No reply")
        return JSONResponse({"reply": reply})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/cost")
def get_openai_monthly_cost():
    if not OPENAI_ADMIN_KEY:
        return JSONResponse(status_code=500, content={"error": "Admin API key not set"})

    headers = {"Authorization": f"Bearer {OPENAI_ADMIN_KEY}"}
    now = datetime.utcnow()
    start_date = now.replace(day=1).strftime('%Y-%m-%d')
    end_date = now.strftime('%Y-%m-%d')

    usage_url = f"https://api.openai.com/v1/dashboard/billing/usage?start_date={start_date}&end_date={end_date}"
    subscription_url = "https://api.openai.com/v1/dashboard/billing/subscription"

    try:
        usage_response = requests.get(usage_url, headers=headers).json()
        sub_response = requests.get(subscription_url, headers=headers).json()

        total_usage = usage_response.get("total_usage", 0) / 100.0
        limit = sub_response.get("hard_limit_usd", 0)

        return JSONResponse({"used": round(total_usage, 2), "limit": round(limit, 2)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router_ai.get("/usage")
def get_ai_usage():
    if not OPENAI_ADMIN_KEY:
        return JSONResponse(status_code=500, content={"error": "Admin API key not set"})

    headers = {"Authorization": f"Bearer {OPENAI_ADMIN_KEY}"}
    now = datetime.utcnow()

    this_month_start = now.replace(day=1).strftime("%Y-%m-%d")
    last_month_end = (now.replace(day=1) - timedelta(days=1))
    last_month_start = last_month_end.replace(day=1).strftime("%Y-%m-%d")
    last_month_end = last_month_end.strftime("%Y-%m-%d")

    def fetch_cost(start, end):
        url = f"https://api.openai.com/v1/dashboard/billing/usage?start_date={start}&end_date={end}"
        try:
            resp = requests.get(url, headers=headers)
            if resp.ok:
                return resp.json().get("total_usage", 0) / 100.0
        except:
            pass
        return 0.0

    try:
        this_month_cost = fetch_cost(this_month_start, now.strftime("%Y-%m-%d"))
        last_month_cost = fetch_cost(last_month_start, last_month_end)
        return JSONResponse({
            "this_month": round(this_month_cost, 4),
            "last_month": round(last_month_cost, 4)
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Synthia Standalone

Synthia Standalone is a self-hosted AI-powered assistant that integrates Gmail classification, sender reputation tracking, OpenAI analysis, and a friendly web UI. Designed for local deployments using Docker.

---

## 🔧 Features

### ✉️ Gmail Integration

* Fetch and store emails (unread or all) from your Gmail account
* Parse sender, subject, and metadata
* Display and manage stored emails via web UI

### 🧠 AI Email Classifier

* Classifies emails into:

  * `Important`
  * `Data`
  * `Regular`
  * `Suspected Spam`
  * `Uncategorized`
* Uses OpenAI Assistants API with batch processing
* Avoids sending spammy emails to the AI using DNS-based reputation checks (Spamhaus)

### 🛀 Maintenance Tools

* Wipe email/reputation tables
* Fetch emails from the past 14 days
* Manually reclassify all uncategorized emails in batches
* Backup and restore email data

### 📊 Sender Reputation Tracking

* Tracks frequency and type of classification per sender
* Plans for half-life based scoring system (coming soon)
* Manual override support

### 💥 Web Interface

* Clean, fast, local UI built on FastAPI
* Tabs for Gmail, AI interactions, settings & debug tools
* Live watchdog status, unread counters, email browser

---

## 🚀 Getting Started

### Prerequisites

* Docker
* OpenAI API Key
* Gmail OAuth token (stored in `/data/token.json`)

### Clone and Run

```bash
git clone https://github.com/danhajduk/synthia-standalone.git
cd synthia-standalone
./deploy.sh
```

Then visit [http://localhost:5010](http://localhost:5010)

---

## 📂 Project Structure

```text
/app
👉️ main.py                # FastAPI entrypoint
👉️ gmail_service.py       # Gmail API interface
👉️ utils/
   👉️ database.py        # DB schema and helpers
   👉️ classifier.py      # AI + Spamhaus logic
👉️ routers/
   👉️ gmail.py           # Gmail routes
   👉️ openai_routes.py   # AI routes
   👉️ system.py          # Health and utility
👉️ static/                # Frontend assets
   👉️ index.html
   👉️ script.js
   👉️ pages/
```

---

## 🧪 Debug Tools

Located under the `Settings → Debug` section:

* Fetch 14 days of email history
* Batch reclassify any uncategorized emails
* Backup/restore `emails` table
* View system status (watchdog)

---

## 🛡 Privacy

All data remains local — your emails and OpenAI prompts are processed privately inside your own Docker container. No analytics or external telemetry.

---

## 📄 License

MIT

---

> Made with ❤️ by Dan Hajduk

# 📬 Synthia Gmail Classifier – Project Todo List

## ✅ Completed

### 🔄 Email Classification & Training

* ✅ MultinomialNB - Pre-classification
* ✅ Human-in-the-Loop Training
  * ✅ Manual classification UI + override flag
* ✅ Save trained local model to disk (joblib)
* ✅ Store manual classifications with timestamp and override flag
* ✅ Use `predict_proba()` for confidence levels

### 🧠 Sender Reputation System

* ✅ Maintain classification history per sender
* ✅ Use weighted scoring: `Important` adds trust, `Spam` subtracts
* ✅ Spamhaus Integration
  * ✅ Lookup + auto-classify as `Suspected Spam`
* ✅ Manual Override
  * ✅ Enforced + stored in DB

### 🧰 Maintenance & Cleanup

* ✅ Clear Classification State
  * ✅ Button to delete all classification data
* ✅ Database Vacuuming
* ✅ Integrity Checks on startup

### 📊 UI Enhancements

* ✅ Dashboard Indicators
  * ✅ Show total + unclassified count
* ✅ In-Place Editing
  * ✅ Inline category selector in email table
* ✅ Filter by sender/category

### ⚙️ Advanced Debug & Tools

* ✅ Manual Execution Controls
  * ✅ Step-by-step tools for fetching, classifying, reputation updating

* ✅ Fetch Email Functionality
  * ✅ Snippet stored as body
  * ✅ Upsert logic only updates: sender, sender_email, subject, body, received_at

---

## 🔧 In Progress

### 🔄 Email Classification & Training

* 🚧 Hybrid Classification Pipeline
  * Use local first, send uncertain to OpenAI (pending confidence threshold logic)
* 🚧 Model Management
  * Training + evaluation complete; versioning/rollback system pending
* 🚧 Confidence Scoring
  * Logging implemented, needs UI surfacing
* 🚧 Active Learning Loop
  * Backend logic planned; UI for exposing low-confidence samples still needed

### 🧠 Sender Reputation System

* 🚧 Reputation Decay Logic
  * Age-based scoring decay not yet implemented
* 🚧 Feedback Loop into Classifier
  * Sender score as model input feature planned but not wired

### 🧰 Maintenance & Cleanup

* 🚧 Auto-Prune Aged Emails
  * Logic to delete emails older than 90 days not yet scheduled
* 🚧 Backup & Restore
  * Export/restore via endpoint or UI still needed

### 📊 UI Enhancements

* 🚧 Category Legend
  * Not shown yet in Gmail tab
* 🚧 Color badges/icons for categories
  * Used in reputation tab; partially used in email table
* 🚧 Highlight Low-Confidence Predictions
  * To-do: Visual cues in UI (e.g. faded, alert color, etc.)

### ⚙️ Advanced Debug & Tools

* 🚧 Batch Execution Log
  * Logging present; no UI or persistent storage yet

---

## 📝 Planned / Future

### 🔄 Email Classification & Training

* 🧠 Learn user-defined tagging patterns
* 🛠️ Make labels customizable in UI
* 👤 Per-User Profile Adaptation
  * Adapt classification based on user/session behavior

---


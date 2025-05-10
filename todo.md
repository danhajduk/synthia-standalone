# 📬 Synthia Gmail Classifier – Project Todo List

## ✅ Completed

*

---

## 🔧 In Progress / Planned

### 🔄 Email Classification & Training

* MultinomialNB - Pre-classification

* 🧑‍🏫 Human-in-the-Loop Training

  * Allow manual classification of emails to serve as ground truth
  * Store manual classifications with timestamp and override flag
  * Feed labeled emails into model training pipeline

* 🧩 Model Management

  * Save trained local model to disk (joblib or pickle)
  * Periodically retrain model with new labeled data
  * Implement model versioning and rollback mechanism

* 🤖 Hybrid Classification Pipeline

  * Use local model for initial classification
  * Send only uncertain or flagged emails to OpenAI assistant
  * Threshold for "uncertain" based on confidence score

* ⚠️ Confidence Scoring

  * Use `predict_proba()` for confidence levels
  * Log and surface low-confidence predictions for review

* 🏷️ Custom Labels & Categories

  * Expand beyond basic labels (Important, Spam, etc.)
  * Learn user-defined tagging patterns
  * Make labels customizable in UI

* 📈 Active Learning Loop

  * Periodically present uncertain classifications to the user for validation.
  * Prioritize samples near the decision boundary to improve model efficiently.

* 🎯 Per-User Profile Adaptation

  * Track classification patterns by individual users (or sessions).
  * Adjust model behavior dynamically for user-specific preferences.

### 🧠 Sender Reputation System

* 📊 Dynamic Reputation Scoring

  * Maintain classification history per sender
  * Use weighted scoring: `Important` adds trust, `Spam` subtracts
  * Apply decay over time to reduce weight of older classifications

* 🧼 Spamhaus Integration

  * Check senders against the DBL (Domain Block List)
  * Automatically mark listed domains as `Suspected Spam`
  * Bypass AI classification for listed senders

* ✋ Manual Override

  * Allow user to force classification of a sender (e.g. always trusted)
  * Store override flag and surface in UI
  * Prevent AI or reputation score from altering manual override

* 📉 Reputation Decay Logic

  * Score slowly returns to neutral unless reinforced by consistent classifications
  * Configurable half-life for classification impact

* 🔄 Feedback Loop into Classifier

  * Include sender reputation score as a feature in ML model
  * Improve model contextual understanding of sender trust

### 🧰 Maintenance & Cleanup

* 🗑️ Auto-Prune Aged Emails

  * Automatically delete emails older than 90 days
  * Schedule periodic cleanup on startup or via cron-like job

* 🧹 Clear Classification State

  * Button to delete all classification data (emails, labels, reputations)
  * Useful for hard reset or retraining from scratch

* 🧾 Backup & Restore

  * Allow export of database (emails + reputation) to a file
  * Allow restoring from a backup
  * Optionally automate periodic backups

* 🧼 Database Vacuuming

  * Run SQLite `VACUUM` command periodically or manually to reclaim space

* 🧪 Integrity Checks

  * Verify DB schema integrity on startup
  * Auto-migrate if schema version changes

### 📊 UI Enhancements

* 📋 Dashboard Indicators

  * Show total email count and number of unclassified emails
  * Add warning badge for backlog (e.g. > 100 unclassified)

* 🧠 Category Legend

  * Add UI legend to explain each classification category
  * Provide hover tooltips or expandable help modal

* 🎨 Improved Email Table

  * Use icons and color badges for categories
  * Highlight low-confidence predictions visually
  * Allow sorting/filtering by sender, category, or confidence

* 📝 In-Place Editing

  * Allow user to change category inline in table

### ⚙️ Advanced Debug & Tools

* 🧪 Manual Execution Controls

  * ☑️ Step 1: Fetch emails from last 2 days (on-demand)
  * ☑️ Step 2: Run local pre-classification
  * ☑️ Step 3: Run OpenAI remote classification
  * ☑️ Step 4: Update sender reputation
  * ☑️ Step 5: Save final labels
  * Add a toggle to run full pipeline or step-by-step

* 📜 Batch Execution Log

  * Store a log of batch operations (timestamp, step, result)
  * Show recent batch history in UI

---

Let me know which one you'd like to work on next!

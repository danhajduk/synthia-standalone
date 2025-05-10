📬 Synthia Gmail Classifier – Project Todo List
✅ Completed
🔄 Email Classification & Training
MultinomialNB - Pre-classification

Human-in-the-Loop Training

Manual classification UI + override flag

Save trained local model to disk (joblib)

Store manual classifications with timestamp and override flag

Use predict_proba() for confidence levels

🧠 Sender Reputation System
Maintain classification history per sender

Use weighted scoring: Important adds trust, Spam subtracts

Spamhaus Integration

Lookup + auto-classify as Suspected Spam

Manual Override

Enforced + stored in DB

🧰 Maintenance & Cleanup
Clear Classification State

Button to delete all classification data

Database Vacuuming

Integrity Checks on startup

📊 UI Enhancements
Dashboard Indicators

Show total + unclassified count

In-Place Editing

Inline category selector in email table

Filter by sender/category

⚙️ Advanced Debug & Tools
Manual Execution Controls

Step-by-step tools for fetching, classifying, reputation updating

🔧 In Progress
🔄 Email Classification & Training
Hybrid Classification Pipeline

Use local first, send uncertain to OpenAI (pending confidence logic)

Model Management

Training + evaluation complete; needs versioning/rollback

Confidence Scoring

Logging implemented, needs UI surfacing

Active Learning Loop

Not yet exposing low-confidence samples for review

🧠 Sender Reputation System
Reputation Decay Logic

Age-based scoring decay not yet implemented

Feedback Loop into Classifier

Sender score as input feature is planned

🧰 Maintenance & Cleanup
Auto-Prune Aged Emails

Scheduled deletion not yet added

Backup & Restore

Export/restore via endpoint or UI still needed

📊 UI Enhancements
Category Legend

Not shown yet in Gmail tab

Color badges/icons for categories

Used in reputation tab; partial in email table

Highlight low-confidence predictions

To-do: Visual cues in UI

⚙️ Advanced Debug & Tools
Batch Execution Log

Logging in backend; no UI history or persistence yet

📝 Planned / Future
🔄 Email Classification & Training
Learn user-defined tagging patterns

Make labels customizable in UI

Per-User Profile Adaptation


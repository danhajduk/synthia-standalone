# 🧠 Synthia Standalone

**Synthia Standalone** is a full-stack AI assistant for intelligent Gmail classification and analysis. It combines a FastAPI backend with a modern React frontend to help you review, classify, and manage your inbox using local machine learning and OpenAI.

---

## 🚀 Features

### ✉️ Gmail Email Classification

* Automatically fetch and categorize emails
* Use local ML (Multinomial Naive Bayes) for high-speed predictions
* Delegate uncertain or complex cases to OpenAI
* Manually override and reclassify emails

### 🤖 AI Integration

* OpenAI-powered classification for edge cases
* Human-in-the-loop labeling
* Reputation-based trust scoring per sender
* Confidence tracking and active learning

### 🧑‍💻 Web UI (React)

* Responsive, modern React dashboard
* Email filters, labels, and confidence indicators
* Manual correction tools and batch logs
* Settings and system maintenance controls

---

## 🗂️ Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── routers/         # FastAPI route handlers
│   │   ├── utils/           # Helper functions and models
│   │   ├── main.py          # FastAPI entry point
│   │   ├── database.py      # SQLite connection
│   │   ├── classifier.py    # ML and OpenAI pipeline
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI elements
│   │   ├── pages/           # Views: Inbox, Classifier, Settings
│   │   ├── hooks/           # Data fetching logic
├── data/                    # SQLite database
├── run.sh                   # Launcher script
└── todo.md                  # Project roadmap and tasks
```

---

## 🧪 Workflow

1. Fetch new emails (manual or scheduled)
2. Classify using local model (if confident)
3. Route low-confidence messages to OpenAI
4. Display results in UI with confidence tags
5. Let the user reclassify, fix, or approve
6. Use new labels to retrain and improve model

---

## 📅 Roadmap Highlights

> From `todo.md`

### 🔄 Classification Engine

* Local + OpenAI hybrid classification
* Manual labeling and confidence scoring
* Active learning loop and retraining pipeline

### 🧠 Sender Reputation

* Dynamic trust score per sender
* Override system and DBL blacklist integration
* Feed reputation into classification model

### 📊 UI Improvements

* Label legends, color badges, filters
* Backlog alerts and sort by confidence
* Inline editing of email tags

### 🛠️ Maintenance

* Clear state, run batch steps manually
* Auto-clean aged emails
* Backup/restore database

---

## 🧑‍💻 Contributing

Contributions welcome! Check `todo.md` for ideas or submit a pull request to help expand features, improve classification accuracy, or enhance the UI.

---

## 📄 License

MIT License – see [`LICENSE`](LICENSE)

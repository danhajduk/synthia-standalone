# 📚 API Route Mapping – Synthia Gmail Classifier

This document maps all FastAPI routes implemented across the Synthia Gmail Classifier backend. Each section corresponds to a dedicated router file.

---

## 📊 Email Stats Router (`stats.py`)

### `GET /stats`

* **Description:** Returns total email count and number of unclassified emails.
* **Response:**

  ```json
  {
    "total": <int>,
    "unclassified": <int>
  }
  ```

---

## 🧠 Sender Reputation Router (`reputation.py`)

### `GET /reputation`

* **Description:** Lists up to 100 senders with highest reputation scores.
* **Response:**

  ```json
  {
    "senders": [
      {
        "email": "sender@example.com",
        "name": "Sender Name",
        "score": 42.5,
        "state": "trusted",
        "counts": {"Important": 5, "Spam": 1},
        "updated": "2024-01-01T12:00:00"
      },
      ...
    ]
  }
  ```

### `POST /reputation/recalculate`

* **Description:** Recalculates reputation scores from existing email data.
* **Response:**

  ```json
  {
    "status": "recalculated",
    "senders_updated": <int>
  }
  ```

---

## 📬 Email Management Router (`email.py`)

### `GET /list`

* **Description:** Returns the 100 most recent emails.

### `GET /labels`

* **Description:** Returns all available labels.

### `GET /unread`

* **Description:** Returns count of unclassified emails received since midnight (local time).

### `GET /count`

* **Description:** Returns total number of emails stored in the system.

---

## 📥 Gmail Sync & Classification Router (`gmail.py`)

### `GET /`

* **Description:** Test endpoint.

### `GET /fetch`

* **Description:** Fetch unread emails since midnight and insert them.
* **Response:**

  ```json
  {
    "fetched": <int>,
    "inserted": <int>
  }
  ```

### `GET /debug/fetch14`

* **Description:** Fetches all emails from the past 90 days excluding today.
* **Response:**

  ```json
  {
    "fetched": <int>,
    "inserted": <int>
  }
  ```

### `GET /debug/classify-all`

* **Description:** Classifies all unclassified emails in batches of 20.
* **Response:**

  ```json
  {
    "status": "completed",
    "batches": <int>,
    "total_classified": <int>,
    "remaining_unclassified": <int>
  }
  ```

---

## 🧪 System & Maintenance Router (`system.py`)

### `GET /api/hello`

* **Description:** Simple "Hello" response.

### `POST /api/clear_all_tables`

* **Description:** Deletes all data from `emails` and `sender_reputation` tables.

### `GET /model/metrics`

* **Description:** Returns ML model evaluation metrics from `system` table.
* **Response:**

  ```json
  {
    "accuracy": 0.93,
    "precision": 0.89,
    "recall": 0.91
  }
  ```

---

## 🤖 OpenAI Integration Routers (`openai_routes.py`)

### `POST /chat`

* **Description:** Sends a chat message to OpenAI Assistant and returns reply.
* **Input:**

  ```json
  { "message": "Hello AI" }
  ```
* **Response:**

  ```json
  { "reply": "Hi there!" }
  ```

### `GET /cost`

* **Description:** Returns this month's OpenAI usage and account limit.

### `GET /usage` *(from `router_ai`)*

* **Description:** Returns OpenAI usage for current and previous months.
* **Response:**

  ```json
  {
    "this_month": 8.4321,
    "last_month": 15.9876
  }
  ```

---

✅ **End of Route Map**

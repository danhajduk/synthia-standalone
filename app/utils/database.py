# Standard library imports
from pathlib import Path
import sqlite3
import json
from datetime import datetime

# Path to the SQLite database
DB_PATH = "/data/gmail.sqlite"

# Fixed set of classification labels
LABELS = [
    ("Important", "High-priority or time-sensitive email"),
    ("Data", "Structured content or logs"),
    ("Regular", "Everyday correspondence"),
    ("Work", "Job-related or professional"),
    ("Personal", "From friends or family"),
    ("Social", "Social networks or events"),
    ("Newsletters", "Recurring content subscriptions"),
    ("Notifications", "Automated alerts from services"),
    ("Receipts", "Purchase confirmations or bills"),
    ("System Updates", "Platform or system notifications"),
    ("Uncategorized", "Not yet classified"),
    ("Flagged for Review", "User needs to check this"),
    ("Suspected Spam", "Likely spam, needs confirmation"),
    ("Confirmed Spam", "Verified as spam"),
    ("Phishing", "Dangerous or deceptive email"),
    ("Blacklisted", "Domain found in Spamhaus DBL")
]

def get_db_path():
    """
    Returns the path to the SQLite database file.
    """
    return DB_PATH

def initialize_database():
    """
    Initializes the SQLite database and creates required tables and labels.
    """
    Path("/data").mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Create system metadata table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)

    # Create labels table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS labels (
        label TEXT PRIMARY KEY,
        description TEXT,
        icon TEXT DEFAULT NULL
    )
    """)

    for label, description in LABELS:
        cursor.execute("""
            INSERT OR IGNORE INTO labels (label, description)
            VALUES (?, ?)
        """, (label, description))

    # Create the emails table with expanded structure
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        sender TEXT,
        subject TEXT,
        body TEXT,
        sender_email TEXT,
        received_at TIMESTAMP,
        category TEXT DEFAULT 'Uncategorized',
        predicted_by TEXT DEFAULT 'local',
        confidence REAL DEFAULT NULL,
        manual_override INTEGER DEFAULT 0,
        override_timestamp TIMESTAMP DEFAULT NULL,
        model_version TEXT DEFAULT NULL,
        FOREIGN KEY(category) REFERENCES labels(label)
    )
    """)

    # Create sender reputation table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sender_reputation (
        sender_email TEXT PRIMARY KEY,
        sender_name TEXT,
        classification_counts TEXT DEFAULT '{}',
        reputation_score REAL DEFAULT 0.0,
        manual_override TEXT DEFAULT NULL,
        origin_sources TEXT DEFAULT '[]',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reputation_state TEXT DEFAULT 'unknown'
    )
    """)

    conn.commit()
    conn.close()

def update_sender_reputation(sender_email, sender_name, classification):
    """
    Updates or inserts sender reputation based on a classification.
    Tracks category counts, score, and state.
    """
    try:
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        # Retrieve existing counts
        cursor.execute("SELECT classification_counts FROM sender_reputation WHERE sender_email = ?", (sender_email,))
        row = cursor.fetchone()
        now = datetime.utcnow().isoformat()

        if row:
            counts = json.loads(row[0])
            counts[classification] = counts.get(classification, 0) + 1
        else:
            counts = {classification: 1}

        score = calculate_reputation_score(counts)
        state = determine_reputation_state(score)

        if row:
            cursor.execute("""
                UPDATE sender_reputation
                SET classification_counts = ?, sender_name = ?, last_updated = ?,
                    reputation_score = ?, reputation_state = ?
                WHERE sender_email = ?
            """, (
                json.dumps(counts),
                sender_name,
                now,
                score,
                state,
                sender_email
            ))
        else:
            cursor.execute("""
                INSERT INTO sender_reputation (
                    sender_email, sender_name, classification_counts,
                    last_updated, reputation_score, reputation_state
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                sender_email,
                sender_name,
                json.dumps(counts),
                now,
                score,
                state
            ))

        conn.commit()
        conn.close()

    except Exception as e:
        print(f"⚠️ Error updating sender reputation for {sender_email}: {e}")

def calculate_reputation_score(counts: dict) -> float:
    """
    Computes a sender reputation score based on classification counts.
    """
    positive_labels = {"Important", "Work", "Personal", "Receipts"}
    negative_labels = {"Phishing", "Confirmed Spam", "Suspected Spam", "Blacklisted"}
    
    total = sum(counts.values())
    if total == 0:
        return 0.0

    positives = sum(counts.get(label, 0) for label in positive_labels)
    negatives = sum(counts.get(label, 0) for label in negative_labels)

    raw_score = (positives - negatives) / total
    normalized = max(0.0, min(1.0, (raw_score + 1) / 2))
    return round(normalized, 2)

def determine_reputation_state(score: float) -> str:
    """
    Maps score to a human-readable reputation category.
    """
    if score >= 0.8:
        return "trusted"
    elif score >= 0.5:
        return "neutral"
    elif score >= 0.2:
        return "flagged"
    else:
        return "dangerous"
def ensure_system_table():
    """
    Ensures the 'system' table exists for storing key-value system metadata.
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    conn.commit()
    conn.close()

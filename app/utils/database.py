from pathlib import Path
import sqlite3
import json

DB_PATH = "/data/gmail.sqlite"


def initialize_database():
    Path("/data").mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create email table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        sender TEXT,
        subject TEXT
    )
    """)

    # Add missing columns (try/catch for backward compatibility)
    try:
        cursor.execute("ALTER TABLE emails ADD COLUMN sender_email TEXT;")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE emails ADD COLUMN category TEXT DEFAULT 'Uncategorized';")
    except sqlite3.OperationalError:
        pass

    # Create sender reputation table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sender_reputation (
        sender_email TEXT PRIMARY KEY,
        sender_name TEXT,
        classification_counts TEXT DEFAULT '{}',
        reputation TEXT DEFAULT 'unknown'
    )
    """)

    conn.commit()
    conn.close()


def get_db_path():
    return DB_PATH

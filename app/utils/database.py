from pathlib import Path
import sqlite3
import json

# Path to the SQLite database
DB_PATH = "/data/gmail.sqlite"

def initialize_database():
    """
    Initializes the SQLite database by creating necessary tables and adding missing columns.
    Ensures backward compatibility by handling missing columns gracefully.
    """
    # Ensure the data directory exists
    Path("/data").mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create the emails table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        sender TEXT,
        subject TEXT
    )
    """)

    # Add missing columns to the emails table
    try:
        cursor.execute("ALTER TABLE emails ADD COLUMN sender_email TEXT;")
    except sqlite3.OperationalError:
        # Column already exists
        pass

    try:
        cursor.execute("ALTER TABLE emails ADD COLUMN category TEXT DEFAULT 'Uncategorized';")
    except sqlite3.OperationalError:
        # Column already exists
        pass

    # Create the sender_reputation table if it doesn't exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sender_reputation (
        sender_email TEXT PRIMARY KEY,
        sender_name TEXT,
        classification_counts TEXT DEFAULT '{}',
        reputation TEXT DEFAULT 'unknown'
    )
    """)

    # Commit changes and close the connection
    conn.commit()
    conn.close()

def get_db_path():
    """
    Returns the path to the SQLite database.
    """
    return DB_PATH

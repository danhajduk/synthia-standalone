from pathlib import Path
import sqlite3
import json
from datetime import datetime

# Path to the SQLite database
DB_PATH = "/data/gmail.sqlite"

def initialize_database():
    """
    Initializes the SQLite database by creating necessary tables if they do not already exist.

    This function ensures the database is ready for use by:
    - Creating the `emails` table to store email metadata.
    - Creating the `sender_reputation` table to track sender reputation and classification data.

    The function also ensures that the `/data` directory exists before attempting to create the database file.
    """
    # Ensure the data directory exists
    Path("/data").mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create the emails table if it doesn't already exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,  -- Unique identifier for the email
        sender TEXT,          -- Name of the sender
        subject TEXT,         -- Subject of the email
        sender_email TEXT,    -- Email address of the sender
        category TEXT DEFAULT 'Uncategorized'  -- Category of the email
    )
    """)

    # Create the sender_reputation table with enhanced structure
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sender_reputation (
        sender_email TEXT PRIMARY KEY,          -- Email address of the sender
        sender_name TEXT,                       -- Name of the sender
        classification_counts TEXT DEFAULT '{}', -- JSON string of classification counts
        reputation_score REAL DEFAULT 0.0,      -- Numeric reputation score
        manual_override TEXT DEFAULT NULL,      -- Manual override for reputation
        origin_sources TEXT DEFAULT '[]',       -- JSON string of origin sources
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last updated timestamp
        reputation_state TEXT DEFAULT 'unknown' -- Current reputation state
    )
    """)

    # Commit changes and close the connection
    conn.commit()
    conn.close()

def get_db_path():
    """
    Returns the path to the SQLite database.

    This function provides a centralized way to retrieve the database path, ensuring consistency
    across the application.

    Returns:
        str: The path to the SQLite database file.
    """
    return DB_PATH

def update_sender_reputation(sender_email, sender_name, classification):
    """
    Updates the sender reputation table with classification counts and metadata.

    This function performs the following:
    - Checks if the sender already exists in the `sender_reputation` table.
    - If the sender exists, it updates the classification counts and metadata (e.g., last updated timestamp).
    - If the sender does not exist, it inserts a new row with the provided data.

    Args:
        sender_email (str): The email address of the sender.
        sender_name (str): The name of the sender.
        classification (str): The classification category to increment in the counts.

    Raises:
        Exception: If any error occurs during the database operation, it logs the error and raises it.
    """
    try:
        conn = sqlite3.connect(get_db_path())
        cursor = conn.cursor()

        # Fetch the current row for the sender if it exists
        cursor.execute("SELECT classification_counts FROM sender_reputation WHERE sender_email = ?", (sender_email,))
        row = cursor.fetchone()

        # Get the current timestamp
        now = datetime.utcnow().isoformat()

        if row:
            # Parse existing classification counts
            counts = json.loads(row[0])
            counts[classification] = counts.get(classification, 0) + 1  # Increment the count for the classification

            # Update the existing row with new counts and metadata
            cursor.execute("""
                UPDATE sender_reputation
                SET classification_counts = ?, sender_name = ?, last_updated = ?
                WHERE sender_email = ?
            """, (json.dumps(counts), sender_name, now, sender_email))
        else:
            # Initialize classification counts for a new sender
            counts = {classification: 1}
            cursor.execute("""
                INSERT INTO sender_reputation (sender_email, sender_name, classification_counts, last_updated)
                VALUES (?, ?, ?, ?)
            """, (sender_email, sender_name, json.dumps(counts), now))

        # Commit changes and close the connection
        conn.commit()
        conn.close()

    except Exception as e:
        # Log any errors that occur during the update
        print(f"⚠️ Error updating sender reputation for {sender_email}: {e}")

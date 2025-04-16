from pathlib import Path
import sqlite3
import json
from datetime import datetime

# Path to the SQLite database
DB_PATH = "/data/gmail.sqlite"

def initialize_database():
    """
    Initializes the SQLite database by creating necessary tables.
    """
    # Ensure the data directory exists
    Path("/data").mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create the emails table if it doesn't already exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,  
        sender TEXT,          
        subject TEXT,         
        sender_email TEXT,    
        category TEXT DEFAULT 'Uncategorized'  
    )
    """)

    # Create the sender_reputation table with enhanced structure
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

    # Commit changes and close the connection
    conn.commit()
    conn.close()

def get_db_path():
    """
    Returns the path to the SQLite database.
    """
    return DB_PATH

def update_sender_reputation(sender_email, sender_name, classification):
    """
    Updates the sender reputation table with classification counts and metadata.
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

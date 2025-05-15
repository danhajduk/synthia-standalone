# Standard library imports
import sqlite3
import logging
import json
from datetime import datetime

# Third-party imports
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from joblib import dump

# Application-specific imports
from app.utils.database import get_db_path

# Constants
MODEL_PATH = "/data/local_classifier.joblib"

def fetch_training_data(source="manual"):
    """
    Fetch sender, email, subject, and category from classified emails.
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sender, sender_email, subject, category FROM emails
        WHERE predicted_by = ? AND category IS NOT NULL
    """, (source,))
    rows = cursor.fetchall()
    conn.close()
    return rows

def combine_features(sender, email, subject):
    """
    Combine sender name, email address, and subject into one feature string.
    """
    return f"{sender} <{email}> - {subject}"

def train_local_classifier(source="manual"):
    """
    Train a local MultinomialNB model and evaluate on a hold-out test set.
    Saves model metrics in the `system` table.
    """
    logging.info(f"📚 Training local classifier on {source} labels...")
    rows = fetch_training_data(source)

    if not rows:
        logging.warning("⚠️ No training data available.")
        return False

    texts = [combine_features(sender, email, subject) for sender, email, subject, _ in rows]
    labels = [category for _, _, _, category in rows]

    # Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.1, random_state=42)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(lowercase=True, stop_words='english')),
        ('clf', MultinomialNB())
    ])

    pipeline.fit(X_train, y_train)
    dump(pipeline, MODEL_PATH)
    logging.info(f"✅ Model trained and saved to {MODEL_PATH} with {len(X_train)} training samples.")

    # Evaluate on test set
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    logging.info(f"📊 Evaluation on {len(X_test)} test samples:")
    logging.info(f"Accuracy: {acc:.2%}")
    logging.info("\n" + classification_report(y_test, y_pred))

    # Save metrics to the system table
    from app.utils.database import ensure_system_table
    ensure_system_table()

    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO system (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    """, ("local_model_evaluation", json.dumps({
        "source": source,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "accuracy": acc,
        "report": report,
        "timestamp": datetime.utcnow().isoformat()
    })))
    conn.commit()
    conn.close()

    return True
import logging
import re
from datetime import datetime, time
import pytz
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from email.utils import parseaddr  # ✅ Robust email parser

logging.basicConfig(level=logging.INFO)

class GmailService:
    """
    A service for interacting with the Gmail API to fetch and parse emails.
    """
    def __init__(self, token_path: str = "token.json"):
        """
        Initializes the Gmail service with the provided token file.
        """
        self.creds = Credentials.from_authorized_user_file(
            token_path,
            ["https://www.googleapis.com/auth/gmail.readonly"]
        )
        self.service = build("gmail", "v1", credentials=self.creds)

    def fetch_emails(self, since: str = None, unread_only: bool = False, max_results: int = 100):
        """
        Fetches emails from the Gmail API based on the provided filters.

        Args:
            since (str): Fetch emails received after this date.
            unread_only (bool): Whether to fetch only unread emails.
            max_results (int): Maximum number of emails to fetch.

        Returns:
            list: A list of parsed email data.
        """
        query_parts = []

        if since:
            local_tz = pytz.timezone("America/Los_Angeles")
            since_date = datetime.strptime(since, "%Y-%m-%d")
            local_midnight = local_tz.localize(datetime.combine(since_date, time.min))
            utc_midnight = local_midnight.astimezone(pytz.utc)
            timestamp = int(utc_midnight.timestamp())

            logging.info(f"🕒 Local midnight for {since}: {local_midnight.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            logging.info(f"🌐 UTC timestamp used: {timestamp} ({utc_midnight.strftime('%Y-%m-%d %H:%M:%S %Z')})")

            query_parts.append(f"after:{timestamp}")

        if unread_only:
            query_parts.append("is:unread")

        query = " ".join(query_parts)
        logging.info(f"📨 Fetching emails with query: '{query}'")

        messages = []
        try:
            # Fetch messages from Gmail
            response = self.service.users().messages().list(
                userId="me", q=query, maxResults=max_results
            ).execute()

            batch = response.get('messages', [])
            messages.extend(batch)
            logging.info(f"📦 Fetched {len(batch)} messages (initial batch)")

            # Handle pagination
            while 'nextPageToken' in response:
                response = self.service.users().messages().list(
                    userId="me", q=query, pageToken=response['nextPageToken']
                ).execute()
                batch = response.get('messages', [])
                messages.extend(batch)
                logging.info(f"➕ Fetched {len(batch)} more messages (paginated) out of {len(messages)} total)")

        except HttpError as e:
            logging.error(f"❌ Gmail API error: {e}")
            raise Exception(f"Gmail API error: {e}")

        # Parse email metadata
        email_data = []
        logging.info(f"📬 Parsing {len(messages)} messages...")
        for idx, msg in enumerate(messages, 1):
            try:
                msg_data = self.service.users().messages().get(
                    userId='me', id=msg['id'],
                    format='metadata',
                    metadataHeaders=['From', 'Subject']
                ).execute()

                headers = {h['name']: h['value'] for h in msg_data['payload']['headers']}
                sender_raw = headers.get('From', 'Unknown')
                subject = headers.get('Subject', '(No Subject)')

                logging.debug(f"🧪 Raw From header: {sender_raw}")
                sender_name, sender_email = parseaddr(sender_raw)
                if not sender_name:
                    sender_name = sender_email

                logging.debug(f"✅ Parsed email: {sender_name} <{sender_email}> | {subject}")

                timestamp = int(msg_data.get("internalDate", 0)) / 1000
                received_at = datetime.utcfromtimestamp(timestamp).isoformat()

                email_data.append({
                    "id": msg['id'],
                    "sender": sender_name,
                    "email": sender_email,
                    "subject": subject,
                    "received_at": received_at
                })

            except Exception as e:
                logging.warning(f"⚠️ Failed to parse message {msg.get('id')}: {e}")

            # Progress log every 100 messages
            if idx % 100 == 0 or idx == len(messages):
                logging.info(f"📦 Parsed {idx}/{len(messages)} messages ({(idx / len(messages)) * 100:.1f}%)...")
        logging.info(f"📬 Total parsed emails: {len(email_data)}")
        return email_data

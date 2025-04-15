# gmail_service.py

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime
import re

class GmailService:
    def __init__(self, token_path: str = "token.json"):
        self.creds = Credentials.from_authorized_user_file(
            token_path,
            ["https://www.googleapis.com/auth/gmail.readonly"]
        )
        self.service = build("gmail", "v1", credentials=self.creds)

    def fetch_emails(self, since: str = None, unread_only: bool = False, max_results: int = 100):
        query_parts = []
        if since:
            query_parts.append(f"after:{since}")
        if unread_only:
            query_parts.append("is:unread")
        query = " ".join(query_parts)

        messages = []
        try:
            response = self.service.users().messages().list(
                userId="me", q=query, maxResults=max_results
            ).execute()
            messages.extend(response.get('messages', []))

            while 'nextPageToken' in response:
                response = self.service.users().messages().list(
                    userId="me", q=query, pageToken=response['nextPageToken']
                ).execute()
                messages.extend(response.get('messages', []))
        except HttpError as e:
            raise Exception(f"Gmail API error: {e}")

        # Return simplified metadata
        email_data = []
        for msg in messages:
            msg_data = self.service.users().messages().get(
                userId='me', id=msg['id'],
                format='metadata',
                metadataHeaders=['From', 'Subject']
            ).execute()

            headers = {h['name']: h['value'] for h in msg_data['payload']['headers']}
            sender_raw = headers.get('From', 'Unknown')
            subject = headers.get('Subject', '(No Subject)')

            match = re.match(r'(?:"?([^"<]*)"?\s)?<?([^<>]+)>?', sender_raw)
            sender_name = match.group(1) or match.group(2) if match else sender_raw
            sender_email = match.group(2) if match else ""

            email_data.append({
                "id": msg['id'],
                "sender": sender_name,
                "email": sender_email,
                "subject": subject
            })

        return email_data

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle
import os
import json

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def main():
    creds = None
    flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
    creds = flow.run_local_server(port=0)

    # Save token.json
    with open("token.json", "w") as token_file:
        token_file.write(creds.to_json())

    print("✅ token.json created successfully.")

if __name__ == "__main__":
    main()

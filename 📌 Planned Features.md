📌 Planned Features
1. Email Auto-Classification with OpenAI
Send email metadata (ID, sender name, email, subject) in batch JSON

Use OpenAI assistant with a function call for classification

Categories:

Important – summarized and deeply inspected

Data – scanned for key information

Regular – no special action

Suspected Spam – ignored but shown with override option

Uncategorized – default fallback

Update the local DB with returned category

2. Parse Actionable Data from Emails
For Important/Data emails:

Use OpenAI to extract actionable items (e.g., tasks, events, deadlines)

Store in a tasks or events table

Future-proof design for calendar integration (e.g., Google Calendar)

3. Sender Reputation Tracking
New table: sender_reputation with:

sender_name, sender_email, status (e.g., safe, suspected)

Auto-classify future emails:

If >5 prior emails from sender marked as Suspected Spam → auto-flag

If any prior email marked as Important, Data, or Regular → mark sender as safe

4. Notification / Summary System
Provide a daily summary:

New Important or Data emails

Parsed tasks/events

Optional Home Assistant or push notifications

Toggle settings in UI to enable/disable notifications
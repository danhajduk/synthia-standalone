# Synthia Standalone

Synthia is a standalone application that integrates Gmail, OpenAI, and other utilities to provide a seamless experience for managing emails, interacting with AI, and performing system maintenance.

## Features

- **Gmail Integration**: Fetch, store, and categorize emails. View unread emails and manage email data.
- **AI Assistant**: Chat with an AI assistant powered by OpenAI and track usage statistics.
- **System Maintenance**: Clear database tables and monitor system status.
- **Web Interface**: A user-friendly interface for interacting with the application.

## Project Structure

```
/app
  ├── routers/          # API route handlers
  ├── static/           # Static files (HTML, CSS, JS)
  ├── utils/            # Utility modules (e.g., database, classifiers)
  ├── main.py           # Entry point for the FastAPI application
  ├── gmail_service.py  # Gmail API integration
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js (for frontend development, if needed)
- Gmail API credentials
- OpenAI API keys

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/synthia-standalone.git
   cd synthia-standalone
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key.
   - `OPENAI_ADMIN_API_KEY`: Admin API key for OpenAI usage tracking.
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Gmail API credentials JSON file.

4. Initialize the database:
   ```bash
   python -c "from utils.database import initialize_database; initialize_database()"
   ```

5. Start the application:
   ```bash
   uvicorn app.main:app --reload
   ```

6. Access the application at `http://127.0.0.1:8000`.

## Usage

### Web Interface

- **Home**: Test the backend and view the welcome message.
- **Gmail**: Fetch emails, view unread counts, and manage stored emails.
- **AI**: Chat with the AI assistant and view usage statistics.
- **Settings**: Perform maintenance tasks like clearing database tables.

### API Endpoints

- `/api/gmail/fetch`: Fetch emails from Gmail.
- `/api/gmail/list`: List stored emails.
- `/api/openai/chat`: Interact with the AI assistant.
- `/api/ai/usage`: Get OpenAI usage statistics.

## Development

### Frontend

Static files are located in the `static/` directory. Modify the HTML, CSS, or JavaScript files as needed.

### Backend

The backend is built with FastAPI. Add or modify routes in the `routers/` directory.

### Testing

Run tests (if implemented) using:
```bash
pytest
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [OpenAI](https://openai.com/)
- [Google Gmail API](https://developers.google.com/gmail/api)

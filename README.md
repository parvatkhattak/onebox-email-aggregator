# Onebox Email Aggregator

A feature-rich email aggregator similar to Reachinbox with real-time IMAP synchronization, AI-powered categorization using Google Gemini, Elasticsearch storage, and a modern React frontend.

![Onebox Email Aggregator](https://img.shields.io/badge/Status-Production%20Ready-green)

## ✨ Features

- 📧 **Real-time Email Sync**: Persistent IMAP connections with IDLE mode for instant email delivery
- 🤖 **AI Categorization**: Google Gemini AI automatically categorizes emails into:
  - Interested
  - Meeting Booked
  - Not Interested
  - Spam
  - Out of Office
- 💬 **AI Reply Suggestions**: Get intelligent, context-aware reply suggestions
- 🔍 **Powerful Search**: Elasticsearch-powered search with filters for account, folder, and category
- 🔔 **Slack Notifications**: Get notified on Slack for "Interested" emails
- 🪝 **Webhook Integration**: Trigger external automations for interested emails
- 🎨 **Modern UI**: Beautiful, responsive React frontend with glassmorphism and vibrant gradients
- 🔐 **Secure**: Encrypted credential storage for email accounts

A feature-rich Onebox email aggregator that synchronizes multiple IMAP accounts in real-time, categorizes emails using AI, and provides a seamless, searchable experience.

## 🚀 Features Implemented

- [x] **Real-Time Email Synchronization**: Syncs multiple IMAP accounts using persistent IDLE connections (no cron jobs). Fetches last 30 days of emails.
- [x] **Searchable Storage**: Emails are indexed in a locally hosted Elasticsearch instance for instant search.
- [x] **AI-Based Categorization**: Automatically categorizes emails into "Interested", "Meeting Booked", "Not Interested", "Spam", etc. using Google Gemini.
- [x] **Slack & Webhook Integration**: Sends notifications to Slack and triggers webhooks for "Interested" emails.
- [x] **Frontend Interface**: Modern React UI to view emails, filter by account, and search.
- [x] **AI-Powered Suggested Replies**: Generates context-aware replies using RAG (Retrieval-Augmented Generation) with product knowledge.

## 🛠️ Architecture

1.  **Backend (Node.js/Express)**:
    *   `imapService`: Manages persistent IMAP connections using `imapflow`.
    *   `elasticsearchService`: Handles indexing and searching of emails.
    *   `aiCategorizer`: Uses Google Gemini to categorize emails and suggest replies.
    *   `notificationService`: Sends Slack alerts and webhooks.
2.  **Database**:
    *   **Elasticsearch**: Stores email content for search.
    *   **SQLite/JSON**: Stores account credentials (encrypted).
3.  **Frontend (React/Vite)**:
    *   Real-time updates via Socket.IO.
    *   Modern, responsive UI with dark mode.

## 📦 Setup & Usage

### Prerequisites
- Node.js (v18+)
- Docker (for Elasticsearch)
- Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd onebox-email-aggregator
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    cd frontend && npm install && cd ..
    ```

3.  **Start Elasticsearch**:
    ```bash
    docker-compose up -d
    ```

4.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ELASTICSEARCH_URL=http://localhost:9200
    PORT=3000
    ```

5.  **Run the Application**:
    ```bash
    npm run dev
    ```
    This starts both the backend (port 3000) and frontend (port 5173).

### Using the Features

1.  **Add Account**: Click "+ Add Account" and enter your IMAP credentials (use App Password for Gmail).
2.  **View Emails**: Emails will sync automatically. Watch them appear in real-time!
3.  **Search**: Use the search bar to find emails by keyword (e.g., "AI", "Job").
4.  **AI Reply**: Open an email and click "✨ Suggest Reply" to generate a context-aware response.

## 🧪 Testing

- **Backend Logs**: Check `backend.log` for sync status and AI categorization logs.
- **AI Reply**: The system uses a predefined "Product Context" to generate relevant replies.

---
Built for ReachInbox Assignment.

4. **Start the backend server**:
   ```bash
   npm run dev
   ```

5. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser** to `http://localhost:5173`

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Google Gemini AI (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Notifications (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
WEBHOOK_URL=your_external_webhook_url_here

# Security
ENCRYPTION_KEY=change-this-to-a-secure-32-character-key
```

## 🎯 Usage

### Adding Email Accounts

1. Click the "⚙️ Accounts" button in the header
2. Click "+ Add Account"
3. Enter your email credentials:
   - **Email**: your.email@example.com
   - **Password**: Your IMAP password or app-specific password
   - **Host**: IMAP server (e.g., `imap.gmail.com`)
   - **Port**: Usually `993` for SSL/TLS
   - **TLS**: Enable for secure connections

**For Gmail users**: You need to create an [App Password](https://myaccount.google.com/apppasswords) instead of your regular password.

### Viewing and Managing Emails

- Emails are automatically synced in real-time
- Use the search bar to filter by keywords, account, or category
- Click on any email to view details
- Use the "✨ Suggest Reply" button to get AI-powered reply suggestions

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React UI      │─────▶│  Express Server  │─────▶│  Elasticsearch  │
│  (Frontend)     │◀─────│   (Backend)      │◀─────│   (Storage)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                  │
                                  ├──────▶ IMAP Servers (Gmail, etc.)
                                  ├──────▶ Google Gemini AI
                                  ├──────▶ Slack (Notifications)
                                  └──────▶ Webhooks (Automation)
```

## 📁 Project Structure

```
├── src/                      # Backend source code
│   ├── server.ts            # Main Express server
│   ├── imapService.ts       # IMAP connection & sync
│   ├── elasticsearchService.ts # Email indexing & search
│   ├── aiCategorizer.ts     # Google Gemini integration
│   ├── notificationService.ts # Slack & webhooks
│   └── databaseService.ts   # Account management
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx          # Main app component
│   │   ├── api.ts           # API client
│   │   └── index.css        # Modern design system
│   └── package.json
├── docker-compose.yml       # Elasticsearch setup
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Accounts
- `GET /api/accounts` - List all email accounts
- `POST /api/accounts` - Add new email account
- `DELETE /api/accounts/:id` - Remove email account

### Emails
- `GET /api/emails` - Search emails with filters
- `GET /api/emails/:id` - Get email details
- `POST /api/emails/:id/categorize` - Update email category
- `POST /api/emails/:id/suggest-reply` - Get AI reply suggestion

## 🎨 Design System

The frontend uses a modern design system featuring:
- **Vibrant Gradients**: Purple, pink, blue color schemes
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Dark Mode**: Eye-friendly dark theme
- **Smooth Animations**: Fade-in effects and hover transitions
- **Custom Scrollbars**: Styled for consistency
- **Responsive Layout**: Works on all screen sizes

## 🐛 Troubleshooting

### Elasticsearch connection issues
```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# Restart Elasticsearch
docker-compose restart
```

### IMAP connection errors
- Verify your email credentials
- For Gmail: Use an App Password, not your regular password
- Check if IMAP is enabled in your email settings
- Verify the correct IMAP host and port

### Frontend not connecting to backend
- Ensure backend is running on port 3000
- Check CORS settings if using a different port
- Verify `VITE_API_URL` in frontend `.env` if needed

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Made with ❤️ using React, Express, Elasticsearch & Google Gemini AI

# Onebox Email Aggregator

A feature-rich AI-powered email aggregator with real-time IMAP synchronization, Google Gemini AI categorization, Elasticsearch storage, and a modern React frontend.

![Onebox Email Aggregator](https://img.shields.io/badge/Status-Production%20Ready-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

- 📧 **Real-time Email Sync**: Persistent IMAP connections with IDLE mode for instant email delivery
- 🤖 **AI Categorization**: Google Gemini AI automatically categorizes emails into:
  - Interested
  - Meeting Booked
  - Not Interested
  - Spam
  - Out of Office
- 💬 **AI Reply Suggestions**: Context-aware reply generation using RAG (Retrieval-Augmented Generation)
- 🔍 **Powerful Search**: Elasticsearch-powered search with filters for account, folder, and category
- 🔔 **Slack Notifications**: Automatic notifications for "Interested" emails
- 🪝 **Webhook Integration**: Trigger external automations for interested emails
- ⚙️ **Frontend Account Management**: Add/remove email accounts directly from the UI
- 🔧 **Settings UI**: Configure Slack and webhook integrations from the frontend
- 🎨 **Modern UI**: Beautiful, responsive React frontend with glassmorphism and vibrant gradients
- 🔐 **Secure**: Encrypted credential storage for email accounts

## 🛠️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React UI      │─────▶│  Express Server  │─────▶│  Elasticsearch  │
│  (Frontend)     │◀─────│   (Backend)      │◀─────│   (Storage)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         ↕                        │
    Socket.IO                     ├──────▶ IMAP Servers (Gmail, etc.)
                                  ├──────▶ Google Gemini AI
                                  ├──────▶ Slack (Notifications)
                                  └──────▶ Webhooks (Automation)
```

**Components:**
- **Backend (Node.js/Express)**: API server with real-time Socket.IO updates
  - `imapService`: Manages persistent IMAP connections using `imapflow`
  - `elasticsearchService`: Handles indexing and searching of emails
  - `aiCategorizer`: Uses Google Gemini for categorization and reply suggestions
  - `notificationService`: Sends Slack alerts and webhooks
  - `databaseService`: Manages account credentials with encryption
  - `settingsService`: Persists integration settings
- **Database**: Elasticsearch for email storage, JSON files for account/settings data
- **Frontend (React/Vite)**: Modern SPA with real-time updates

## 📦 Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- Docker (for Elasticsearch)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/parvatkhattak/onebox-email-aggregator.git
   cd onebox-email-aggregator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Start Elasticsearch with Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Configure Environment Variables**:
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   FRONTEND_URL=http://localhost:5173

   # Elasticsearch
   ELASTICSEARCH_URL=http://localhost:9200

   # Google Gemini AI (Required)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Security
   ENCRYPTION_KEY=change-this-to-a-secure-32-character-key
   ```
   
   > **Note**: Slack and webhook URLs can now be configured from the frontend Settings page!

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

6. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser** to `http://localhost:5173`

## 🎯 Usage Guide

### 1. Adding Email Accounts

1. Click the **⚙️ Accounts** button in the header
2. Click **+ Add Account**
3. Enter your email credentials:
   - **Email**: your.email@example.com
   - **Password**: Your IMAP password or app-specific password
   - **Host**: IMAP server (e.g., `imap.gmail.com`)
   - **Port**: Usually `993` for SSL/TLS
   - **TLS**: Enable for secure connections

> **For Gmail users**: Create an [App Password](https://myaccount.google.com/apppasswords) instead of using your regular password.

### 2. Configuring Integrations

1. Click the **🔧 Settings** button in the header
2. **Slack Webhook URL** (optional):
   - Get your webhook URL from [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
   - Paste it in the Slack Webhook field
   - Receive notifications when emails are marked as "Interested"

3. **External Webhook URL** (optional):
   - Enter your automation service webhook URL (Zapier, Make.com, n8n, etc.)
   - Receives complete email data as JSON payload
   - Triggered when emails are categorized as "Interested"

4. Click **💾 Save Settings**

### 3. Managing Emails

- ✅ Emails sync automatically in real-time
- 🔍 Use the search bar to filter by keywords, account, or category
- 📧 Click on any email to view full details
- ✨ Click **Suggest Reply** to get AI-powered response suggestions
- �️ Categories are assigned automatically by Google Gemini AI

## 📁 Project Structure

```
onebox-email-aggregator/
├── src/                          # Backend source code
│   ├── server.ts                # Main Express server & API routes
│   ├── imapService.ts           # IMAP connection & real-time sync
│   ├── elasticsearchService.ts  # Email indexing & search
│   ├── aiCategorizer.ts         # Google Gemini AI integration
│   ├── notificationService.ts   # Slack & webhook notifications
│   ├── databaseService.ts       # Account management with encryption
│   └── settingsService.ts       # Integration settings persistence
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AccountManager.tsx
│   │   │   ├── EmailList.tsx
│   │   │   ├── EmailDetail.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── CategoryBadge.tsx
│   │   ├── App.tsx              # Main app component
│   │   ├── api.ts               # API client
│   │   └── index.css            # Modern design system
│   └── package.json
├── data/                         # Runtime data (gitignored)
│   ├── accounts.json            # Encrypted account credentials
│   └── settings.json            # Integration settings
├── docker-compose.yml           # Elasticsearch setup
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Account Management
- `GET /api/accounts` - List all email accounts
- `POST /api/accounts` - Add new email account
- `DELETE /api/accounts/:id` - Remove email account

### Email Operations
- `GET /api/emails` - Search emails with filters (query, accountId, category)
- `GET /api/emails/:id` - Get email details by ID
- `POST /api/emails/:id/categorize` - Update email category
- `POST /api/emails/:id/suggest-reply` - Get AI-generated reply suggestion

### Integration Settings
- `GET /api/settings` - Get current integration settings
- `POST /api/settings` - Update Slack and webhook URLs

### Health Check
- `GET /api/health` - Server health status

## 🎨 Design System

The frontend features a premium, modern design:

- **Vibrant Gradients**: Purple (#667eea) to violet (#764ba2) color schemes
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Dark Theme**: Eye-friendly dark mode with deep backgrounds
- **Smooth Animations**: Fade-in effects and hover transitions
- **Custom Components**: Reusable UI elements with consistent styling
- **Responsive Layout**: Mobile-friendly design
- **Custom Scrollbars**: Styled to match the theme

## 🐛 Troubleshooting

### Elasticsearch Connection Issues
```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# View logs
docker-compose logs elasticsearch

# Restart Elasticsearch
docker-compose restart elasticsearch
```

### IMAP Connection Errors
- ✅ Verify your email credentials are correct
- ✅ For Gmail: Use an App Password, not your regular password
- ✅ Check if IMAP is enabled in your email provider settings
- ✅ Verify the correct IMAP host and port (usually imap.gmail.com:993)
- ✅ Ensure TLS/SSL is enabled

### Frontend Not Connecting to Backend
- ✅ Ensure backend is running on port 3000
- ✅ Check browser console for CORS errors
- ✅ Verify Socket.IO connection in browser DevTools
- ✅ Check `VITE_API_URL` environment variable if needed

### AI Categorization Not Working
- ✅ Verify `GEMINI_API_KEY` is set correctly in `.env`
- ✅ Check backend logs for API errors
- ✅ Ensure you have API quota available on your Gemini account

## 🔒 Security Notes

- Email passwords are encrypted using AES-256 before storage
- Never commit `.env` files or the `data/` directory to version control
- Use strong, unique encryption keys in production
- For Gmail, always use App Passwords instead of your main password
- HTTPS is recommended for production deployments

## 📝 Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Backend server port | `3000` |
| `FRONTEND_URL` | No | Frontend URL for CORS | `http://localhost:5173` |
| `ELASTICSEARCH_URL` | Yes | Elasticsearch connection URL | `http://localhost:9200` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | - |
| `ENCRYPTION_KEY` | Yes | 32-character encryption key | - |

> **Note**: `SLACK_WEBHOOK_URL` and `WEBHOOK_URL` are now configured via the Settings UI, not environment variables!

## 🚀 Production Deployment

For production deployment:

1. Set up a production Elasticsearch instance (consider Elastic Cloud)
2. Use environment variables for all sensitive data
3. Deploy backend to a Node.js hosting platform (Railway, Render, Heroku, etc.)
4. Deploy frontend to a static hosting service (Vercel, Netlify, etc.)
5. Configure proper CORS settings
6. Use HTTPS for all connections
7. Set up monitoring and logging

## � License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Made with ❤️ using React, Express, Elasticsearch & Google Gemini AI**

For questions or issues, please open an issue on GitHub.

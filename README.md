# 📬 Onebox Email Aggregator

A powerful, AI-driven email aggregation platform that synchronizes multiple IMAP accounts in real-time, categorizes emails using Google Gemini AI, and provides smart reply suggestions.

![Onebox Dashboard](https://via.placeholder.com/800x400?text=Onebox+Dashboard+Preview)

## ✨ Key Features

- **🔄 Real-time Sync**: Instantly syncs emails from multiple IMAP accounts using IDLE.
- **🤖 AI Categorization**: Automatically categorizes emails (Interested, Meeting Booked, Spam, etc.) using Google Gemini 1.5 Flash.
- **✨ Smart Replies**: Generates context-aware, unique reply suggestions for every email.
- **🔍 Powerful Search**: Full-text search powered by Elasticsearch.
- **📋 Copy & Paste**: One-click copy for AI-generated replies.
- **🎨 Modern UI**: Beautiful, responsive interface with dark mode aesthetics and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Vanilla CSS (Modern Design System)
- **Backend**: Node.js, Express, TypeScript
- **Database**: Elasticsearch (for email storage & search)
- **AI**: Google Gemini API (`gemini-flash-latest`)
- **Email**: `imapflow` (IMAP), `nodemailer` (SMTP)
- **Real-time**: Socket.IO

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Docker** (for Elasticsearch)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/parvatkhattak/onebox-email-aggregator.git
cd onebox-email-aggregator
```

### 2. Setup Environment Variables

**Backend (`.env`):**
Create a `.env` file in the root directory:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
ELASTICSEARCH_URL=http://localhost:9200
GEMINI_API_KEY=your_gemini_api_key_here
ENCRYPTION_KEY=your_32_char_secure_key_here
```

**Frontend (`frontend/.env`):**
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Start Infrastructure (Elasticsearch)

```bash
docker-compose up -d
```

### 4. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
# From root directory
npm run dev
```
*Server will start on http://localhost:3000*

### Start Frontend Application
```bash
# From frontend directory
npm run dev
```
*App will open at http://localhost:5173*

## 📖 Usage Guide

### 1. Connect Email Account
- Click **"Settings"** (⚙️ icon) in the sidebar.
- Click **"Add Account"**.
- Enter your IMAP credentials (Email, Password/App Password, Host, Port).
- Click **"Connect"**. The app will verify and sync emails from the last 7 days.

### 2. View & Filter Emails
- Use the sidebar to filter by **"Interested"**, **"Meeting Booked"**, etc.
- Click on an email to view details.

### 3. Generate AI Replies
- Open an email.
- Click the **"✨ Suggest Reply"** button.
- The AI will analyze the email context and generate a unique, professional response.
- Click **"📋 Copy"** to use the reply.

## 🚢 Deployment

### Backend
1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Ensure Elasticsearch is running and accessible.

### Frontend
1. Build for production: `npm run build`
2. Serve the `dist` folder using a static server (e.g., Nginx, Vercel, Netlify).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

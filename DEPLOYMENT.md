# 🚀 Deployment Guide: Render & Vercel

This guide explains how to deploy the **Onebox Email Aggregator** using modern cloud platforms: **Render** (for Backend) and **Vercel** (for Frontend).

## 🏗️ Architecture Overview

- **Backend**: Deployed on **Render** as a Web Service.
- **Frontend**: Deployed on **Vercel** as a Static Site.
- **Database**: Hosted **Elasticsearch** (Recommended: [Elastic Cloud](https://www.elastic.co/cloud/)).

---

## � Step 1: Database (Elasticsearch)

Since Render/Vercel don't provide managed Elasticsearch, you need a hosted instance.

1.  **Sign up** for [Elastic Cloud](https://cloud.elastic.co/registration).
2.  **Create a deployment**.
3.  **Copy** the **Elasticsearch Endpoint** (URL) and **Password**.
4.  You will need these for the Backend environment variables.

---

## 🔙 Step 2: Backend Deployment (Render)

1.  **Push** your code to GitHub (if you haven't already).
2.  **Sign up/Login** to [Render](https://render.com).
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Configure the Service**:
    -   **Name**: `onebox-backend`
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm start`
6.  **Environment Variables** (Add these in the "Environment" tab):
    -   `PORT`: `3000`
    -   `ELASTICSEARCH_URL`: `https://your-elastic-cloud-url:9243` (Include username:password if needed, e.g., `https://elastic:password@host:port`)
    -   `GEMINI_API_KEY`: `your_gemini_api_key`
    -   `ENCRYPTION_KEY`: `your_32_char_secure_key`
    -   `FRONTEND_URL`: `https://your-vercel-frontend-url.vercel.app` (You'll update this after deploying frontend)
7.  Click **"Create Web Service"**.
8.  **Copy** the **Service URL** (e.g., `https://onebox-backend.onrender.com`).

---

## 🎨 Step 3: Frontend Deployment (Vercel)

1.  **Sign up/Login** to [Vercel](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    -   **Framework Preset**: `Vite`
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    -   `VITE_API_URL`: Paste your **Render Backend URL** (e.g., `https://onebox-backend.onrender.com`).
6.  Click **"Deploy"**.
7.  **Copy** the **Deployment Domain** (e.g., `https://onebox-frontend.vercel.app`).

---

## 🔄 Step 4: Final Configuration

1.  Go back to **Render Dashboard** -> **onebox-backend** -> **Environment**.
2.  Update `FRONTEND_URL` with your new **Vercel Domain**.
3.  **Save Changes** (Render will auto-redeploy).

---

## ✅ Verification

1.  Open your **Vercel URL**.
2.  Go to **Settings** -> **Add Account**.
3.  Connect an email account.
4.  If successful, emails should start syncing!

## ⚠️ Troubleshooting

-   **CORS Errors**: Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash).
-   **Elasticsearch Connection**: Ensure your Elastic Cloud URL includes authentication (username:password) if required.

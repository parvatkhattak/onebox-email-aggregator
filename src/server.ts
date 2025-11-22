// src/server.ts
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { imapInit, stopImapConnection, setSocketIO } from './imapService';
import { searchEmails, getEmailById, updateEmailCategory, initElasticsearch } from './elasticsearchService';
import { suggestReply } from './aiCategorizer';
import { createAccount, getAllAccounts, deleteAccount, getAccountById } from './databaseService';
import { getSettings, updateSettings } from './settingsService';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Account management endpoints
app.post('/api/accounts', async (req, res) => {
    try {
        console.log('Received add account request:', req.body.email);
        const { email, password, host, port, tls } = req.body;

        if (!email || !password || !host || !port) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create account in database
        const account = createAccount({ email, password, host, port: Number(port), tls: tls !== false });

        // Initialize IMAP connection (async, don't wait)
        imapInit(account).catch(err => {
            console.error('Error initializing IMAP:', err);
        });

        // Return account without password
        const { password: _, ...accountWithoutPassword } = account;
        res.status(201).json({
            message: 'Account added successfully',
            account: accountWithoutPassword
        });
    } catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Failed to add account' });
    }
});

app.get('/api/accounts', (req, res) => {
    try {
        const accounts = getAllAccounts();
        // Remove passwords from response
        const safeAccounts = accounts.map(({ password, ...rest }) => rest);
        res.json({ accounts: safeAccounts });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

app.delete('/api/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Stop IMAP connection
        await stopImapConnection(id);

        // Delete from database
        const deleted = deleteAccount(id);

        if (deleted) {
            res.json({ message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ error: 'Account not found' });
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// Email endpoints
app.get('/api/emails', async (req, res) => {
    try {
        const { query, accountId, folder, category, from, size } = req.query as any;

        const results = await searchEmails({
            query,
            accountId,
            folder,
            category,
            from: from ? Number(from) : undefined,
            size: size ? Number(size) : undefined,
        });

        res.json(results);
    } catch (error) {
        console.error('Error searching emails:', error);
        res.status(500).json({ error: 'Failed to search emails' });
    }
});

app.get('/api/emails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const email = await getEmailById(id);

        if (email) {
            res.json(email);
        } else {
            res.status(404).json({ error: 'Email not found' });
        }
    } catch (error) {
        console.error('Error fetching email:', error);
        res.status(500).json({ error: 'Failed to fetch email' });
    }
});

app.post('/api/emails/:id/categorize', async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        await updateEmailCategory(id, category);
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.post('/api/emails/:id/suggest-reply', async (req, res) => {
    try {
        const { id } = req.params;
        const email = await getEmailById(id);

        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const reply = await suggestReply({
            subject: email.subject,
            body: email.body,
            from: email.from,
            category: email.category,
        });

        res.json({ reply });
    } catch (error) {
        console.error('Error generating reply:', error);
        res.status(500).json({ error: 'Failed to generate reply' });
    }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
    try {
        const settings = getSettings();
        res.json({ settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const { slackWebhookUrl, externalWebhookUrl } = req.body;
        const updated = updateSettings({ slackWebhookUrl, externalWebhookUrl });
        res.json({ settings: updated });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    },
});

// Set Socket.IO instance for IMAP service
setSocketIO(io);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Initialize services
const initServices = async () => {
    console.log('Initializing services...');

    // Initialize Elasticsearch
    await initElasticsearch();

    // Reconnect to existing accounts
    const accounts = getAllAccounts();
    console.log(`Found ${accounts.length} existing accounts`);

    for (const account of accounts) {
        try {
            console.log(`Reconnecting to ${account.email}...`);
            await imapInit(account);
        } catch (error) {
            console.error(`Error reconnecting to ${account.email}:`, error);
        }
    }

    console.log('Services initialized');
};

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    await initServices();
});

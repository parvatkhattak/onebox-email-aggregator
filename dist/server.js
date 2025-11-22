"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const imapService_1 = require("./imapService");
const elasticsearchService_1 = require("./elasticsearchService");
const aiCategorizer_1 = require("./aiCategorizer");
const databaseService_1 = require("./databaseService");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Account management endpoints
app.post('/api/accounts', async (req, res) => {
    try {
        const { email, password, host, port, tls } = req.body;
        if (!email || !password || !host || !port) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Create account in database
        const account = (0, databaseService_1.createAccount)({ email, password, host, port: Number(port), tls: tls !== false });
        // Initialize IMAP connection (async, don't wait)
        (0, imapService_1.imapInit)(account).catch(err => {
            console.error('Error initializing IMAP:', err);
        });
        // Return account without password
        const { password: _, ...accountWithoutPassword } = account;
        res.status(201).json({
            message: 'Account added successfully',
            account: accountWithoutPassword
        });
    }
    catch (error) {
        console.error('Error adding account:', error);
        res.status(500).json({ error: 'Failed to add account' });
    }
});
app.get('/api/accounts', (req, res) => {
    try {
        const accounts = (0, databaseService_1.getAllAccounts)();
        // Remove passwords from response
        const safeAccounts = accounts.map(({ password, ...rest }) => rest);
        res.json({ accounts: safeAccounts });
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});
app.delete('/api/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Stop IMAP connection
        await (0, imapService_1.stopImapConnection)(id);
        // Delete from database
        const deleted = (0, databaseService_1.deleteAccount)(id);
        if (deleted) {
            res.json({ message: 'Account deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Account not found' });
        }
    }
    catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});
// Email endpoints
app.get('/api/emails', async (req, res) => {
    try {
        const { query, accountId, folder, category, from, size } = req.query;
        const results = await (0, elasticsearchService_1.searchEmails)({
            query,
            accountId,
            folder,
            category,
            from: from ? Number(from) : undefined,
            size: size ? Number(size) : undefined,
        });
        res.json(results);
    }
    catch (error) {
        console.error('Error searching emails:', error);
        res.status(500).json({ error: 'Failed to search emails' });
    }
});
app.get('/api/emails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const email = await (0, elasticsearchService_1.getEmailById)(id);
        if (email) {
            res.json(email);
        }
        else {
            res.status(404).json({ error: 'Email not found' });
        }
    }
    catch (error) {
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
        await (0, elasticsearchService_1.updateEmailCategory)(id, category);
        res.json({ message: 'Category updated successfully' });
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});
app.post('/api/emails/:id/suggest-reply', async (req, res) => {
    try {
        const { id } = req.params;
        const email = await (0, elasticsearchService_1.getEmailById)(id);
        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }
        const reply = await (0, aiCategorizer_1.suggestReply)({
            subject: email.subject,
            body: email.body,
            from: email.from,
            category: email.category,
        });
        res.json({ reply });
    }
    catch (error) {
        console.error('Error generating reply:', error);
        res.status(500).json({ error: 'Failed to generate reply' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Create HTTP server and Socket.IO
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    },
});
// Set Socket.IO instance for IMAP service
(0, imapService_1.setSocketIO)(io);
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
    await (0, elasticsearchService_1.initElasticsearch)();
    // Reconnect to existing accounts
    const accounts = (0, databaseService_1.getAllAccounts)();
    console.log(`Found ${accounts.length} existing accounts`);
    for (const account of accounts) {
        try {
            console.log(`Reconnecting to ${account.email}...`);
            await (0, imapService_1.imapInit)(account);
        }
        catch (error) {
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

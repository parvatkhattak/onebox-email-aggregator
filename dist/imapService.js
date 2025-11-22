"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveConnections = exports.stopImapConnection = exports.imapInit = exports.setSocketIO = void 0;
// src/imapService.ts
const imapflow_1 = require("imapflow");
const elasticsearchService_1 = require("./elasticsearchService");
const aiCategorizer_1 = require("./aiCategorizer");
const notificationService_1 = require("./notificationService");
const databaseService_1 = require("./databaseService");
// Active IMAP connections
const activeConnections = new Map();
let io = null;
// Set Socket.IO instance
const setSocketIO = (socketIO) => {
    io = socketIO;
};
exports.setSocketIO = setSocketIO;
// Parse email content
const parseEmail = (message, accountId, folder) => {
    const from = message.envelope?.from?.[0];
    const to = message.envelope?.to?.[0];
    return {
        accountId,
        messageId: message.envelope?.messageId || `${accountId}-${message.uid}`,
        uid: message.uid,
        subject: message.envelope?.subject || '(No subject)',
        from: from ? `${from.name || ''} <${from.address}>` : 'Unknown',
        to: to ? `${to.name || ''} <${to.address}>` : 'Unknown',
        date: message.envelope?.date || new Date(),
        body: message.bodyStructure?.childNodes?.[0]?.disposition || message.text || '',
        folder,
        category: 'Not Interested', // Will be updated by AI
    };
};
// Fetch and process email
const processEmail = async (client, uid, accountId, folder) => {
    try {
        const message = await client.fetchOne(String(uid), {
            envelope: true,
            bodyStructure: true,
            source: true
        });
        const emailData = parseEmail(message, accountId, folder);
        // Index in Elasticsearch
        await (0, elasticsearchService_1.indexEmail)(emailData);
        // Categorize with AI
        const category = await (0, aiCategorizer_1.categorizeEmail)({
            subject: emailData.subject,
            body: emailData.body,
            from: emailData.from,
        });
        // Update category
        await (0, elasticsearchService_1.updateEmailCategory)(emailData.messageId, category);
        emailData.category = category;
        // Notify if interested
        if (category === 'Interested') {
            await (0, notificationService_1.notifyInterested)(emailData);
        }
        // Emit to frontend via Socket.IO
        if (io) {
            io.emit('new-email', emailData);
        }
        return emailData;
    }
    catch (error) {
        console.error('Error processing email:', error);
        return null;
    }
};
// Initialize IMAP connection for an account
const imapInit = async (account) => {
    const { id, email, password, host, port, tls } = account;
    // Close existing connection if any
    if (activeConnections.has(id)) {
        const existingClient = activeConnections.get(id);
        await existingClient?.logout();
        activeConnections.delete(id);
    }
    const decryptedPassword = (0, databaseService_1.getDecryptedPassword)(account);
    const client = new imapflow_1.ImapFlow({
        host,
        port,
        secure: tls,
        auth: {
            user: email,
            pass: decryptedPassword,
        },
        logger: false,
    });
    try {
        await client.connect();
        console.log(`Connected to IMAP for ${email}`);
        // Store active connection
        activeConnections.set(id, client);
        // Fetch last 30 days of emails from INBOX
        const lock = await client.getMailboxLock('INBOX');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            // Search for emails from last 30 days
            const messages = client.fetch({ since: thirtyDaysAgo }, { envelope: true, bodyStructure: true, source: true });
            let count = 0;
            for await (const message of messages) {
                await processEmail(client, message.uid, id, 'INBOX');
                count++;
                // Emit progress
                if (io) {
                    io.emit('sync-progress', { accountId: id, processed: count });
                }
            }
            console.log(`Synced ${count} emails for ${email}`);
        }
        finally {
            lock.release();
        }
        // Set up IDLE for real-time monitoring
        setupIdleMonitoring(client, id, 'INBOX');
        return { success: true, email };
    }
    catch (error) {
        console.error(`Error connecting to IMAP for ${email}:`, error);
        throw error;
    }
};
exports.imapInit = imapInit;
// Set up IDLE monitoring for real-time updates
const setupIdleMonitoring = async (client, accountId, folder) => {
    try {
        const lock = await client.getMailboxLock(folder);
        try {
            // Listen for new emails
            client.on('exists', async () => {
                console.log(`New email detected for account ${accountId}`);
                try {
                    // Get the latest message
                    const list = await client.search({ seen: false }, { uid: true });
                    if (list && list.length > 0) {
                        const latestUid = Math.max(...list);
                        await processEmail(client, latestUid, accountId, folder);
                    }
                }
                catch (err) {
                    console.error('Error processing new email:', err);
                }
            });
            // Start IDLE
            await client.idle();
        }
        finally {
            lock.release();
        }
    }
    catch (error) {
        console.error('Error setting up IDLE monitoring:', error);
        // Retry after 30 seconds
        setTimeout(() => setupIdleMonitoring(client, accountId, folder), 30000);
    }
};
// Stop IMAP connection
const stopImapConnection = async (accountId) => {
    const client = activeConnections.get(accountId);
    if (client) {
        await client.logout();
        activeConnections.delete(accountId);
        console.log(`IMAP connection closed for account ${accountId}`);
    }
};
exports.stopImapConnection = stopImapConnection;
// Get all active connections
const getActiveConnections = () => {
    return Array.from(activeConnections.keys());
};
exports.getActiveConnections = getActiveConnections;

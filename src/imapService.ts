// src/imapService.ts
import { ImapFlow } from 'imapflow';
import { indexEmail, updateEmailCategory } from './elasticsearchService';
import { categorizeEmail } from './aiCategorizer';
import { notifyInterested } from './notificationService';
import { getDecryptedPassword } from './databaseService';
import type { Server as SocketIOServer } from 'socket.io';

interface EmailAccount {
    id: string;
    email: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
}

import fs from 'fs';
import path from 'path';

// Active IMAP connections
const activeConnections = new Map<string, ImapFlow>();
let io: SocketIOServer | null = null;

const logFile = path.join(process.cwd(), 'backend.log');

const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, logMessage);
};

// Set Socket.IO instance
export const setSocketIO = (socketIO: SocketIOServer) => {
    io = socketIO;
};

// Parse email content
const parseEmail = (message: any, accountId: string, folder: string) => {
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

// Process email data (parsing, indexing, AI)
const processEmailData = async (message: any, accountId: string, folder: string) => {
    try {
        const emailData = parseEmail(message, accountId, folder);
        log(`Parsed email: ${emailData.subject}`);

        // Index in Elasticsearch
        await indexEmail(emailData);
        log(`Indexed email in Elasticsearch`);

        // Categorize with AI
        log(`Categorizing email with AI...`);
        const category = await categorizeEmail({
            subject: emailData.subject,
            body: emailData.body,
            from: emailData.from,
        });
        log(`Categorized as: ${category}`);

        // Update category
        await updateEmailCategory(emailData.messageId, category);

        // Notify if interested
        if (category === 'Interested') {
            await notifyInterested(emailData);
            log(`Sent notification for interested email`);
        }

        // Emit to frontend via Socket.IO
        if (io) {
            io.emit('new-email', emailData);
        }

        return emailData;
    } catch (error) {
        log(`Error processing email data: ${error}`);
        return null;
    }
};

// Fetch and process email by UID
const fetchAndProcessEmail = async (client: ImapFlow, uid: number, accountId: string, folder: string) => {
    try {
        log(`Fetching email UID: ${uid} for account ${accountId}`);
        const message = await client.fetchOne(String(uid), {
            envelope: true,
            bodyStructure: true,
            source: true
        });

        return await processEmailData(message, accountId, folder);
    } catch (error) {
        log(`Error fetching email: ${error}`);
        return null;
    }
};

// Initialize IMAP connection for an account
export const imapInit = async (account: EmailAccount) => {
    const { id, email, password, host, port, tls } = account;

    // Close existing connection if any
    if (activeConnections.has(id)) {
        const existingClient = activeConnections.get(id);
        await existingClient?.logout();
        activeConnections.delete(id);
    }

    const decryptedPassword = getDecryptedPassword(account);

    const client = new ImapFlow({
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
        log(`Connected to IMAP for ${email}`);

        // Store active connection
        activeConnections.set(id, client);

        // Fetch last 30 days of emails from INBOX
        const lock = await client.getMailboxLock('INBOX');

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Search for emails from last 7 days
            const messages = client.fetch(
                { since: sevenDaysAgo },
                { envelope: true, bodyStructure: true, source: true }
            );

            let count = 0;
            for await (const message of messages) {
                await processEmailData(message, id, 'INBOX');
                count++;

                // Emit progress
                if (io) {
                    io.emit('sync-progress', { accountId: id, processed: count });
                }
            }

            log(`Synced ${count} emails for ${email}`);
        } finally {
            lock.release();
        }

        // Set up IDLE for real-time monitoring
        setupIdleMonitoring(client, id, 'INBOX');

        return { success: true, email };
    } catch (error) {
        log(`Error connecting to IMAP for ${email}: ${error}`);
        throw error;
    }
};

// Set up IDLE monitoring for real-time updates
const setupIdleMonitoring = async (client: ImapFlow, accountId: string, folder: string) => {
    try {
        const lock = await client.getMailboxLock(folder);

        try {
            // Listen for new emails
            client.on('exists', async () => {
                log(`New email detected for account ${accountId}`);

                try {
                    // Get the latest message
                    const list = await client.search({ seen: false }, { uid: true });
                    if (list && list.length > 0) {
                        const latestUid = Math.max(...list);
                        await fetchAndProcessEmail(client, latestUid, accountId, folder);
                    }
                } catch (err) {
                    console.error('Error processing new email:', err);
                }
            });

            // Start IDLE
            await client.idle();
        } finally {
            lock.release();
        }
    } catch (error) {
        log(`Error setting up IDLE monitoring: ${error}`);

        // Retry after 30 seconds
        setTimeout(() => setupIdleMonitoring(client, accountId, folder), 30000);
    }
};

// Stop IMAP connection
export const stopImapConnection = async (accountId: string) => {
    const client = activeConnections.get(accountId);
    if (client) {
        await client.logout();
        activeConnections.delete(accountId);
        log(`IMAP connection closed for account ${accountId}`);
    }
};

// Get all active connections
export const getActiveConnections = () => {
    return Array.from(activeConnections.keys());
};

import axios from 'axios';
import type { Email, Account } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
    // Account endpoints
    async getAccounts(): Promise<Account[]> {
        const response = await axios.get(`${API_URL}/accounts`);
        return response.data.accounts;
    },

    async addAccount(account: Omit<Account, 'id'>): Promise<Account> {
        const response = await axios.post(`${API_URL}/accounts`, account);
        return response.data.account;
    },

    async deleteAccount(id: string): Promise<void> {
        await axios.delete(`${API_URL}/accounts/${id}`);
    },

    // Email endpoints
    async getEmails(params?: {
        query?: string;
        accountId?: string;
        folder?: string;
        category?: string;
    }): Promise<{ total: number; emails: Email[] }> {
        const response = await axios.get(`${API_URL}/emails`, { params });
        return response.data;
    },

    async getEmailById(id: string): Promise<Email> {
        const response = await axios.get(`${API_URL}/emails/${id}`);
        return response.data;
    },

    async suggestReply(id: string): Promise<string> {
        const response = await axios.post(`${API_URL}/emails/${id}/suggest-reply`);
        return response.data.reply;
    },

    async categorizeEmail(id: string, category: string): Promise<void> {
        await axios.post(`${API_URL}/emails/${id}/categorize`, { category });
    },
    async getSettings(): Promise<{ slackWebhookUrl?: string; externalWebhookUrl?: string }> {
        const response = await axios.get(`${API_URL}/settings`);
        return response.data.settings;
    },

    async updateSettings(settings: { slackWebhookUrl?: string; externalWebhookUrl?: string }): Promise<{ slackWebhookUrl?: string; externalWebhookUrl?: string }> {
        const response = await axios.post(`${API_URL}/settings`, settings);
        return response.data.settings;
    },
};

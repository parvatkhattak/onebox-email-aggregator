// src/settingsService.ts
import fs from 'fs';
import path from 'path';

// Path to settings JSON file
const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

export interface IntegrationSettings {
    slackWebhookUrl?: string;
    externalWebhookUrl?: string;
}

// Ensure data directory exists
const ensureDataDir = () => {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

export const getSettings = (): IntegrationSettings => {
    ensureDataDir();
    if (!fs.existsSync(SETTINGS_FILE)) {
        // Return empty defaults
        return {};
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    try {
        return JSON.parse(raw) as IntegrationSettings;
    } catch (e) {
        console.error('Failed to parse settings file:', e);
        return {};
    }
};

export const updateSettings = (newSettings: IntegrationSettings): IntegrationSettings => {
    ensureDataDir();
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
    return updated;
};

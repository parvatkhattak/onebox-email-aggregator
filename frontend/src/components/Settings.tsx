import React, { useEffect, useState } from 'react';
import { api } from '../api';

type Settings = {
    slackWebhookUrl?: string;
    externalWebhookUrl?: string;
};

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await api.getSettings();
                setSettings(data);
            } catch (e) {
                console.error('Failed to load settings', e);
                setMessage('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await api.updateSettings(settings);
            setSettings(updated);
            setMessage('Settings saved');
        } catch (e) {
            console.error('Failed to save settings', e);
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="settings-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Integration Settings</h2>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label htmlFor="slackWebhookUrl">Slack Webhook URL</label>
                <input
                    type="text"
                    id="slackWebhookUrl"
                    name="slackWebhookUrl"
                    value={settings.slackWebhookUrl || ''}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://hooks.slack.com/services/..."
                />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label htmlFor="externalWebhookUrl">External Webhook URL</label>
                <input
                    type="text"
                    id="externalWebhookUrl"
                    name="externalWebhookUrl"
                    value={settings.externalWebhookUrl || ''}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://example.com/webhook"
                />
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && <p style={{ marginTop: 'var(--spacing-sm)' }}>{message}</p>}
        </div>
    );
};

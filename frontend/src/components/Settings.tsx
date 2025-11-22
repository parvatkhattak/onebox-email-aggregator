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
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await api.getSettings();
                setSettings(data);
            } catch (e) {
                console.error('Failed to load settings', e);
                setMessage({ text: 'Failed to load settings', type: 'error' });
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
        setMessage(null);
        try {
            await api.updateSettings(settings);
            setMessage({ text: '✅ Settings saved successfully!', type: 'success' });
        } catch (e) {
            console.error('Failed to save settings', e);
            setMessage({ text: '❌ Failed to save settings', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
            }}>
                <div className="spinner"></div>
                <p className="text-muted">Loading settings...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h2 style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: 'var(--spacing-sm)',
                    }}>
                        🔧 Integration Settings
                    </h2>
                    <p className="text-muted">
                        Configure Slack notifications and external webhooks for your email workflow
                    </p>
                </div>

                {/* Slack Webhook Section */}
                <div style={{
                    marginBottom: 'var(--spacing-xl)',
                    padding: 'var(--spacing-lg)',
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                }}>
                    <label
                        htmlFor="slackWebhookUrl"
                        style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: 'var(--spacing-sm)',
                            fontSize: '1.1rem',
                        }}
                    >
                        💬 Slack Webhook URL
                    </label>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                        Get notified in Slack when emails marked as "Interested" arrive.
                        <a
                            href="https://api.slack.com/messaging/webhooks"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--primary)',
                                marginLeft: 'var(--spacing-xs)',
                                textDecoration: 'underline',
                            }}
                        >
                            Learn how to create a webhook
                        </a>
                    </p>
                    <input
                        type="text"
                        id="slackWebhookUrl"
                        name="slackWebhookUrl"
                        value={settings.slackWebhookUrl || ''}
                        onChange={handleChange}
                        className="input"
                        placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* External Webhook Section */}
                <div style={{
                    marginBottom: 'var(--spacing-xl)',
                    padding: 'var(--spacing-lg)',
                    background: 'rgba(118, 75, 162, 0.05)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid rgba(118, 75, 162, 0.2)',
                }}>
                    <label
                        htmlFor="externalWebhookUrl"
                        style={{
                            display: 'block',
                            fontWeight: '600',
                            marginBottom: 'var(--spacing-sm)',
                            fontSize: '1.1rem',
                        }}
                    >
                        🔗 External Webhook URL
                    </label>
                    <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                        Trigger external automation when emails are categorized as "Interested".
                        The webhook will receive email details as JSON payload.
                    </p>
                    <input
                        type="text"
                        id="externalWebhookUrl"
                        name="externalWebhookUrl"
                        value={settings.externalWebhookUrl || ''}
                        onChange={handleChange}
                        className="input"
                        placeholder="https://your-automation-service.com/webhook"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ minWidth: '150px' }}
                    >
                        {saving ? (
                            <>
                                <span className="spinner" style={{
                                    width: '16px',
                                    height: '16px',
                                    borderWidth: '2px',
                                    marginRight: 'var(--spacing-sm)',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                }}></span>
                                Saving...
                            </>
                        ) : (
                            '💾 Save Settings'
                        )}
                    </button>

                    {message && (
                        <div
                            className="animate-fade-in"
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                borderRadius: 'var(--border-radius)',
                                background: message.type === 'success'
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                color: message.type === 'success'
                                    ? '#10b981'
                                    : '#ef4444',
                                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                                fontWeight: '500',
                            }}
                        >
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Card */}
            <div
                className="card"
                style={{
                    marginTop: 'var(--spacing-lg)',
                    padding: 'var(--spacing-lg)',
                    background: 'rgba(102, 126, 234, 0.03)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                }}
            >
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>ℹ️ How It Works</h4>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                }}>
                    <li style={{ marginBottom: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-md)' }}>
                        <span style={{ color: 'var(--primary)', marginRight: 'var(--spacing-xs)' }}>→</span>
                        When an email is categorized as <strong>"Interested"</strong>, your configured webhooks will be triggered
                    </li>
                    <li style={{ marginBottom: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-md)' }}>
                        <span style={{ color: 'var(--primary)', marginRight: 'var(--spacing-xs)' }}>→</span>
                        Slack notifications include sender, subject, and a preview of the email
                    </li>
                    <li style={{ paddingLeft: 'var(--spacing-md)' }}>
                        <span style={{ color: 'var(--primary)', marginRight: 'var(--spacing-xs)' }}>→</span>
                        External webhooks receive complete email data in JSON format for automation
                    </li>
                </ul>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import type { Account } from '../types';

interface AccountManagerProps {
    accounts: Account[];
    onAddAccount: (account: Omit<Account, 'id'> & { password: string }) => Promise<void>;
    onDeleteAccount: (id: string) => Promise<void>;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
    accounts,
    onAddAccount,
    onDeleteAccount,
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        host: '',
        port: '993',
        tls: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-fill settings for known providers
    React.useEffect(() => {
        if (formData.email.endsWith('@gmail.com')) {
            setFormData(prev => ({
                ...prev,
                host: 'imap.gmail.com',
                port: '993',
                tls: true
            }));
        }
    }, [formData.email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onAddAccount({
                email: formData.email,
                password: formData.password,
                host: formData.host,
                port: Number(formData.port),
                tls: formData.tls,
            });
            setFormData({ email: '', password: '', host: '', port: '993', tls: true });
            setShowAddModal(false);
        } catch (err: any) {
            console.error('Error adding account:', err);
            setError(err.response?.data?.error || 'Failed to add account. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="card">
                <div className="flex justify-between items-center mb-lg">
                    <h3>Email Accounts</h3>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        + Add Account
                    </button>
                </div>

                <div className="flex flex-col gap-md">
                    {accounts.length === 0 ? (
                        <p className="text-muted text-sm">No accounts added yet. Add your first email account to get started.</p>
                    ) : (
                        accounts.map((account) => (
                            <div key={account.id} className="card flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{account.email}</p>
                                    <p className="text-sm text-muted">{account.host}:{account.port}</p>
                                </div>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => onDeleteAccount(account.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showAddModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: 'var(--spacing-lg)',
                        margin: 0,
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            background: 'var(--bg-dark)',
                            border: '2px solid var(--border-color)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            position: 'relative',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-lg">Add Email Account</h3>
                        {error && (
                            <div style={{
                                background: 'rgba(255, 59, 48, 0.1)',
                                border: '1px solid rgba(255, 59, 48, 0.3)',
                                color: '#ff453a',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-md)',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                            }}>
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-md" style={{
                            color: 'var(--text-primary)',
                        }}>
                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                    Password / App Password
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="Your IMAP password"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                    IMAP Host
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    required
                                    placeholder="imap.gmail.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                    Port
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                    required
                                    placeholder="993"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                                    TLS/SSL
                                </label>
                                <select
                                    className="select"
                                    value={formData.tls ? 'true' : 'false'}
                                    onChange={(e) => setFormData({ ...formData, tls: e.target.value === 'true' })}
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-md">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

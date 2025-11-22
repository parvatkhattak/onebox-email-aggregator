import React from 'react';
import type { Email } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface EmailListProps {
    emails: Email[];
    onSelectEmail: (email: Email) => void;
    selectedEmailId?: string;
}

export const EmailList: React.FC<EmailListProps> = ({
    emails,
    onSelectEmail,
    selectedEmailId,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (emails.length === 0) {
        return (
            <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: 'var(--spacing-lg)',
                    opacity: 0.3,
                }}>
                    📭
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No emails found</h3>
                <p className="text-muted">
                    Your inbox is empty or there are no emails matching your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-sm">
            {emails.map((email) => (
                <div
                    key={email.id}
                    className={`card ${selectedEmailId === email.id ? 'shadow-lg' : ''}`}
                    onClick={() => onSelectEmail(email)}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderColor: selectedEmailId === email.id ? 'rgba(102, 126, 234, 0.5)' : 'var(--border-color)',
                    }}
                    onMouseEnter={(e) => {
                        if (selectedEmailId !== email.id) {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedEmailId !== email.id) {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }
                    }}
                >
                    <div className="flex justify-between items-start mb-sm">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="font-semibold" style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {email.subject}
                            </p>
                        </div>
                        <span className="text-sm text-muted" style={{ marginLeft: '1rem', flexShrink: 0 }}>
                            {formatDate(email.date)}
                        </span>
                    </div>

                    <p className="text-sm text-secondary mb-sm" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {email.from}
                    </p>

                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted" style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            marginRight: 'var(--spacing-sm)'
                        }}>
                            {email.body.substring(0, 120)}...
                        </p>
                        <CategoryBadge category={email.category} />
                    </div>
                </div>
            ))}
        </div>
    );
};

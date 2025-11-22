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

    return (
        <div className="flex flex-col gap-sm">
            {emails.length === 0 ? (
                <div className="card text-center p-xl">
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p className="text-muted mt-lg">No emails found</p>
                </div>
            ) : (
                emails.map((email) => (
                    <div
                        key={email.id}
                        className={`card ${selectedEmailId === email.id ? 'shadow-lg' : ''}`}
                        onClick={() => onSelectEmail(email)}
                        style={{ cursor: 'pointer' }}
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
                                flex: 1
                            }}>
                                {email.body.substring(0, 100)}...
                            </p>
                            <CategoryBadge category={email.category} />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

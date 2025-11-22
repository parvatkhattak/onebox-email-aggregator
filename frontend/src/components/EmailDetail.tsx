import React, { useState } from 'react';
import type { Email } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface EmailDetailProps {
    email: Email;
    onSuggestReply: (id: string) => Promise<string>;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ email, onSuggestReply }) => {
    const [reply, setReply] = useState('');
    const [loadingReply, setLoadingReply] = useState(false);

    const handleSuggestReply = async () => {
        setLoadingReply(true);
        try {
            const suggestedReply = await onSuggestReply(email.id);
            setReply(suggestedReply);
        } catch (error) {
            console.error('Error getting reply suggestion:', error);
            alert('Failed to generate reply suggestion');
        } finally {
            setLoadingReply(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="card" style={{ height: '100%', overflow: 'auto' }}>
            <div className="mb-lg">
                <div className="flex justify-between items-start mb-md">
                    <h2 style={{ flex: 1 }}>{email.subject}</h2>
                    <CategoryBadge category={email.category} />
                </div>

                <div className="mb-sm">
                    <p className="text-sm text-muted">From:</p>
                    <p className="font-medium">{email.from}</p>
                </div>

                <div className="mb-sm">
                    <p className="text-sm text-muted">To:</p>
                    <p className="font-medium">{email.to}</p>
                </div>

                <div>
                    <p className="text-sm text-muted">Date:</p>
                    <p className="font-medium">{formatDate(email.date)}</p>
                </div>
            </div>

            <div className="mb-lg" style={{
                padding: 'var(--spacing-lg)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
            }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{email.body}</p>
            </div>

            <div>
                <button
                    className="btn btn-primary"
                    onClick={handleSuggestReply}
                    disabled={loadingReply}
                >
                    {loadingReply ? (
                        <>
                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                            Generating...
                        </>
                    ) : (
                        '✨ Suggest Reply'
                    )}
                </button>

                {reply && (
                    <div className="mt-lg" style={{
                        padding: 'var(--spacing-lg)',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                    }}>
                        <p className="font-semibold mb-sm">AI Suggested Reply:</p>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{reply}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

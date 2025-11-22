import React, { useState } from 'react';
import type { Account } from '../types';

interface SearchBarProps {
    accounts: Account[];
    onSearch: (params: {
        query?: string;
        accountId?: string;
        category?: string;
    }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ accounts, onSearch }) => {
    const [query, setQuery] = useState('');
    const [accountId, setAccountId] = useState('');
    const [category, setCategory] = useState('');

    const handleSearch = () => {
        onSearch({
            query: query || undefined,
            accountId: accountId || undefined,
            category: category || undefined,
        });
    };

    return (
        <div className="card">
            <div className="flex gap-md items-end">
                <div style={{ flex: 1 }}>
                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                        Search Emails
                    </label>
                    <input
                        type="text"
                        className="input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by subject, body, sender..."
                    />
                </div>

                <div style={{ minWidth: '200px' }}>
                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                        Account
                    </label>
                    <select
                        className="select"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    >
                        <option value="">All Accounts</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ minWidth: '200px' }}>
                    <label className="text-sm font-medium mb-sm" style={{ display: 'block' }}>
                        Category
                    </label>
                    <select
                        className="select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Interested">Interested</option>
                        <option value="Meeting Booked">Meeting Booked</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Spam">Spam</option>
                        <option value="Out of Office">Out of Office</option>
                    </select>
                </div>

                <button className="btn btn-primary" onClick={handleSearch}>
                    🔍 Search
                </button>
            </div>
        </div>
    );
};

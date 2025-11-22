import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from './api';
import type { Email, Account } from './types';
import { AccountManager } from './components/AccountManager';
import { SearchBar } from './components/SearchBar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import './index.css';
import { Settings } from './components/Settings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'emails' | 'accounts' | 'settings'>('emails');

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketInstance = io(API_URL);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('new-email', (newEmail: Email) => {
      console.log('New email received:', newEmail);
      setEmails((prev) => [newEmail, ...prev]);
    });

    socketInstance.on('sync-progress', (data: { accountId: string; processed: number }) => {
      console.log('Sync progress:', data);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, emailsData] = await Promise.all([
        api.getAccounts(),
        api.getEmails(),
      ]);
      setAccounts(accountsData);
      setEmails(emailsData.emails);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (account: Omit<Account, 'id'> & { password: string }) => {
    const newAccount = await api.addAccount(account);
    setAccounts([...accounts, newAccount]);
  };

  const handleDeleteAccount = async (id: string) => {
    await api.deleteAccount(id);
    setAccounts(accounts.filter((acc) => acc.id !== id));
  };

  const handleSearch = async (params: {
    query?: string;
    accountId?: string;
    category?: string;
  }) => {
    try {
      const result = await api.getEmails(params);
      setEmails(result.emails);
    } catch (error) {
      console.error('Error searching emails:', error);
    }
  };

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleSuggestReply = async (id: string): Promise<string> => {
    return await api.suggestReply(id);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}>
        <div className="spinner"></div>
        <p className="text-lg">Loading Onebox...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 15, 35, 0.95)',
        borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
        padding: 'var(--spacing-lg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}>
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="mb-sm" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>📧 Onebox</h1>
            <p className="text-sm text-muted">AI-Powered Email Aggregator</p>
          </div>
          <div className="flex gap-md">
            <button
              className={view === 'emails' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setView('emails')}
            >
              📬 Emails
            </button>
            <button
              className={view === 'accounts' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setView('accounts')}
            >
              ⚙️ Accounts
            </button>
            <button
              className={view === 'settings' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setView('settings')}
            >
              🔧 Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mt-xl">
        {view === 'accounts' ? (
          <AccountManager
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        ) : view === 'settings' ? (
          <Settings />
        ) : (
          <>
            <SearchBar accounts={accounts} onSearch={handleSearch} />

            <div className="mt-lg" style={{
              display: 'grid',
              gridTemplateColumns: selectedEmail ? '1fr 1fr' : '1fr',
              gap: 'var(--spacing-lg)',
            }}>
              <div>
                <div className="flex justify-between items-center mb-md">
                  <h3>Inbox ({emails.length})</h3>
                  {accounts.length === 0 && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setView('accounts')}
                    >
                      + Add Account
                    </button>
                  )}
                </div>
                <EmailList
                  emails={emails}
                  onSelectEmail={handleSelectEmail}
                  selectedEmailId={selectedEmail?.id}
                />
              </div>

              {selectedEmail && (
                <div className="animate-fade-in">
                  <h3 className="mb-md">Email Details</h3>
                  <EmailDetail
                    email={selectedEmail}
                    onSuggestReply={handleSuggestReply}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'var(--spacing-2xl)',
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        color: 'var(--text-muted)',
      }}>
        <p className="text-sm">
          Powered by IMAP, Elasticsearch & Google Gemini AI
        </p>
      </footer>
    </div>
  );
}

export default App;

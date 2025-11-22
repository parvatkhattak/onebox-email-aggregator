// src/databaseService.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(__dirname, '../data/accounts.json');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32b'; // Must be 32 bytes
const ALGORITHM = 'aes-256-cbc';

interface EmailAccount {
    id: string;
    email: string;
    password: string; // encrypted
    host: string;
    port: number;
    tls: boolean;
}

// Ensure data directory exists
const ensureDataDir = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Encrypt password
export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32));
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

// Decrypt password
export const decrypt = (text: string): string => {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Read accounts from file
const readAccounts = (): EmailAccount[] => {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
};

// Write accounts to file
const writeAccounts = (accounts: EmailAccount[]) => {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2));
};

// Create account
export const createAccount = (account: Omit<EmailAccount, 'id'>): EmailAccount => {
    const accounts = readAccounts();
    const newAccount: EmailAccount = {
        ...account,
        id: crypto.randomUUID(),
        password: encrypt(account.password),
    };
    accounts.push(newAccount);
    writeAccounts(accounts);
    return newAccount;
};

// Get all accounts
export const getAllAccounts = (): EmailAccount[] => {
    return readAccounts();
};

// Get account by ID
export const getAccountById = (id: string): EmailAccount | undefined => {
    const accounts = readAccounts();
    return accounts.find(acc => acc.id === id);
};

// Delete account
export const deleteAccount = (id: string): boolean => {
    const accounts = readAccounts();
    const filtered = accounts.filter(acc => acc.id !== id);
    if (filtered.length < accounts.length) {
        writeAccounts(filtered);
        return true;
    }
    return false;
};

// Get decrypted password
export const getDecryptedPassword = (account: EmailAccount): string => {
    return decrypt(account.password);
};

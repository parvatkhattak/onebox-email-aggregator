"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecryptedPassword = exports.deleteAccount = exports.getAccountById = exports.getAllAccounts = exports.createAccount = exports.decrypt = exports.encrypt = void 0;
// src/databaseService.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const DB_FILE = path_1.default.join(__dirname, '../data/accounts.json');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32b'; // Must be 32 bytes
const ALGORITHM = 'aes-256-cbc';
// Ensure data directory exists
const ensureDataDir = () => {
    const dir = path_1.default.dirname(DB_FILE);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// Encrypt password
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32));
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};
exports.encrypt = encrypt;
// Decrypt password
const decrypt = (text) => {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32));
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decrypt = decrypt;
// Read accounts from file
const readAccounts = () => {
    ensureDataDir();
    if (!fs_1.default.existsSync(DB_FILE)) {
        return [];
    }
    const data = fs_1.default.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
};
// Write accounts to file
const writeAccounts = (accounts) => {
    ensureDataDir();
    fs_1.default.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2));
};
// Create account
const createAccount = (account) => {
    const accounts = readAccounts();
    const newAccount = {
        ...account,
        id: crypto_1.default.randomUUID(),
        password: (0, exports.encrypt)(account.password),
    };
    accounts.push(newAccount);
    writeAccounts(accounts);
    return newAccount;
};
exports.createAccount = createAccount;
// Get all accounts
const getAllAccounts = () => {
    return readAccounts();
};
exports.getAllAccounts = getAllAccounts;
// Get account by ID
const getAccountById = (id) => {
    const accounts = readAccounts();
    return accounts.find(acc => acc.id === id);
};
exports.getAccountById = getAccountById;
// Delete account
const deleteAccount = (id) => {
    const accounts = readAccounts();
    const filtered = accounts.filter(acc => acc.id !== id);
    if (filtered.length < accounts.length) {
        writeAccounts(filtered);
        return true;
    }
    return false;
};
exports.deleteAccount = deleteAccount;
// Get decrypted password
const getDecryptedPassword = (account) => {
    return (0, exports.decrypt)(account.password);
};
exports.getDecryptedPassword = getDecryptedPassword;

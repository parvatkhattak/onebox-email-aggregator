export interface Email {
    id: string;
    accountId: string;
    messageId: string;
    subject: string;
    from: string;
    to: string;
    body: string;
    date: string;
    folder: string;
    category: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office';
}

export interface Account {
    id: string;
    email: string;
    host: string;
    port: number;
    tls: boolean;
}

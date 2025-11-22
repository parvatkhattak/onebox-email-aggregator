import dotenv from 'dotenv';
dotenv.config();

import { suggestReply } from './src/aiCategorizer';

const apiKey = process.env.GEMINI_API_KEY;
console.log(`Loaded API Key: ${apiKey ? apiKey.substring(0, 5) + '...' : 'undefined'}`);

const testEmails = [
    {
        subject: "Interested in your product",
        body: "Hi, I saw your product Onebox and I'm interested in learning more. Can we schedule a demo?",
        from: "lead@example.com",
        category: "Interested"
    },
    {
        subject: "Question about features",
        body: "Does Onebox support Slack integration?",
        from: "user@example.com",
        category: "Interested"
    }
];

const runTest = async () => {
    console.log("Testing AI Reply Generation...\n");

    for (const email of testEmails) {
        console.log(`--- Email: ${email.subject} ---`);
        const reply = await suggestReply(email);
        console.log(`AI Reply:\n${reply}\n`);
    }
};

runTest();

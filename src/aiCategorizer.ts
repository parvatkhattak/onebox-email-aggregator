// src/aiCategorizer.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

export type EmailCategory = 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office';

// Categorize email using AI
export const categorizeEmail = async (email: {
    subject: string;
    body: string;
    from: string;
}): Promise<EmailCategory> => {
    try {
        const prompt = `You are an email categorization AI. Analyze the following email and categorize it into one of these categories:
- Interested: The sender is interested in your product/service
- Meeting Booked: The email confirms or schedules a meeting
- Not Interested: The sender is not interested
- Spam: The email is spam or promotional
- Out of Office: Auto-reply indicating the person is out of office

Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 1000)}

Respond with ONLY the category name, nothing else.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim();

        // Validate response
        const validCategories: EmailCategory[] = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
        if (validCategories.includes(response as EmailCategory)) {
            return response as EmailCategory;
        }

        // Default to Not Interested if invalid response
        return 'Not Interested';
    } catch (error) {
        console.error('Error categorizing email:', error);
        return 'Not Interested';
    }
};

const KNOWLEDGE_BASE = `
Product: Onebox Email Aggregator
Description: A revolutionary AI-driven platform that synchronizes multiple IMAP email accounts in real-time. It provides a seamless, searchable, and AI-powered experience for managing leads and outreach.
Features:
- Real-time multi-account sync
- AI categorization (Interested, Meeting Booked, etc.)
- Elasticsearch-powered search
- Slack & Webhook integrations

Outreach Agenda:
- Goal: Schedule a technical interview or demo.
- Meeting Link: https://cal.com/onebox-demo
- Tone: Professional, concise, and friendly.
`;

// Generate AI-powered reply suggestion
export const suggestReply = async (email: {
    subject: string;
    body: string;
    from: string;
    category?: string;
}): Promise<string> => {
    try {
        const prompt = `You are an intelligent email assistant for "Onebox Email Aggregator".

PRODUCT CONTEXT:
${KNOWLEDGE_BASE}

YOUR TASK:
Analyze the email below and generate a professional, personalized reply that:
1. DIRECTLY ADDRESSES the sender's specific questions or points raised
2. REFERENCES specific details from their email (show you read it!)
3. Provides relevant information about Onebox features if they asked
4. Proposes a meeting if they show interest
5. Keeps a professional yet friendly tone
6. Stays under 120 words
7. VARIES sentence structure and vocabulary to sound natural and unique

CRITICAL: Each reply must be UNIQUE and specifically tailored to THIS email's content. Do NOT use generic templates.

EMAIL TO REPLY TO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: ${email.from}
Subject: ${email.subject}
Category: ${email.category || 'Unknown'}

Message:
${email.body.substring(0, 2000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[System Note: Generate a unique response. Random Seed: ${Date.now()}-${Math.random()}]

YOUR PERSONALIZED REPLY:`;

        console.log('--- AI Prompt ---');
        console.log(prompt);
        console.log('-----------------');

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9, // Maximum creativity
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 250,
            },
        });

        const responseText = result.response.text().trim();
        console.log('--- AI Response ---');
        console.log(responseText);
        console.log('-------------------');

        return responseText;
    } catch (error) {
        console.error('Error generating reply:', error);
        return 'Thank you for your email. I will get back to you shortly.';
    }
};

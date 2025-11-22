// src/aiCategorizer.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
        const prompt = `You are an intelligent email assistant for "Onebox".
        
CONTEXT:
${KNOWLEDGE_BASE}

INSTRUCTION:
Generate a professional reply to the email below based on the provided CONTEXT.
- If the sender is interested, propose a meeting using the meeting link.
- If they are asking about features, mention relevant Onebox features.
- Keep it under 100 words.

EMAIL DATA:
Category: ${email.category || 'Unknown'}
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 1500)}

REPLY:`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Error generating reply:', error);
        return 'Thank you for your email. I will get back to you shortly.';
    }
};

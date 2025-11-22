"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestReply = exports.categorizeEmail = void 0;
// src/aiCategorizer.ts
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
// Categorize email using AI
const categorizeEmail = async (email) => {
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
        const validCategories = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
        if (validCategories.includes(response)) {
            return response;
        }
        // Default to Not Interested if invalid response
        return 'Not Interested';
    }
    catch (error) {
        console.error('Error categorizing email:', error);
        return 'Not Interested';
    }
};
exports.categorizeEmail = categorizeEmail;
// Generate AI-powered reply suggestion
const suggestReply = async (email) => {
    try {
        const prompt = `You are an email assistant. Generate a professional and concise reply to the following email.
The email has been categorized as: ${email.category || 'Unknown'}

Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 1500)}

Generate a professional reply that addresses the sender's concerns. Keep it concise and friendly.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }
    catch (error) {
        console.error('Error generating reply:', error);
        return 'Thank you for your email. I will get back to you shortly.';
    }
};
exports.suggestReply = suggestReply;

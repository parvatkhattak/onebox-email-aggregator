"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyInterested = exports.triggerWebhook = exports.notifySlack = void 0;
// src/notificationService.ts
const axios_1 = __importDefault(require("axios"));
// Send Slack notification for interested emails
const notifySlack = async (email) => {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
        console.log('Slack webhook URL not configured');
        return;
    }
    try {
        await axios_1.default.post(slackWebhookUrl, {
            text: `🎯 New Interested Email!`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🎯 New Interested Email',
                    },
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*From:*\n${email.from}`,
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Subject:*\n${email.subject}`,
                        },
                    ],
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Preview:*\n${email.body.substring(0, 200)}...`,
                    },
                },
            ],
        });
        console.log('Slack notification sent');
    }
    catch (error) {
        console.error('Error sending Slack notification:', error);
    }
};
exports.notifySlack = notifySlack;
// Trigger external webhook for interested emails
const triggerWebhook = async (email) => {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
        console.log('External webhook URL not configured');
        return;
    }
    try {
        await axios_1.default.post(webhookUrl, {
            event: 'email.interested',
            data: {
                messageId: email.messageId,
                from: email.from,
                to: email.to,
                subject: email.subject,
                bodyPreview: email.body.substring(0, 500),
            },
        });
        console.log('External webhook triggered');
    }
    catch (error) {
        console.error('Error triggering webhook:', error);
    }
};
exports.triggerWebhook = triggerWebhook;
// Handle notification for interested email
const notifyInterested = async (email) => {
    await Promise.all([
        (0, exports.notifySlack)(email),
        (0, exports.triggerWebhook)(email),
    ]);
};
exports.notifyInterested = notifyInterested;

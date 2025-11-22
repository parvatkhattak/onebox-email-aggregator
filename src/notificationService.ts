// src/notificationService.ts
import axios from 'axios';

// Send Slack notification for interested emails
export const notifySlack = async (email: {
    subject: string;
    from: string;
    body: string;
}) => {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhookUrl) {
        console.log('Slack webhook URL not configured');
        return;
    }

    try {
        await axios.post(slackWebhookUrl, {
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
    } catch (error) {
        console.error('Error sending Slack notification:', error);
    }
};

// Trigger external webhook for interested emails
export const triggerWebhook = async (email: {
    subject: string;
    from: string;
    to: string;
    body: string;
    messageId: string;
}) => {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        console.log('External webhook URL not configured');
        return;
    }

    try {
        await axios.post(webhookUrl, {
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
    } catch (error) {
        console.error('Error triggering webhook:', error);
    }
};

// Handle notification for interested email
export const notifyInterested = async (email: any) => {
    await Promise.all([
        notifySlack(email),
        triggerWebhook(email),
    ]);
};

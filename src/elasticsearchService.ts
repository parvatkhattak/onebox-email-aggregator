// src/elasticsearchService.ts
import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const INDEX_NAME = 'emails';

// Initialize Elasticsearch index
export const initElasticsearch = async () => {
    try {
        const indexExists = await client.indices.exists({ index: INDEX_NAME });

        if (!indexExists) {
            await client.indices.create({
                index: INDEX_NAME,
                body: {
                    mappings: {
                        properties: {
                            accountId: { type: 'keyword' },
                            subject: { type: 'text' },
                            from: { type: 'keyword' },
                            to: { type: 'keyword' },
                            body: { type: 'text' },
                            date: { type: 'date' },
                            folder: { type: 'keyword' },
                            category: { type: 'keyword' },
                            messageId: { type: 'keyword' },
                            uid: { type: 'long' },
                        },
                    },
                },
            });
            console.log('Elasticsearch index created');
        } else {
            console.log('Elasticsearch index already exists');
        }
    } catch (error) {
        console.error('Error initializing Elasticsearch:', error);
    }
};

// Index an email
export const indexEmail = async (email: any) => {
    try {
        await client.index({
            index: INDEX_NAME,
            id: email.messageId,
            body: email,
        });
    } catch (error) {
        console.error('Error indexing email:', error);
    }
};

// Search emails
export const searchEmails = async (params: {
    query?: string;
    accountId?: string;
    folder?: string;
    category?: string;
    from?: number;
    size?: number;
}) => {
    const { query, accountId, folder, category, from = 0, size = 50 } = params;

    const must: any[] = [];

    if (query) {
        must.push({
            multi_match: {
                query,
                fields: ['subject', 'body', 'from', 'to'],
            },
        });
    }

    if (accountId) {
        must.push({ term: { accountId } });
    }

    if (folder) {
        must.push({ term: { folder } });
    }

    if (category) {
        must.push({ term: { category } });
    }

    try {
        const result = await client.search({
            index: INDEX_NAME,
            body: {
                from,
                size,
                query: {
                    bool: {
                        must: must.length > 0 ? must : [{ match_all: {} }],
                    },
                },
                sort: [{ date: { order: 'desc' } }],
            },
        });

        return {
            total: result.hits.total,
            emails: result.hits.hits.map((hit: any) => ({
                id: hit._id,
                ...hit._source,
            })),
        };
    } catch (error) {
        console.error('Error searching emails:', error);
        return { total: 0, emails: [] };
    }
};

// Get email by ID
export const getEmailById = async (id: string) => {
    try {
        const result = await client.get({
            index: INDEX_NAME,
            id,
        });
        return { id: result._id, ...(result._source as any) };
    } catch (error) {
        console.error('Error getting email:', error);
        return null;
    }
};

// Update email category
export const updateEmailCategory = async (id: string, category: string) => {
    try {
        await client.update({
            index: INDEX_NAME,
            id,
            body: {
                doc: { category },
            },
        });
    } catch (error) {
        console.error('Error updating email category:', error);
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmailCategory = exports.getEmailById = exports.searchEmails = exports.indexEmail = exports.initElasticsearch = void 0;
// src/elasticsearchService.ts
const elasticsearch_1 = require("@elastic/elasticsearch");
const client = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});
const INDEX_NAME = 'emails';
// Initialize Elasticsearch index
const initElasticsearch = async () => {
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
        }
        else {
            console.log('Elasticsearch index already exists');
        }
    }
    catch (error) {
        console.error('Error initializing Elasticsearch:', error);
    }
};
exports.initElasticsearch = initElasticsearch;
// Index an email
const indexEmail = async (email) => {
    try {
        await client.index({
            index: INDEX_NAME,
            id: email.messageId,
            body: email,
        });
    }
    catch (error) {
        console.error('Error indexing email:', error);
    }
};
exports.indexEmail = indexEmail;
// Search emails
const searchEmails = async (params) => {
    const { query, accountId, folder, category, from = 0, size = 50 } = params;
    const must = [];
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
            emails: result.hits.hits.map((hit) => ({
                id: hit._id,
                ...hit._source,
            })),
        };
    }
    catch (error) {
        console.error('Error searching emails:', error);
        return { total: 0, emails: [] };
    }
};
exports.searchEmails = searchEmails;
// Get email by ID
const getEmailById = async (id) => {
    try {
        const result = await client.get({
            index: INDEX_NAME,
            id,
        });
        return { id: result._id, ...result._source };
    }
    catch (error) {
        console.error('Error getting email:', error);
        return null;
    }
};
exports.getEmailById = getEmailById;
// Update email category
const updateEmailCategory = async (id, category) => {
    try {
        await client.update({
            index: INDEX_NAME,
            id,
            body: {
                doc: { category },
            },
        });
    }
    catch (error) {
        console.error('Error updating email category:', error);
    }
};
exports.updateEmailCategory = updateEmailCategory;

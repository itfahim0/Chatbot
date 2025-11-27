const fs = require('fs');
const path = require('path');
const { OpenAI } = require("openai");
const similarity = require('compute-cosine-similarity');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const DATA_DIR = path.join(__dirname, '../../data');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'knowledge.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

class KnowledgeBase {
    constructor() {
        this.data = [];
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(KNOWLEDGE_FILE)) {
                const fileContent = fs.readFileSync(KNOWLEDGE_FILE, 'utf8');
                this.data = JSON.parse(fileContent);
            }
        } catch (error) {
            console.error("Error loading knowledge base:", error);
            this.data = [];
        }
    }

    save() {
        try {
            fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error("Error saving knowledge base:", error);
        }
    }

    async getEmbedding(text) {
        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error("Error generating embedding:", error);
            return null;
        }
    }

    chunkText(text, maxLength = 1000) {
        const chunks = [];
        let currentChunk = "";

        const sentences = text.split(/[.!?]+/);

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence + ". ";
            }
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    async addDocument(text, source) {
        // Check if document from this source already exists to avoid duplicates
        // For simplicity, we might just append or replace. 
        // Better strategy: remove old entries from same source first.
        this.data = this.data.filter(entry => entry.source !== source);

        const chunks = this.chunkText(text);

        console.log(`Processing ${chunks.length} chunks from ${source}...`);

        for (const chunk of chunks) {
            if (chunk.length < 50) continue; // Skip very short chunks

            const embedding = await this.getEmbedding(chunk);
            if (embedding) {
                this.data.push({
                    id: uuidv4(),
                    text: chunk,
                    source: source,
                    embedding: embedding,
                    timestamp: new Date().toISOString()
                });
            }
        }

        this.save();
        console.log(`Added document: ${source}`);
    }

    async search(query, limit = 3) {
        const queryEmbedding = await this.getEmbedding(query);
        if (!queryEmbedding) return [];

        const results = this.data.map(entry => {
            return {
                ...entry,
                score: similarity(queryEmbedding, entry.embedding)
            };
        });

        // Sort by similarity score descending
        results.sort((a, b) => b.score - a.score);

        // Filter for relevant results (e.g., score > 0.3)
        return results.filter(r => r.score > 0.3).slice(0, limit);
    }

    hasDocument(source) {
        return this.data.some(entry => entry.source === source);
    }
}

module.exports = new KnowledgeBase();

#!/usr/bin/env node
const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const INDEX_FILE = path.join(MEMORY_DIR, 'vector-index.json');
let extractor = null;

// Cosine similarity manually
function cosineSim(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getExtractor() {
    if (!extractor) {
        console.log('Loading model...');
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

function getMemoryFiles() {
    const files = [];
    const walk = (dir) => {
        for (const f of fs.readdirSync(dir)) {
            const full = path.join(dir, f);
            if (fs.statSync(full).isDirectory()) walk(full);
            else if (f.endsWith('.md')) files.push({ name: f, path: full, content: fs.readFileSync(full, 'utf-8') });
        }
    };
    walk(MEMORY_DIR);
    return files;
}

async function getEmbedding(text) {
    const model = await getExtractor();
    const embedding = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(embedding.data);
}

async function index() {
    console.log('Scanning memory...');
    const files = getMemoryFiles();
    console.log(`Found ${files.length} files`);
    
    const entries = [];
    for (const file of files) {
        const text = `${file.name}: ${file.content.substring(0, 512)}`;
        const embedding = await getEmbedding(text);
        entries.push({ file: file.name, path: file.path, preview: file.content.substring(0, 200).replace(/\n/g, ' '), embedding });
        console.log(`  OK ${file.name}`);
    }
    
    fs.writeFileSync(INDEX_FILE, JSON.stringify({ entries, timestamp: Date.now() }));
    console.log(`Index saved`);
}

async function search(query) {
    if (!fs.existsSync(INDEX_FILE)) { console.log('Run index first'); return; }
    const { entries } = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    console.log(`Searching: ${query}`);
    const qe = await getEmbedding(query);
    const results = entries.map(e => ({ ...e, sim: cosineSim(qe, e.embedding) }));
    results.sort((a, b) => b.sim - a.sim);
    results.slice(0, 5).forEach((r, i) => console.log(`${i+1}. [${(r.sim*100).toFixed(1)}%] ${r.file}`));
}

const cmd = process.argv[2];
if (cmd === 'index') index().then(() => process.exit(0));
else if (cmd === 'search') search(process.argv.slice(3).join(' ')).then(() => process.exit(0));
else console.log('Usage: memory_embed.js <index|search "query">');

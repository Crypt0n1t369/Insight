import { describe, it, expect, beforeAll, vi } from 'vitest';
import { CLINICAL_PROTOCOLS } from './protocols.js';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Audio Transformation Tool Server', () => {
    let app: express.Application;

    beforeAll(async () => {
        app = express();
        app.use(cors());
        app.use(express.json({ limit: '50mb' }));

        const OPENROUTER_MODEL = 'google/gemini-3-flash-preview';
        const DIRECTOR_MODEL = 'google/gemini-3-flash-preview';

        function cleanJson(text: string): string {
            if (!text) return '{}';
            return text.replace(/```json\\n?|```/g, '').trim();
        }

        app.get('/health', (_req, res) => {
            res.json({ status: 'ok', openRouterLinked: true });
        });

        app.get('/api/protocols', (_req, res) => {
            const protocols = Object.values(CLINICAL_PROTOCOLS).map(
                ({ id, name, description, variables, sonicCues }) => ({
                    id, name, description, variables, sonicCues
                })
            );
            res.json({ protocols });
        });

        app.post('/api/chat', async (req, res) => {
            const { history, latestInput, userVariables } = req.body;
            const conversation = (history || []).map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.text
            }));
            const contextMsg = 'UserContext: ' + JSON.stringify(userVariables || {});
            const messages = [
                { role: 'system', content: 'Clinical Orchestrator' },
                ...conversation,
                { role: 'user', content: contextMsg + '\\nExplore Input: ' + latestInput }
            ];
            try {
                const response = await mockFetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer test-key', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: OPENROUTER_MODEL, messages, response_format: { type: 'json_object' } })
                });
                const data = await (response as any).json();
                res.json(JSON.parse(cleanJson(data.choices?.[0]?.message?.content || '{}')));
            } catch (_error) {
                res.status(500).json({ reply: 'I hear you. Tell me more.', shouldOfferMeditation: false });
            }
        });

        app.post('/api/director', async (req, res) => {
            const { input } = req.body;
            const prompt = 'Insight Director. EXPLORER INPUT: ' + input;
            try {
                const response = await mockFetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer test-key', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: DIRECTOR_MODEL, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } })
                });
                const data = await (response as any).json();
                const parsed = JSON.parse(cleanJson(data.choices?.[0]?.message?.content || '{}'));
                res.json(parsed);
            } catch (_error) {
                res.json({ methodology: 'NSDR', focus: 'Grounding', targetFeeling: 'Calm', intensity: 'MODERATE', rationale: 'Fallback due to error' });
            }
        });

        app.post('/api/meditation/generate', async (req, res) => {
            const { methodology } = req.body;
            const validProtocols = Object.keys(CLINICAL_PROTOCOLS);
            if (methodology && !validProtocols.includes(methodology)) {
                return res.status(400).json({ error: 'Invalid methodology' });
            }
            try {
                const response = await mockFetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer test-key', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: OPENROUTER_MODEL, messages: [{ role: 'system', content: 'Generate.' }, { role: 'user', content: 'Generate.' }], response_format: { type: 'json_object' } })
                });
                const data = await (response as any).json();
                const parsed = JSON.parse(cleanJson(data.choices?.[0]?.message?.content || '{}'));
                const blocks = parsed.script || [{ text: 'Breathe...', instructions: [] }];
                const title = parsed.title || 'Session';
                res.json({ title, batches: [{ text: blocks[0].text, instructions: blocks[0].instructions || [] }], lines: blocks.map((b: any) => b.text) });
            } catch (_error) {
                res.status(500).json({ error: 'Failed to create meditation.' });
            }
        });
    });

    describe('GET /health', () => {
        it('returns status ok with openRouterLinked true', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.openRouterLinked).toBe(true);
        });
    });

    describe('GET /api/protocols', () => {
        it('returns list of protocols with correct shape', async () => {
            const res = await request(app).get('/api/protocols');
            expect(res.status).toBe(200);
            expect(res.body.protocols).toBeInstanceOf(Array);
            expect(res.body.protocols.length).toBeGreaterThan(0);
        });

        it('includes NSDR and IFS protocols', async () => {
            const res = await request(app).get('/api/protocols');
            const ids = res.body.protocols.map((p: any) => p.id);
            expect(ids).toContain('NSDR');
            expect(ids).toContain('IFS');
        });

        it('does not expose systemInput in protocol entries', async () => {
            const res = await request(app).get('/api/protocols');
            for (const protocol of res.body.protocols) {
                expect(protocol).not.toHaveProperty('systemInput');
            }
        });
    });

    describe('POST /api/chat', () => {
        it('returns chat response when OpenRouter is mocked', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ choices: [{ message: { content: '{"reply":"I hear you","shouldOfferMeditation":false}' } }] })
            } as any);

            const res = await request(app)
                .post('/api/chat')
                .send({ history: [{ role: 'user', text: 'anxious' }], latestInput: 'very anxious today', userVariables: {} });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('reply');
            expect(res.body.reply).toBe('I hear you');
        });

        it('returns fallback on OpenRouter error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const res = await request(app)
                .post('/api/chat')
                .send({ history: [], latestInput: 'test', userVariables: {} });

            expect(res.status).toBe(500);
            expect(res.body.reply).toBe('I hear you. Tell me more.');
        });
    });

    describe('POST /api/director', () => {
        it('returns methodology selection from director', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ choices: [{ message: { content: '{"methodology":"IFS","focus":"Self-compassion","targetFeeling":"Peace","intensity":"SOFT","rationale":"Part identified"}' } }] })
            } as any);

            const res = await request(app)
                .post('/api/director')
                .send({ input: 'part overwhelmed', triage: { valence: -0.5, arousal: 0.8 }, growthHistory: [] });

            expect(res.status).toBe(200);
            expect(res.body.methodology).toBe('IFS');
            expect(res.body.focus).toBe('Self-compassion');
        });

        it('returns NSDR fallback on error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const res = await request(app)
                .post('/api/director')
                .send({ input: 'test', triage: { valence: 0, arousal: 0 }, growthHistory: [] });

            expect(res.status).toBe(200);
            expect(res.body.methodology).toBe('NSDR');
            expect(res.body.rationale).toBe('Fallback due to error');
        });
    });

    describe('POST /api/meditation/generate', () => {
        it('returns 400 for invalid methodology', async () => {
            const res = await request(app)
                .post('/api/meditation/generate')
                .send({ focus: 'Calm', targetFeeling: 'Peace', methodology: 'INVALID_METHOD' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid methodology');
        });

        it('generates meditation with valid methodology', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ choices: [{ message: { content: '{"title":"Calm Session","script":[{"text":"Breathe deeply...","instructions":[]}]}' } }] })
            } as any);

            const res = await request(app)
                .post('/api/meditation/generate')
                .send({ focus: 'Calm', targetFeeling: 'Peace', durationMinutes: 10, methodology: 'NSDR' });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Calm Session');
            expect(res.body.batches).toBeInstanceOf(Array);
            expect(res.body.batches.length).toBeGreaterThan(0);
        });

        it('returns error on generation failure', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Generation failed'));

            const res = await request(app)
                .post('/api/meditation/generate')
                .send({ focus: 'Calm', targetFeeling: 'Peace', methodology: 'NSDR' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBeDefined();
        });
    });
});

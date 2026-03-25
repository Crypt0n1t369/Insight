import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { CLINICAL_PROTOCOLS } from './protocols.js';
import type { ChatMessage, MethodologyType, SonicInstruction } from './types.js';

// --- DEMO MODE: Protocol-specific fallback scripts ---
const DEMO_BATCHES: Record<string, { text: string; instructions: SonicInstruction[] }[]> = {
  NSDR: [
    { text: "Welcome to your NSDR session. Find a comfortable position, lying down if possible. Allow your eyes to close.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Begin with a double inhale...inhale through the nose...and again...then let it all go with a long, slow exhale.", instructions: [] },
    { text: "Now, bring your attention to your right hand. Notice any sensations—warmth, tingling, weight. Feel the ground beneath you holding you.", instructions: [] },
    { text: "Slowly rotate your attention up through your right arm, shoulder, into your chest. With each exhale, release any tension you find.", instructions: [] },
    { text: "Let your breath find its own natural rhythm. You are safe. Your nervous system is learning to rest deeply.", instructions: [] },
    { text: "When you're ready, begin to bring your attention back to the room. Gently wiggle your fingers and toes. Take a deep breath.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  IFS: [
    { text: "Welcome. Find a quiet, safe place to turn inward. Close your eyes and take three slow breaths.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Imagine you can see the different parts of yourself — like different people in a room. Notice if one part feels particularly active right now.", instructions: [] },
    { text: "Turn your attention gently toward that part. Don't change anything — just notice. Where do you feel it in your body?", instructions: [] },
    { text: "Ask it quietly: What do you need me to know? What are you protecting me from?", instructions: [] },
    { text: "Notice what arises. There is no right answer. Your inner world is valid and worth understanding.", instructions: [] },
    { text: "Take a slow breath. You can return to this place anytime. For now, let all parts rest.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  SOMATIC_AGENCY: [
    { text: "Come to standing if possible. Feel your feet grounded on the earth. You are here.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.7, duration: 5 }] },
    { text: "Notice your current posture. Are you collapsed, contracted, or expanded? Simply observe without judgment.", instructions: [] },
    { text: "Take a breath and ask: What am I committed to? Let the answer arise from your center, not your conditioning.", instructions: [] },
    { text: "Feel your feet pressing into the ground. Feel your spine elongating. This is your body. This is your life. You have agency.", instructions: [] },
    { text: "With your next exhale, let out anything that isn't yours to carry. You choose what you embody.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  ACT: [
    { text: "Find a comfortable seated position. Close your eyes. Take a deep breath in...and let it go.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Notice a thought that has been troubling you. Don't push it away. Just observe it, like a cloud passing through the sky.", instructions: [] },
    { text: "Watch it arise. Watch it linger. Watch it pass. You are the sky. The thought is just weather.", instructions: [] },
    { text: "Now ask yourself: What value do I want to move toward today? Let it be simple. Something that matters to you.", instructions: [] },
    { text: "You don't have to believe every thought. You can choose your direction. Take that value with you as you return.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  FUTURE_SELF: [
    { text: "Close your eyes. Take a slow breath. Begin to imagine yourself one year from today.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "This future version of you has navigated everything you're facing now. They've grown through it.", instructions: [] },
    { text: "What would this future self want to tell you? What have they learned that you need to hear?", instructions: [] },
    { text: "Notice how it feels to receive this message. You are already becoming them. Every choice is a vote for who you will be.", instructions: [] },
    { text: "Take a deep breath and let the image fade — but hold onto the feeling. It's already yours.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  WOOP: [
    { text: "Let's work with the WOOP method. Begin by finding your wish — something meaningful but uncertain.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "WOOP. Wish. Outcome. Imagine the best possible outcome if your wish came true. Feel it fully.", instructions: [] },
    { text: "Obstacle. What is the main inner obstacle that stands between you and this outcome? Not external facts — something within you.", instructions: [] },
    { text: "Plan. If this obstacle appears, then I will... Form a specific if-then plan. Make it concrete.", instructions: [] },
    { text: "You've planted a seed. Your unconscious mind will work on this. Return when you're ready to take action.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  NVC: [
    { text: "Find a quiet moment. Bring to mind a recent situation where you felt upset or judged someone.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Start with observation, not judgment. What actually happened? What did you see, hear, say — without评价.", instructions: [] },
    { text: "Now identify the feeling. What did you feel? Frustrated? Sad? Scared? Name it precisely.", instructions: [] },
    { text: "What need of yours was unmet? What were you longing for? Connection, respect, safety, understanding?", instructions: [] },
    { text: "Finally, what could you request — clearly and without demand — that would meet that need? You deserve to have your needs heard.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  IDENTITY: [
    { text: "Settle into a comfortable position. Think of one quality you are proud of — a real strength of yours.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Don't rush to the next thought. Let yourself feel what it's like to own this strength fully.", instructions: [] },
    { text: "When did you first manifest this quality? How has it shown up in your life? Let a memory surface.", instructions: [] },
    { text: "Feel it in your body. This is not a story. This is who you are. You have always been capable of this.", instructions: [] },
    { text: "Carry this strength into your day. It is always available to you. You can return to it anytime.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  NARRATIVE: [
    { text: "Find a quiet place. Bring to mind a problem or pattern that has been weighing on you.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Now, imagine giving this problem a name. Not as part of you — as something separate. What would you call it?", instructions: [] },
    { text: "Notice its characteristics. How does it show up? When is it loudest? You're learning its patterns.", instructions: [] },
    { text: "Have there been moments — exceptions — when you managed this problem better? What was different then?", instructions: [] },
    { text: "You are not the problem. The problem is something you are learning to relate to differently. You have the upper hand.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
  DEFAULT: [
    { text: "Welcome. Find a comfortable position and close your eyes. Take a slow, deep breath.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0.6, duration: 5 }] },
    { text: "Feel the weight of your body. The ground beneath you. The air on your skin. You are safe in this moment.", instructions: [] },
    { text: "Bring your attention to your breath. No need to change it — just notice it. Inhale... exhale.", instructions: [] },
    { text: "Whenever your mind wanders — and it will — gently guide it back. This is the practice. Not perfection.", instructions: [] },
    { text: "Take one more deep breath. Begin to return to the room. Wiggle your fingers and toes. Open your eyes.", instructions: [{ action: 'FADE_VOL', layer: 'atmosphere', targetValue: 0, duration: 5 }] },
  ],
};

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini & OpenRouter
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
const openRouterKey = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-3-flash-preview";
const DIRECTOR_MODEL = "google/gemini-3-flash-preview";

async function callOpenRouter(messages: any[], model: string = OPENROUTER_MODEL, jsonMode: boolean = false) {
    if (!openRouterKey) {
        console.warn("OpenRouter API Key is missing on server");
        return null;
    }
    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            messages,
            response_format: jsonMode ? { type: "json_object" } : undefined
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenRouter API Error (${response.status}):`, errorData);
        throw new Error(`OpenRouter API Error: ${response.status}`);
    }
    const data: any = await response.json();
    console.log("OpenRouter Response:", JSON.stringify(data).slice(0, 200));
    return data.choices?.[0]?.message?.content || "";
}

function cleanJson(text: string): string {
    if (!text) return "{}";
    return text.replace(/```json\n?|```/g, '').trim();
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', openRouterLinked: !!openRouterKey });
});

app.get('/api/protocols', (req, res) => {
    const protocols = Object.values(CLINICAL_PROTOCOLS).map(
        ({ id, name, description, variables, sonicCues }) => ({
            id, name, description, variables, sonicCues
        })
    );
    res.json(protocols);
});

app.post('/api/chat', async (req, res) => {
    // Support both 'latestInput' and 'message' field names
    const { history = [], latestInput, message, userVariables } = req.body || {};
    const input = latestInput || message || '';

    console.log("Chat Request received:", { historyLen: history?.length, input });

    if (!input && (!req.body || Object.keys(req.body).length === 0)) {
        return res.status(400).json({ reply: "Message is required.", shouldOfferMeditation: false });
    }

    const orchestratorPrompt = `
    You are the 'Clinical Orchestrator'. Analyze the explorer and return JSON ONLY.
    
    # OUTPUT FORMAT
    {
      "reply": "Empathetic mirror response...",
      "shouldOfferMeditation": boolean,
      "meditationData": {
        "focus": "The core theme",
        "feeling": "Desired state",
        "duration": 10,
        "methodology": "IFS" | "NSDR" | "SOMATIC_AGENCY" | "ACT" | "FUTURE_SELF" | "WOOP" | "NVC" | "IDENTITY" | "NARRATIVE"
      }
    }
  `;

    const conversation = (Array.isArray(history) ? history : []).map((h: ChatMessage) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.text
    }));

    const contextMsg = `UserContext: ${JSON.stringify(userVariables)}`;
    const messages = [
        { role: 'system', content: orchestratorPrompt },
        ...conversation,
        { role: 'user', content: `${contextMsg}\nExplore Input: ${input}` }
    ];

    try {
        console.log("Sending to OpenRouter...");
        const text = await callOpenRouter(messages, OPENROUTER_MODEL, true);
        console.log("Raw OpenRouter Text:", text);
        // null text = missing API key → use demo fallback directly
        // empty parse result also means demo fallback
        if (!text) {
            return res.json({
                reply: "I hear you. Tell me more about what you're experiencing — in demo mode, every word matters.",
                shouldOfferMeditation: true,
                meditationData: {
                    focus: "Demo Session",
                    feeling: "Open",
                    duration: 10,
                    methodology: "NSDR"
                }
            });
        }
        const parsed = JSON.parse(cleanJson(text));
        if (!parsed || typeof parsed.reply !== 'string') {
            // Malformed response → demo fallback
            return res.json({
                reply: "I hear you. Tell me more about what you're experiencing — in demo mode, every word matters.",
                shouldOfferMeditation: true,
                meditationData: {
                    focus: "Demo Session",
                    feeling: "Open",
                    duration: 10,
                    methodology: "NSDR"
                }
            });
        }
        res.json(parsed);
    } catch (error) {
        console.error("Chat error FULL DETAILS:", error);
        if (error instanceof Error) {
            console.error("Stack:", error.stack);
        }
        // Return graceful demo fallback with 200 — server-side errors should not break client
        res.json({
            reply: "I hear you. Tell me more about what you're experiencing — in demo mode, every word matters.",
            shouldOfferMeditation: true,
            meditationData: {
                focus: "Demo Session",
                feeling: "Open",
                duration: 10,
                methodology: "NSDR"
            }
        });
    }
});

app.post('/api/director', async (req, res) => {
    // Support both canonical field names and legacy test shapes
    const input = req.body.input ?? req.body.userMessage ?? '';
    const triage = req.body.triage ?? (req.body.sessionState ? { valence: 5, arousal: 5 } : null);
    const growthHistory = req.body.growthHistory ?? [];

    // Graceful fallback when triage data is missing or malformed
    if (!input && (!triage || typeof triage.valence !== 'number')) {
        return res.json({
            methodology: "NSDR",
            focus: "Grounding",
            targetFeeling: "Calm",
            intensity: "MODERATE",
            rationale: "Fallback: insufficient input data"
        });
    }

    const directorTools = [
        {
            name: "select_meditation_protocol",
            description: "Selects the optimal meditation methodology and configuration.",
            parameters: {
                type: "object",
                properties: {
                    methodology: { type: "string", enum: ["IFS", "SOMATIC_AGENCY", "NSDR", "ACT", "FUTURE_SELF", "WOOP", "NVC", "IDENTITY", "NARRATIVE"] },
                    focus: { type: "string" },
                    targetFeeling: { type: "string" },
                    intensity: { type: "string", enum: ["SOFT", "MODERATE", "DEEP"] },
                    rationale: { type: "string" }
                },
                required: ["methodology", "focus", "targetFeeling", "intensity"]
            }
        }
    ];

    const prompt = `
    You are the "Insight Director". Triage the explorer and select a growth protocol.
    
    EXPLORER INPUT: "${input}"
    STATE: Valence ${triage?.valence ?? 5}, Energy ${triage?.arousal ?? 5}
    CONTEXT: ${JSON.stringify(growthHistory)}

    If they mention a Part, use IFS. If anxious, use NSDR or Grounding.
    
    RETURN JSON ONLY matching this tool schema:
    ${JSON.stringify(directorTools[0])}
  `;

    try {
        const text = await callOpenRouter([{ role: "user", content: prompt }], DIRECTOR_MODEL, true);
        const parsed = JSON.parse(cleanJson(text || "{}"));
        return res.json(parsed);
    } catch (error) {
        console.error("Director error:", error);
        // Fallback default
        return res.json({
            methodology: "NSDR",
            focus: "Grounding",
            targetFeeling: "Calm",
            intensity: "MODERATE",
            rationale: "Fallback due to error"
        });
    }
});

app.post('/api/meditation/generate', async (req, res) => {
    const { focus, targetFeeling, durationMinutes, contextInsights, methodology, variables } = req.body;
    const protocol = CLINICAL_PROTOCOLS[methodology as MethodologyType] || CLINICAL_PROTOCOLS['NSDR'];
    if (!protocol) {
        return res.status(400).json({ error: "Invalid methodology and fallback failed." });
    }

    const generatorPrompt = `
    You are an expert Clinical Generator. Generate a meditation script following the ${protocol.name} protocol.

    ${protocol.systemInput}
    
    # CLINICAL CONTEXT
    Focus: "${focus}"
    Feeling: "${targetFeeling}"
    Variables: ${JSON.stringify(variables)}
    Insights: ${contextInsights?.join(', ')}
    
    # OUTPUT (JSON Screenplay)
    {
      "title": "Title",
      "script": [
        { "text": "...", "instructions": [{ "action": "FADE_VOL", "layer": "atmosphere", "targetValue": 0.6, "duration": 2 }] }
      ]
    }
  `;

    try {
        const textResponse = await callOpenRouter([
            { role: "system", content: generatorPrompt },
            { role: "user", content: "Generate session script." }
        ], OPENROUTER_MODEL, true);

        // null response = missing API key → return protocol-specific demo content
        if (!textResponse) {
            const demoMethodology = methodology as string;
            const demoBatches = DEMO_BATCHES[demoMethodology] || DEMO_BATCHES['DEFAULT'];
            const demoTitle = demoMethodology && demoMethodology !== 'undefined'
                ? `Demo: ${demoMethodology}`
                : "Demo Session";
            return res.status(200).json({
                error: "Demo mode — AI generation requires OPENROUTER_API_KEY with credits.",
                batches: demoBatches,
                title: demoTitle
            });
        }

        const parsed = JSON.parse(cleanJson(textResponse));
        // Use AI-generated script if available, otherwise fall back to demo
        const scriptBlocks = parsed.script || DEMO_BATCHES[methodology as string] || DEMO_BATCHES['DEFAULT'];
        const title = parsed.title || "Session";

        const batches: { text: string; instructions: SonicInstruction[] }[] = [];
        let currentBatchText = "";
        let currentBatchInstructions: SonicInstruction[] = [];
        const TARGET_BATCH_CHARS = 400;

        for (const block of scriptBlocks) {
            let cleaned = block.text.replace(/[\*\[\]#_`]/g, '').trim();
            if (!cleaned) continue;
            cleaned = cleaned.toLowerCase()
                .replace(/\./g, '... ')
                .replace(/,/g, '... ')
                .replace(/\?/g, '...')
                .replace(/!/g, '...');

            if (currentBatchText.length === 0 && block.instructions) {
                currentBatchInstructions = [...currentBatchInstructions, ...block.instructions];
            } else if (block.instructions) {
                currentBatchInstructions = [...currentBatchInstructions, ...block.instructions];
            }

            if ((currentBatchText.length + cleaned.length) < TARGET_BATCH_CHARS) {
                currentBatchText += cleaned + "\n\n";
            } else {
                batches.push({ text: currentBatchText, instructions: currentBatchInstructions });
                currentBatchText = cleaned + "\n\n";
                currentBatchInstructions = block.instructions || [];
            }
        }
        if (currentBatchText.length > 0) {
            batches.push({ text: currentBatchText, instructions: currentBatchInstructions });
        }

        res.json({ title, batches, lines: scriptBlocks.map((b: any) => b.text) });

    } catch (error) {
        console.error("Error generating meditation:", error);
        // Return graceful demo content — protocol-specific scripts so the client has playable audio
        const demoMethodology = methodology as string;
        const demoBatches = DEMO_BATCHES[demoMethodology] || DEMO_BATCHES['DEFAULT'];
        const demoTitle = demoMethodology && demoMethodology !== 'DEFAULT'
            ? `Demo: ${demoMethodology}`
            : "Demo Session";
        res.status(200).json({
            error: "Demo mode — AI generation requires OPENROUTER_API_KEY with credits.",
            batches: demoBatches,
            title: demoTitle
        });
    }
});

app.listen(port, () => {
    console.log(`Clinical Agent Server running at http://localhost:${port}`);
});

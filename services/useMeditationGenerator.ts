
import { useState, useRef, useEffect } from 'react';
import { Meditation, MeditationConfig, Soundscape, ViewState, Resolution, PlayableSegment, MethodologyType } from '../types';
import { generateMeditationScript, generateAudioChunk, wrapPcmToWav, decodeBase64 } from './geminiService';
import { MeditationPipeline } from './MeditationPipeline';
import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import { generateSonicTimeline, SonicTimeline } from './sonicDirector';

// Helper to stitch audio blobs into a single valid WAV file
const stitchAudio = async (segments: PlayableSegment[]): Promise<Blob> => {
    const pcmChunks: Uint8Array[] = [];
    let sampleRate = 24000;  // Default
    let numChannels = 1;     // Default mono

    for (const seg of segments) {
        try {
            const resp = await fetch(seg.audioUrl);
            const arrayBuffer = await resp.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            // Check if it's a WAV file
            const header = String.fromCharCode(...bytes.slice(0, 4));
            if (header === 'RIFF' && bytes.length > 44) {
                // Extract sample rate and channels from header
                const view = new DataView(arrayBuffer);
                sampleRate = view.getUint32(24, true);
                numChannels = view.getUint16(22, true);
                // Extract PCM data (skip 44-byte header)
                pcmChunks.push(bytes.slice(44));
            } else {
                // Assume raw PCM
                pcmChunks.push(bytes);
            }
        } catch (e) { console.error("Segment fetch failed", e); }
    }

    // Calculate total PCM length
    const totalPcmLength = pcmChunks.reduce((sum, chunk) => sum + chunk.length, 0);

    // Create combined buffer with WAV header
    const wavBuffer = new ArrayBuffer(44 + totalPcmLength);
    const view = new DataView(wavBuffer);
    const output = new Uint8Array(wavBuffer);

    // Write WAV header
    const setUint32 = (pos: number, val: number) => view.setUint32(pos, val, true);
    const setUint16 = (pos: number, val: number) => view.setUint16(pos, val, true);

    // "RIFF" chunk
    output.set([0x52, 0x49, 0x46, 0x46], 0);        // "RIFF"
    setUint32(4, 36 + totalPcmLength);              // file size - 8
    output.set([0x57, 0x41, 0x56, 0x45], 8);        // "WAVE"
    // "fmt " subchunk
    output.set([0x66, 0x6d, 0x74, 0x20], 12);       // "fmt "
    setUint32(16, 16);                              // subchunk1 size
    setUint16(20, 1);                               // audio format (PCM)
    setUint16(22, numChannels);                     // num channels
    setUint32(24, sampleRate);                      // sample rate
    setUint32(28, sampleRate * numChannels * 2);   // byte rate
    setUint16(32, numChannels * 2);                 // block align
    setUint16(34, 16);                              // bits per sample
    // "data" subchunk
    output.set([0x64, 0x61, 0x74, 0x61], 36);       // "data"
    setUint32(40, totalPcmLength);                  // data size

    // Write PCM data
    let offset = 44;
    for (const chunk of pcmChunks) {
        output.set(chunk, offset);
        offset += chunk.length;
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
};

/**
 * Creates an audio Blob from base64 data, respecting the mimeType.
 * Uses centralized wrapPcmToWav for raw PCM data.
 */
const createAudioBlob = (audioBase64: string, mimeType?: string): Blob => {
    const bytes = decodeBase64(audioBase64);
    const len = bytes.length;

    console.log('🔊 createAudioBlob - mimeType:', mimeType, 'length:', len);

    // Check for audio file signatures to detect actual format
    const binaryCheck = String.fromCharCode(...bytes.slice(0, 12));
    const hasWavHeader = len > 12 && binaryCheck.slice(0, 4) === 'RIFF' && binaryCheck.slice(8, 12) === 'WAVE';
    const hasMp3Header = len > 3 && (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) || // Frame sync
        (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33); // ID3 tag

    console.log('🔊 Format detection - hasWavHeader:', hasWavHeader, 'hasMp3Header:', hasMp3Header);

    // If already has WAV or MP3 header, return as-is
    if (hasWavHeader) {
        console.log('🔊 Audio already has WAV header, passing through');
        return new Blob([bytes.slice().buffer], { type: 'audio/wav' });
    }
    if (hasMp3Header) {
        console.log('🔊 Audio already has MP3 header, passing through');
        return new Blob([bytes.slice().buffer], { type: 'audio/mp3' });
    }

    // If mimeType indicates pre-encoded audio, pass through
    if (mimeType && (mimeType.includes('mp3') || mimeType.includes('mpeg') || mimeType.includes('wav'))) {
        console.log('🔊 MimeType indicates encoded audio:', mimeType);
        return new Blob([bytes.slice().buffer], { type: mimeType });
    }

    // Raw PCM data (L16 or no mimeType) - use centralized wrapPcmToWav
    console.log('🔊 Raw PCM detected, wrapping with WAV header (24kHz)');
    return wrapPcmToWav(bytes, 24000, 1);
};


/**
 * Demo Mode: Creates a meditation using hardcoded content with Web Speech API
 * This allows testing the app without an API key
 */

// Protocol-specific demo content for each methodology
const DEMO_CONTENT: Record<string, { greeting: string; segments: string[] }> = {
    NSDR: {
        greeting: `Welcome to your NSDR session. Non-Sleep Deep Rest allows your nervous system to restore and recalibrate. Find a comfortable position, and let's begin.`,
        segments: [
            `Begin with a physiological sigh - two quick breaths in through your nose... and one long, slow exhale through your mouth.`,
            `Now let your breathing return to its natural rhythm... slow and steady.`,
            `Bring your attention to your body... feel the weight of your body sinking into the surface beneath you.`,
            `Let's do a body scan. Beginning at the top of your head... notice any sensations there.`,
            `Move your attention down to your forehead... your eyes... your cheeks... your jaw.`,
            `Notice if you're holding any tension... and with each exhale, release it.`,
            `Let this deep rest restore every cell in your body.`,
            `When you're ready, slowly return to full awareness. Open your eyes gently.`
        ]
    },
    IFS: {
        greeting: `Welcome to your Internal Family Systems exploration. You'll be guided to connect with different parts of yourself. Find a comfortable position, and let's begin.`,
        segments: [
            `Take a few deep breaths... and allow yourself to settle into this moment.`,
            `Now, bring to mind a part of yourself that you've been carrying... something that feels heavy or reactive.`,
            `Notice where you feel this part in your body... what sensation arises?`,
            `Without trying to change anything... simply observe. This part has a purpose.`,
            `Ask this part: What do you need me to know?`,
            `Listen with curiosity and compassion... there's no rush.`,
            `You can acknowledge this part... and remind it that you're here to help.`,
            `Take a moment to notice how you feel now. When ready, slowly return.`
        ]
    },
    ACT: {
        greeting: `Welcome to your Acceptance and Commitment Therapy session. You'll explore values, acceptance, and committed action. Find a comfortable position, and let's begin.`,
        segments: [
            `Take a deep breath in... and notice what thoughts are present right now.`,
            `Imagine those thoughts as clouds passing through the sky... you can watch them come and go.`,
            `Now, bring to mind your values... what matters most to you in life?`,
            `Notice any emotions that arise as you connect with your values... simply observe them.`,
            `You don't need to change or fix anything... just allow them to be here.`,
            `What one small action could you take today that aligns with your values?`,
            `You have the capacity to make that choice... in this moment.`,
            `Carry this intention with you. When ready, slowly open your eyes.`
        ]
    },
    WOOP: {
        greeting: `Welcome to your WOOP session - Wish, Outcome, Obstacle, Plan. We'll work with your motivation and goals. Find a comfortable position, and let's begin.`,
        segments: [
            `Take a deep breath and settle into this moment.`,
            `Think of a wish or goal that matters to you... something you desire.`,
            `Imagine this wish fulfilled... what does the best outcome look and feel like?`,
            `Now consider the obstacle... what is the main thing that stands in your way?`,
            `Notice how this obstacle shows up in your body and mind.`,
            `Here's your planning step: When you encounter this obstacle, you will... [specific action].`,
            `Visualize yourself executing this plan successfully.`,
            `You have the power to make this happen. Open your eyes when ready.`
        ]
    },
    NVC: {
        greeting: `Welcome to your Nonviolent Communication practice. You'll connect with your feelings and needs. Find a comfortable position, and let's begin.`,
        segments: [
            `Take a deep breath and allow yourself to arrive fully in this moment.`,
            `Bring to mind a situation or person you'd like to understand better.`,
            `First, separate your observations from your judgments... what exactly is happening?`,
            `Now notice what feelings arise as you observe this... name them without judgment.`,
            `What needs are behind these feelings? What are you longing for?`,
            `Now, from this place of needs... what request could you make?`,
            `Practice voicing this request with compassion - for yourself and others.`,
            `Carry this gentle awareness with you. When ready, slowly open your eyes.`
        ]
    },
    SOMATIC_AGENCY: {
        greeting: `Welcome to your Somatic Agency session. You'll reconnect with your body's innate wisdom and capacity for action. Find a comfortable position, and let's begin.`,
        segments: [
            `Take a deep breath and feel your body... the sensations moving through you.`,
            `Notice your posture... how you're holding yourself in this moment.`,
            `Bring attention to your core... the center of your personal power.`,
            `Feel your feet on the ground... roots growing deep into the earth.`,
            `Notice the difference between reacting and responding... you have a choice.`,
            `What does agency feel like in your body? Strong? Centered? Present?`,
            `You have the capacity to choose your actions... you are not helpless.`,
            `Carry this embodied sense of power with you. When ready, open your eyes.`
        ]
    },
    // Default/general fallback
    DEFAULT: {
        greeting: `Welcome to your meditation. Find a comfortable position and allow yourself to settle into this moment.`,
        segments: [
            `Take a deep breath in through your nose... and release slowly through your mouth.`,
            `With each breath, allow yourself to sink deeper into relaxation.`,
            `Notice the sensations in your body... the warmth... the heaviness... the peace.`,
            `Let go of any thoughts that don't serve you right now.`,
            `You are exactly where you need to be.`,
            `Continue breathing gently... allowing this sense of calm to fill your entire being.`,
            `As we come to the end of this session, carry this peace with you.`,
            `When you're ready, slowly open your eyes.`
        ]
    }
};

const runDemoMode = async (
    config: MeditationConfig,
    setMeditations: any,
    setActiveMeditationId: any,
    setView: any,
    soundscapes: Soundscape[]
) => {
    const tempId = crypto.randomUUID();
    
    // Get protocol-specific content based on methodology, or default
    const methodology = config.methodology || 'DEFAULT';
    const demoData = DEMO_CONTENT[methodology] || DEMO_CONTENT['DEFAULT'];
    
    // Demo content based on selected protocol
    const demoGreeting = demoData.greeting;
    const demoContent = demoData.segments;

    // Create segments with Web Speech flag
    const greetingSegment: PlayableSegment = {
        id: 'greeting',
        text: demoGreeting,
        audioUrl: '',
        duration: demoGreeting.length / 15,
        useWebSpeech: true
    };

    const contentSegments: PlayableSegment[] = demoContent.map((text, i) => ({
        id: `demo-${i}`,
        text,
        audioUrl: '',
        duration: text.length / 15,
        useWebSpeech: true
    }));

    const allSegments = [greetingSegment, ...contentSegments];
    const totalDuration = allSegments.reduce((acc, s) => acc + s.duration, 0);

    // Find selected soundscape
    const selectedSoundscape = soundscapes.find(s => s.id === config.soundscapeId) || soundscapes[0];

    const newMeditation: Meditation = {
        id: tempId,
        title: config.methodology ? `Demo: ${config.methodology}` : (config.focus ? `Demo: ${config.focus}` : 'Demo Meditation'),
        transcript: demoGreeting + '\n\n' + demoContent.join('\n\n'),
        lines: [demoGreeting, ...demoContent],
        audioQueue: allSegments,
        isGenerating: false,
        durationMinutes: config.duration || 5,
        createdAt: Date.now(),
        played: false,
        soundscapeId: selectedSoundscape?.id || 'default',
        backgroundType: 'deep-space',
        config: config
    };

    console.log('🎯 Demo Mode: Created meditation with', allSegments.length, 'segments, ~' + Math.round(totalDuration) + 's total');

    // Update state
    setMeditations(prev => [newMeditation, ...prev]);
    setActiveMeditationId(tempId);
    setView(ViewState.LOADING);

    // Small delay then switch to player
    setTimeout(() => {
        setView(ViewState.PLAYER);
    }, 500);
};

export const useMeditationGenerator = (
    soundscapes: Soundscape[],
    activeResolution: Resolution | null,
    setView: (view: ViewState) => void,
    userId?: string
) => {
    const [meditations, setMeditations] = useState<Meditation[]>([]);
    const [activeMeditationId, setActiveMeditationId] = useState<string | null>(null);
    const [pendingMeditationConfig, setPendingMeditationConfig] = useState<Partial<MeditationConfig> | null>(null);

    // Ref to hold the pipeline so we can stop it if unmounted
    const pipelineRef = useRef<MeditationPipeline | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pipelineRef.current) {
                console.log("🧹 Unmounting: Stopping Pipeline");
                pipelineRef.current.stop();
            }
        };
    }, []);

    const finalizeMeditationGeneration = async (configArg?: MeditationConfig) => {
        // Use provided config or fall back to pendingMeditationConfig
        const config = configArg || pendingMeditationConfig as MeditationConfig;

        // Defensive: Ensure config is valid
        if (!config || !config.soundscapeId) {
            console.error('❌ finalizeMeditationGeneration called with invalid config:', config);
            console.error('   pendingMeditationConfig was:', pendingMeditationConfig);
            throw new Error('Invalid meditation config: missing required fields (soundscapeId)');
        }

        // ===== DEMO MODE: Check for API key and use fallback if missing =====
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!googleApiKey || googleApiKey === '' || googleApiKey === 'your_google_api_key_here') {
            console.log('🔑 No Google API key detected - running in DEMO MODE with Web Speech');
            await runDemoMode(config, setMeditations, setActiveMeditationId, setView, soundscapes);
            return;
        }

        // Prevent double submissions or cancel previous
        if (pipelineRef.current) {
            console.log("🛑 Stopping previous pipeline...");
            pipelineRef.current.stop();
            pipelineRef.current = null;
        }

        const tempId = crypto.randomUUID();
        try {
            // 1. Base Context
            const contextTexts = [
                `Goal: ${activeResolution?.statement}`,
                `Why: ${activeResolution?.rootMotivation}`
            ];

            // 2. Fetch User Session History for Personalization
            if (userId) {
                try {
                    const { fetchSessionHistory, generatePersonalizationContext } = await import('./userHistoryService');
                    const history = await fetchSessionHistory(userId);

                    if (history.totalSessions > 0) {
                        const personalizationContext = generatePersonalizationContext(history);
                        contextTexts.push("### USER HISTORY ###");
                        contextTexts.push(personalizationContext);
                        contextTexts.push("### END HISTORY ###");
                        console.log('📊 Personalization context injected:', history.totalSessions, 'sessions analyzed');
                    }
                } catch (err) {
                    console.warn("Failed to fetch user history", err);
                }
            }

            // 3. Fetch Recent Reflections (Context Injection)
            if (userId) {
                try {
                    const { data: recentEntries } = await supabase
                        .from('daily_entries')
                        .select('date, reflection_summary')
                        .eq('user_id', userId)
                        .not('reflection_summary', 'is', null)
                        .order('date', { ascending: false })
                        .limit(3);

                    if (recentEntries && recentEntries.length > 0) {
                        console.log("🧠 Context Injection: Found", recentEntries.length, "entries");
                        contextTexts.push("### RECENT MEMORIES & PROGRESS ###");
                        recentEntries.forEach(entry => {
                            contextTexts.push(`[${entry.date}] User Reflection: ${entry.reflection_summary}`);
                        });
                        contextTexts.push("### END MEMORIES ###");
                    }
                } catch (err) {
                    console.warn("Failed to fetch context", err);
                }
            }

            console.log("🎵 Soundscape Selection Debug:", {
                requestedId: config.soundscapeId,
                availableCount: soundscapes.length,
                availableIds: soundscapes.map(s => s.id)
            });
            let selectedSoundscape = soundscapes.find(s => s.id === config.soundscapeId) || soundscapes[0];

            const newMeditation: Meditation = {
                id: tempId,
                title: "Morning Alignment",
                transcript: "",
                lines: [],
                audioQueue: [],
                isGenerating: true,
                durationMinutes: config.duration,
                createdAt: Date.now(),
                played: false,
                soundscapeId: selectedSoundscape.id,
                backgroundType: 'deep-space',
                config: config
            };

            setMeditations(prev => [newMeditation, ...prev]);
            setActiveMeditationId(tempId);
            setView(ViewState.LOADING);

            // ===== STREAMING ARCHITECTURE: FAST START =====
            // 1. Generate greeting immediately (short, fast)
            // 2. Start TTS on greeting while script generates in parallel
            // 3. Push greeting to queue and switch to player
            // 4. Continue generating remaining content in background

            console.log('⚡ Fast Start: Generating greeting...');

            // Determine context hint for personalized greeting
            const hour = new Date().getHours();
            const timeContext = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

            // Import dynamically to avoid circular dependency
            const { generateFastGreeting, generateAudioChunk } = await import('./geminiService');

            // PARALLEL EXECUTION: Greeting + Full Script
            const greetingPromise = generateFastGreeting(
                config.focus,
                config.feeling,
                config.methodology,
                timeContext
            ).then(async (greeting) => {
                // Immediately generate TTS for greeting
                console.log('⚡ Fast Start: Generating greeting audio...');
                try {
                    const { audioData, mimeType } = await generateAudioChunk(greeting.text, config.voice, {
                        chunkIndex: 0,
                        totalChunks: 3, // Estimated
                        previousChunkEnd: undefined
                    });
                    console.log('⚡ Greeting audio generated, length:', audioData?.length || 0, 'mimeType:', mimeType);
                    return { text: greeting.text, audioData, mimeType };
                } catch (ttsError) {
                    console.error('⚠️ Greeting TTS failed:', ttsError);
                    throw ttsError; // Re-throw to be caught by main handler
                }
            });

            const scriptPromise = generateMeditationScript(
                config.focus,
                config.feeling,
                config.duration,
                selectedSoundscape.metadata.description,
                config.voice,
                contextTexts,
                config.methodology,
                config.variables
            );

            // Wait for greeting (fast) - this completes in ~3-4s
            let greetingResult;
            try {
                greetingResult = await greetingPromise;
            } catch (greetingError) {
                console.error('❌ Fast greeting failed, proceeding without:', greetingError);
                // Skip greeting, wait for script and proceed with batches only
                greetingResult = null;
            }

            // Only create greeting segment if we have valid audio
            if (greetingResult && greetingResult.audioData) {
                // Check for Web Speech API fallback (text/speech mimeType)
                if (greetingResult.mimeType === 'text/speech') {
                    console.log('🔊 Using Web Speech API for greeting (fallback mode)');
                    // Create a segment with empty audioUrl but with text - player will use Web Speech
                    const greetingSegment: PlayableSegment = {
                        id: 'greeting',
                        text: greetingResult.text,
                        audioUrl: '',  // Empty - will use Web Speech
                        duration: greetingResult.text.length / 15, // Estimate: ~15 chars/sec for speech
                        instructions: [],
                        useWebSpeech: true  // Flag for player to use Web Speech API
                    };
                    setMeditations(current => current.map(m => {
                        if (m.id === tempId) return {
                            ...m,
                            audioQueue: [greetingSegment],
                            isGenerating: true
                        };
                        return m;
                    }));
                } else {
                    // Normal audio blob creation
                    const greetingBlob = await createAudioBlob(greetingResult.audioData, greetingResult.mimeType);
                    const greetingUrl = URL.createObjectURL(greetingBlob);

                    const greetingSegment: PlayableSegment = {
                        id: 'greeting',
                        text: greetingResult.text,
                        audioUrl: greetingUrl,
                        duration: decodeBase64(greetingResult.audioData).length / 48000,
                        instructions: []
                    };
                    setMeditations(current => current.map(m => {
                        if (m.id === tempId) return {
                            ...m,
                            audioQueue: [greetingSegment],
                            isGenerating: true
                        };
                        return m;
                    }));
                }
                console.log('⚡ Fast Start: Greeting ready! Player can begin.');
            } else {
                console.log('⚠️ No greeting audio, player will wait for first batch');
            }

            // Now wait for full script
            let { title, lines, batches } = await scriptPromise;

            // ===== BATCH SPLITTING FALLBACK =====
            // If AI returned too few batches, split them manually for better streaming
            const expectedBatches = Math.max(2, Math.round(config.duration));
            if (batches.length < expectedBatches && batches.length > 0) {
                console.log(`⚠️ AI returned ${batches.length} batches, expected ${expectedBatches}. Auto-splitting...`);
                const allText = batches.map(b => b.text).join(' ');
                const targetChunkSize = 500; // ~30 seconds of speech
                const splitBatches: { text: string }[] = [];

                // Split into chunks of roughly 500 chars at sentence boundaries
                let remaining = allText;
                while (remaining.length > 0) {
                    if (remaining.length <= targetChunkSize) {
                        splitBatches.push({ text: remaining.trim() });
                        break;
                    }
                    // Find a good split point (sentence end) around the target size
                    let splitPoint = remaining.slice(0, targetChunkSize + 100).lastIndexOf('. ');
                    if (splitPoint < 200) splitPoint = targetChunkSize; // Fallback if no sentence found
                    splitBatches.push({ text: remaining.slice(0, splitPoint + 1).trim() });
                    remaining = remaining.slice(splitPoint + 1).trim();
                }
                batches = splitBatches;
                console.log(`✅ Split into ${batches.length} batches`);
            }

            // Update title/transcript
            setMeditations(current => current.map(m => {
                if (m.id === tempId) return { ...m, title, transcript: lines.join('\n'), lines };
                return m;
            }));

            // --- SONIC DIRECTOR: Generate Timeline ---
            const sonicTimeline = generateSonicTimeline({
                protocol: (config.methodology || 'GENERAL') as MethodologyType,
                segmentCount: batches.length + 1, // +1 for greeting
                totalDurationMs: config.duration * 60 * 1000
            });
            console.log('🎵 Sonic Timeline Generated:', sonicTimeline.metadata);

            // --- REMAINING BATCH GENERATION (STREAMING) ---
            console.log(`🎤 Processing ${batches.length} remaining batches (streaming)...`);

            // Process sequentially to maintain order and avoid rate limits
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`🎤 Generating Batch ${i + 1}/${batches.length} (${batch.text.length} chars)...`);

                try {
                    // Pass context for voice consistency between chunks
                    const previousBatch = i > 0 ? batches[i - 1] : null;
                    const previousChunkEnd = previousBatch ? previousBatch.text.slice(-100) : greetingResult?.text?.slice(-100);

                    const { audioData, mimeType } = await generateAudioChunk(batch.text, config.voice, {
                        chunkIndex: i + 1, // +1 because greeting is index 0
                        totalChunks: batches.length + 1,
                        previousChunkEnd
                    });

                    // Check for Web Speech API fallback (text/speech mimeType)
                    let newSegment: PlayableSegment;
                    if (mimeType === 'text/speech') {
                        console.log('🔊 Using Web Speech API for batch (fallback mode)');
                        newSegment = {
                            id: `batch-${i}`,
                            text: batch.text,
                            audioUrl: '',  // Empty - will use Web Speech
                            duration: batch.text.length / 15, // Estimate: ~15 chars/sec
                            instructions: sonicTimeline.segmentInstructions[i + 1] || [],
                            useWebSpeech: true
                        };
                    } else {
                        // Normal audio blob creation
                        const blob = createAudioBlob(audioData, mimeType);
                        const url = URL.createObjectURL(blob);
                        const actualBytes = decodeBase64(audioData);

                        newSegment = {
                            id: `batch-${i}`,
                            text: batch.text,
                            audioUrl: url,
                            duration: actualBytes.length / 48000,
                            instructions: sonicTimeline.segmentInstructions[i + 1] || []
                        };
                    }

                    // STREAM: Append this segment to queue immediately
                    setMeditations(current => current.map(m => {
                        if (m.id === tempId) {
                            return {
                                ...m,
                                audioQueue: [...m.audioQueue, newSegment],
                                isGenerating: i < batches.length - 1 // Still generating if not last batch
                            };
                        }
                        return m;
                    }));

                    console.log(`✅ Batch ${i + 1} streamed to queue`);

                } catch (batchErr) {
                    console.error(`❌ Batch ${i} failed:`, batchErr);
                    // Continue to next batch
                }
            }

            // Mark generation complete
            setMeditations(current => current.map(m => {
                if (m.id === tempId) {
                    return { ...m, isGenerating: false };
                }
                return m;
            }));

            // Calculate Approximate Total Duration (get from current meditation state)
            setMeditations(current => {
                const meditation = current.find(m => m.id === tempId);
                if (meditation) {
                    const totalDuration = meditation.audioQueue.reduce((acc, curr) => acc + curr.duration, 0);
                    console.log(`✅ Generation Complete. Total Audio: ${totalDuration.toFixed(1)}s`);
                }
                return current;
            });

            setPendingMeditationConfig(null);

            // 2. Upload Audio (Background) - Upload first chunk OR stitch?
            // For now, we only upload the *First* chunk as a preview, or we'd need to stitch them.
            // Stitching is expensive in JS. Let's upload the first chunk for the record.



            // 3. PERSISTENCE (Product Grade)
            if (userId) {
                try {
                    // A. Create Session Log
                    const { data: logData, error: logError } = await supabase
                        .from('session_logs')
                        .insert({
                            user_id: userId,
                            modality: config.methodology || 'MORNING_ALIGNMENT',
                            focus: config.focus,
                            feeling: config.feeling,
                            transcript: lines.join('\n'),
                            feedback: { config } // Store full config in JSONB
                        })
                        .select()
                        .single();

                    if (logData && !logError) {
                        // B. Link to Daily Entry
                        const today = new Date().toISOString().split('T')[0];
                        if (activeResolution) {
                            await supabase.from('daily_entries')
                                .update({
                                    morning_generated: true,
                                    morning_meditation_id: logData.id
                                })
                                .eq('user_id', userId)
                                .eq('date', today)
                                .eq('resolution_id', activeResolution.id || 'unknown');
                        }
                        console.log("✅ Session Persisted:", logData.id);

                        // 4. UPLOAD STITCHED AUDIO (Background) - Get current queue from state
                        setMeditations(current => {
                            const meditation = current.find(m => m.id === tempId);
                            if (meditation && meditation.audioQueue.length > 0) {
                                stitchAudio(meditation.audioQueue).then(blob => {
                                    console.log("☁️ Uploading stitched global audio...");
                                    storageService.uploadSessionAudio(userId, config.soundscapeId || 'default', blob).then(publicUrl => {
                                        if (publicUrl) {
                                            supabase.from('session_logs')
                                                .update({ audio_url: publicUrl })
                                                .eq('id', logData.id);
                                            console.log("✅ Audio successfully linked to session:", publicUrl);
                                        }
                                    });
                                });
                            }
                            return current;
                        });

                        // SAVE REAL ID TO STATE
                        setMeditations(current => current.map(m => {
                            if (m.id === tempId) return { ...m, supabaseId: logData.id };
                            return m;
                        }));
                    } else {
                        console.error("Failed to save session log", logError);
                    }
                } catch (persistErr) {
                    console.error("Persistence Error", persistErr);
                }
            }

        } catch (e) {
            console.error("Failed to generate meditation", e);
            alert("Generation failed.");
            setMeditations(prev => prev.filter(m => m.id !== tempId));
            setView(ViewState.DASHBOARD);
        }
    };

    const playMeditation = (id: string) => {
        setActiveMeditationId(id);
        setView(ViewState.PLAYER);
    };

    return {
        meditations,
        activeMeditationId,
        pendingMeditationConfig,
        setPendingMeditationConfig, // EXPORTED
        finalizeMeditationGeneration,
        playMeditation,
        setMeditations
    };
};


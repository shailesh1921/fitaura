/**
 * server.js — FitAura REST API
 *   POST /api/workout/generate
 *   POST /api/ai/coach
 *   POST /api/food/scan  — Groq Vision (100% free)
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { User, Workout, Exercise, Feedback, ExercisePerformance } = require('./models');
const TrainingEngine = require('./training_engine');
const config = require('./js/config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use('/app', express.static('app'));
app.use('/js', express.static('js'));

app.get('/', (req, res) => res.redirect('/app/index.html'));

const engine = new TrainingEngine();

// ─── WORKOUT GENERATION ──────────────────────────────────────────────
app.post('/api/workout/generate', (req, res) => {
    try {
        const { user, plannedWorkout, feedback, history } = req.body;
        const feedbackObj = new Feedback(feedback.sleepQuality, feedback.soreness, feedback.stressLevel, feedback.painFlags);
        const workoutObj = new Workout(plannedWorkout.id, plannedWorkout.userId, plannedWorkout.name,
            plannedWorkout.exercises.map(e => new Exercise(e.id, e.name, e.type, e.muscleGroups, e.weight, e.sets, e.reps, e.rpeTarget)));
        const historyObjs = history ? history.map(h => new ExercisePerformance(h.exerciseId, h.weight, h.completedReps, h.completedSets, h.rpe)) : [];
        const userObj = new User(user.id, user.name);
        const result = engine.generateDailyWorkout(userObj, workoutObj, feedbackObj, historyObjs);
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ─── AI COACH PROXY ──────────────────────────────────────────────────
app.post('/api/ai/coach', async (req, res) => {
    try {
        const { messages, system, stream } = req.body;
        const provider = config.AI_PROVIDER || 'groq';
        let apiUrl, headers, body;

        if (provider === 'groq') {
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            const apiKey = config.GROQ_API_KEY;
            if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') return res.status(401).json({ error: 'Groq API Key not configured.' });
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = { model: config.AI_MODEL || 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: system }, ...messages], stream: stream || false, max_tokens: 1024 };
        } else {
            apiUrl = 'https://api.anthropic.com/v1/messages';
            const apiKey = config.CLAUDE_API_KEY;
            if (!apiKey || apiKey === 'YOUR_CLAUDE_API_KEY') return res.status(401).json({ error: 'Claude API Key not configured.' });
            headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'messages-2023-12-15' };
            body = { model: config.AI_MODEL || 'claude-3-5-sonnet-20240620', max_tokens: 1024, system, messages, stream: stream || false };
        }

        const response = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!response.ok) { const err = await response.json(); return res.status(response.status).json(err); }
        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            const reader = response.body.getReader();
            while (true) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
            res.end();
        } else {
            res.json(await response.json());
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ─── REAL FOOD SCANNER (Groq Vision — FREE) ─────────────────────────
app.post('/api/food/scan', async (req, res) => {
    try {
        const { image, mimeType } = req.body;
        if (!image) return res.status(400).json({ error: 'No image provided' });

        const apiKey = config.GROQ_VISION_KEY || config.GROQ_API_KEY;
        if (!apiKey || apiKey.startsWith('YOUR_')) {
            return res.status(401).json({
                error: 'Groq API Key not configured.',
                hint: 'Get a FREE key at https://console.groq.com/keys — no credit card needed'
            });
        }

        const model = config.FOOD_MODEL || 'llama-4-scout-17b-16e-instruct';

        const prompt = `You are an expert food nutritionist AI. Analyze this food image.

Identify ALL food items. For each:
- name, emoji, estimatedGrams, confidence (75-99), category (grains/protein/vegetables/fruits/dairy/snacks/beverages/combo)
- nutrition for that serving: calories, protein, carbs, fat, fiber, sugar, sodium (mg), cholesterol (mg)
- per100g: same values per 100g

Classify mealType: high-protein, balanced, high-carb, light-snack, heavy-meal, low-fat, high-fiber
Give a 1-sentence healthNote.

Use REAL USDA data. Be conservative with portions.
If no food visible, return {"foods":[],"error":"No food detected"}

Respond ONLY with valid JSON:
{"foods":[{"name":"Grilled Chicken Breast","emoji":"🍗","estimatedGrams":150,"confidence":95,"category":"protein","nutrition":{"calories":248,"protein":46.5,"carbs":0,"fat":5.4,"fiber":0,"sugar":0,"sodium":85,"cholesterol":120},"per100g":{"calories":165,"protein":31,"carbs":0,"fat":3.6,"fiber":0,"sugar":0,"sodium":57,"cholesterol":80}}],"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0,"totalFiber":0,"totalSugar":0,"mealType":"balanced","healthNote":"Good protein."}`;

        // Convert base64 to data URL for Groq
        const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;

        const requestBody = {
            model,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: dataUrl } }
                ]
            }],
            max_tokens: 2048,
            temperature: 0.1,
        };

        console.log('[FoodScan] Sending to Groq Vision...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('[FoodScan] Groq error:', response.status, JSON.stringify(errData).slice(0, 300));
            return res.status(response.status).json({
                error: 'Groq API error',
                details: errData.error?.message || 'Unknown error',
                hint: response.status === 429 ? 'Rate limited — wait 10s and retry' :
                      response.status === 401 ? 'Invalid Groq API key' : 'Check your key at console.groq.com'
            });
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

        if (!textContent) {
            console.error('[FoodScan] Empty response:', JSON.stringify(data).slice(0, 200));
            return res.status(500).json({ error: 'No response from AI', raw: data });
        }

        let result;
        try {
            let cleaned = textContent.trim();
            // Remove markdown code blocks if present
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
            result = JSON.parse(cleaned);
        } catch (parseErr) {
            console.error('[FoodScan] Parse error:', parseErr.message);
            return res.status(500).json({ error: 'Failed to parse AI response', rawText: textContent.slice(0, 500) });
        }

        if (!result.foods || !Array.isArray(result.foods)) result.foods = [];

        // Calculate totals if missing
        if (!result.totalCalories && result.foods.length > 0) {
            result.totalCalories = 0; result.totalProtein = 0; result.totalCarbs = 0;
            result.totalFat = 0; result.totalFiber = 0; result.totalSugar = 0;
            result.foods.forEach(f => {
                const n = f.nutrition || {};
                result.totalCalories += n.calories || 0;
                result.totalProtein += n.protein || 0;
                result.totalCarbs += n.carbs || 0;
                result.totalFat += n.fat || 0;
                result.totalFiber += n.fiber || 0;
                result.totalSugar += n.sugar || 0;
            });
        }

        result.source = 'groq-vision';
        result.scannedAt = new Date().toISOString();

        console.log(`[FoodScan] ✅ ${result.foods.length} food(s), ${Math.round(result.totalCalories)} kcal`);
        res.json({ status: 'success', data: result });

    } catch (error) {
        console.error('[FoodScan] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`FitAura API running on http://localhost:${PORT}`);
    console.log(`  POST /api/food/scan  (Groq Vision — FREE)`);
});

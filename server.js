/**
 * server.js — FitAura REST API
 *   POST /api/workout/generate
 *   POST /api/ai/coach
 *   POST /api/food/scan  — Groq Vision (100% free)
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { User, Workout, Exercise, Feedback, ExercisePerformance } = require('./public/models');
const TrainingEngine = require('./public/training_engine');
const config = require('./public/js/config');

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

// ─── NUTRITION TEXT PARSER (Claude / Groq) ─────────────────────────
app.post('/api/nutrition/parse', async (req, res) => {
    try {
        const { text, goal, weightTrend } = req.body;
        if (!text) return res.status(400).json({ error: 'No text description provided' });

        const provider = config.AI_PROVIDER || 'groq';
        let apiUrl, headers, body;

        const systemPrompt = `You are a sports nutritionist. Parse this text description of a meal.
Extract all food items, and estimate their calories, protein (g), carbs (g), and fat (g).

Given:
- User Goal: ${goal || 'maintain'}
- User Weight Trend (last few days): ${JSON.stringify(weightTrend || [])}

Provide:
1. Individual food items with macros.
2. Total calories and macros.
3. One singular, highly specific, actionable feedback note tailored to their goal and weight trend. Do not give generic advice. Be direct and constructive.

Respond ONLY with valid JSON:
{
  "items": [{"name": "item name", "calories": 150, "protein": 10, "carbs": 20, "fat": 5}],
  "totalCalories": 150,
  "totalProtein": 10,
  "totalCarbs": 20,
  "totalFat": 5,
  "actionableNote": "One specific actionable feedback sentence."
}`;

        if (provider === 'groq') {
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            const apiKey = config.GROQ_API_KEY;
            if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') return res.status(401).json({ error: 'Groq API Key not configured.' });
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            body = {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.2,
                response_format: { type: "json_object" }
            };
        } else {
            apiUrl = 'https://api.anthropic.com/v1/messages';
            const apiKey = config.CLAUDE_API_KEY;
            if (!apiKey || apiKey === 'YOUR_CLAUDE_API_KEY') return res.status(401).json({ error: 'Claude API Key not configured.' });
            headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
            body = {
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: 'user', content: text }]
            };
        }

        const response = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json(err);
        }

        const rawData = await response.json();
        let resultText = '';
        if (provider === 'groq') {
            resultText = rawData.choices?.[0]?.message?.content;
        } else {
            resultText = rawData.content?.[0]?.text;
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(resultText.trim());
        } catch (e) {
            parsedResult = {
                items: [],
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                actionableNote: "Could not parse meal log details. Please be more specific."
            };
        }

        res.json({ status: 'success', data: parsedResult });
    } catch (error) {
        console.error('[NutritionParse] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── DEVICE SYNC & OAUTH ROUTES ──────────────────────────────────────
const { db } = require('./firebase-admin');

// 1. Google Fit OAuth
app.get('/api/connect/google-fit', (req, res) => {
    const clientId = process.env.GOOGLE_FIT_CLIENT_ID || 'dummy_client_id';
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/callback/google-fit`);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.sleep.read');
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`);
});

app.get('/api/callback/google-fit', async (req, res) => {
    const { code, state } = req.query; // state should ideally contain the uid
    // Stub: In real app, exchange code for token via POST to https://oauth2.googleapis.com/token
    const uid = state || 'test_user_123'; 
    if (db) {
        await db.collection('users').doc(uid).collection('integrations').doc('google-fit').set({
            accessToken: 'dummy_access_token',
            refreshToken: 'dummy_refresh_token',
            status: 'active',
            connectedAt: new Date()
        });
    }
    // Redirect back to the frontend sync page
    res.redirect('/app/device-sync.html?sync_success=google-fit');
});

// 2. Fitbit OAuth
app.get('/api/connect/fitbit', (req, res) => {
    const clientId = process.env.FITBIT_CLIENT_ID || 'dummy_client_id';
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/callback/fitbit`);
    const scope = encodeURIComponent('activity heartrate sleep');
    res.redirect(`https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
});

app.get('/api/callback/fitbit', async (req, res) => {
    const { code, state } = req.query;
    const uid = state || 'test_user_123';
    if (db) {
        await db.collection('users').doc(uid).collection('integrations').doc('fitbit').set({
            accessToken: 'dummy_access_token',
            refreshToken: 'dummy_refresh_token',
            status: 'active',
            connectedAt: new Date()
        });
    }
    res.redirect('/app/device-sync.html?sync_success=fitbit');
});

// 3. Oura OAuth
app.get('/api/connect/oura', (req, res) => {
    const clientId = process.env.OURA_CLIENT_ID || 'dummy_client_id';
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/callback/oura`);
    const scope = encodeURIComponent('daily sleep heartrate');
    res.redirect(`https://cloud.ouraring.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
});

app.get('/api/callback/oura', async (req, res) => {
    const { code, state } = req.query;
    const uid = state || 'test_user_123';
    if (db) {
        await db.collection('users').doc(uid).collection('integrations').doc('oura').set({
            accessToken: 'dummy_access_token',
            refreshToken: 'dummy_refresh_token',
            status: 'active',
            connectedAt: new Date()
        });
    }
    res.redirect('/app/device-sync.html?sync_success=oura');
});

// 4. Apple Health (HealthKit) Webhook
// Apple Health doesn't have a direct REST API. An iOS Shortcut or App posts here.
app.post('/api/sync/apple-health/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const healthData = req.body; 
        
        if (!healthData) return res.status(400).json({ error: 'No health data provided' });

        if (db) {
            const today = new Date().toISOString().split('T')[0];
            const dailyRef = db.collection('users').doc(uid).collection('dailyMetrics').doc(today);
            
            // Normalize Apple Health Data
            const normalized = {
                steps: healthData.steps || null,
                activeCalories: healthData.activeEnergy || null,
                heartRateResting: healthData.restingHeartRate || null,
                sleepMinutes: healthData.sleepDuration || null
            };

            const dailyDoc = await dailyRef.get();
            let mergedData = dailyDoc.exists ? dailyDoc.data() : { sources: {} };
            
            Object.keys(normalized).forEach(key => {
                if (normalized[key]) {
                    mergedData[key] = normalized[key];
                    mergedData.sources[key] = 'apple-health';
                }
            });
            mergedData.date = today;

            await dailyRef.set(mergedData, { merge: true });
            
            await db.collection('users').doc(uid).collection('syncHistory').add({
                timestamp: new Date(),
                source: 'apple-health',
                recordsSynced: Object.keys(normalized).filter(k => normalized[k] !== null).length,
                status: 'success',
                message: 'Apple Health sync successful via Shortcut'
            });
        }

        res.json({ status: 'success', message: 'Apple Health data ingested' });
    } catch (error) {
        console.error('[AppleHealth Sync] Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// ─── INITIALIZE CRON JOBS ──────────────────────────────────────────
const { initCronJobs } = require('./services/cronJobs');
initCronJobs();


app.listen(PORT, () => {
    console.log(`FitAura API running on http://localhost:${PORT}`);
    console.log(`  POST /api/food/scan  (Groq Vision — FREE)`);
    console.log(`  GET  /api/connect/*  (OAuth flows)`);
});

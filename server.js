/**
 * server.js
 * REST API for the Adaptive Training Engine.
 * Exposes endpoints for the frontend to request workout adjustments.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { User, Workout, Exercise, Feedback, ExercisePerformance } = require('./models');
const TrainingEngine = require('./training_engine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/app', express.static('app'));
app.use('/js', express.static('js'));

// Redirect root to Landing Page
app.get('/', (req, res) => {
    res.redirect('/app/index.html');
});

const engine = new TrainingEngine();

/**
 * POST /api/workout/generate
 * Generates an adjusted workout based on user feedback and history.
 * 
 * Expected Payload:
 * {
 *   "user": { ... },
 *   "plannedWorkout": { ... },
 *   "feedback": { sleepQuality: 1-5, soreness: 1-5, stressLevel: "Low/High", painFlags: [] },
 *   "history": [ { exerciseId, weight, rpe, ... } ]
 * }
 */
app.post('/api/workout/generate', (req, res) => {
    try {
        const { user, plannedWorkout, feedback, history } = req.body;

        // Reconstruct objects from JSON payload (to ensure methods work if we add them later)
        // For MVP, plain objects might work if logic doesn't rely on 'instanceof'
        // But let's be safe and map them.

        // 1. Map Feedback
        const feedbackObj = new Feedback(
            feedback.sleepQuality,
            feedback.soreness,
            feedback.stressLevel,
            feedback.painFlags
        );

        // 2. Map Workout
        // Assuming user sends the full planned workout structure
        // In a real app, we might fetch this from DB by ID, but here we accept it in payload
        const workoutObj = new Workout(
            plannedWorkout.id,
            plannedWorkout.userId,
            plannedWorkout.name,
            plannedWorkout.exercises.map(e => new Exercise(
                e.id, e.name, e.type, e.muscleGroups, e.weight, e.sets, e.reps, e.rpeTarget
            ))
        );

        // 3. Map History
        const historyObjs = history ? history.map(h => new ExercisePerformance(
            h.exerciseId, h.weight, h.completedReps, h.completedSets, h.rpe
        )) : [];

        const userObj = new User(user.id, user.name);

        // Run the Engine
        const result = engine.generateDailyWorkout(userObj, workoutObj, feedbackObj, historyObjs);

        // Return result
        res.json({
            status: 'success',
            data: result
        });

    } catch (error) {
        console.error("Error generating workout:", error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Import Config
const config = require('./js/config');

app.listen(PORT, () => {
    console.log(`Adaptive Training API running on http://localhost:${PORT}`);
    console.log(`Endpoint: POST /api/workout/generate`);
    console.log(`AI Coach Proxy: POST /api/ai/coach`);
});

/**
 * POST /api/ai/coach
 * Dynamic Proxy endpoint for AI Coach (supports Anthropic and Groq).
 */
app.post('/api/ai/coach', async (req, res) => {
    try {
        const { messages, system, stream } = req.body;
        const provider = config.AI_PROVIDER || 'groq';
        let apiUrl, headers, body;

        if (provider === 'groq') {
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            const apiKey = config.GROQ_API_KEY;
            if (!apiKey) return res.status(401).json({ error: 'Groq API Key not configured.' });
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            body = {
                model: config.AI_MODEL || 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: system },
                    ...messages
                ],
                stream: stream || false,
                max_tokens: 1024
            };
        } else {
            // Default to Anthropic
            apiUrl = 'https://api.anthropic.com/v1/messages';
            const apiKey = config.CLAUDE_API_KEY;
            if (!apiKey) return res.status(401).json({ error: 'Claude API Key not configured.' });

            headers = {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'messages-2023-12-15'
            };
            body = {
                model: config.AI_MODEL || 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system,
                messages,
                stream: stream || false
            };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            res.end();
        } else {
            const data = await response.json();
            res.json(data);
        }

    } catch (error) {
        console.error("AI Proxy Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

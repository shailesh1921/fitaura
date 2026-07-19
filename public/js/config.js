/**
 * Fitaura Elite Global Configuration
 */

const FITAURA_CONFIG = {
    // Anthropic Claude API Key (Optional)
    CLAUDE_API_KEY: 'YOUR_CLAUDE_API_KEY',
    // Groq API Key (Recommended Free Tier)
    GROQ_API_KEY: 'YOUR_GROQ_API_KEY',
    // Global AI Provider: 'anthropic' or 'groq'
    AI_PROVIDER: 'groq',
    AI_MODEL: 'llama-3.3-70b-versatile',

    // ─── FOOD SCANNER — NVIDIA NIM (Best Answer) ─────────
    NVIDIA_API_KEY: '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',
    FOOD_MODEL: 'meta/llama-3.2-11b-vision-instruct',
    FOOD_SCANNER: {
        maxRetries: 2,
        timeoutMs: 30000,
        autoScanInterval: 5000,
        minConfidence: 75,
    },
    DEBUG_MODE: false
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FITAURA_CONFIG;
} else {
    window.FITAURA_CONFIG = FITAURA_CONFIG;
}

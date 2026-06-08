/**
 * Fitaura Elite Global Configuration
 * ----------------------------------
 * This file manages global settings and API keys for the Fitaura platform.
 * For security, do not share this file if it contains active production keys.
 */

const FITAURA_CONFIG = {
    // Anthropic Claude API Key (Optional)
    CLAUDE_API_KEY: 'YOUR_CLAUDE_API_KEY',

    // Groq API Key (Recommended Free Tier)
    GROQ_API_KEY: 'YOUR_GROQ_API_KEY',

    // Global AI Provider: 'anthropic' or 'groq'
    AI_PROVIDER: 'groq',

    // Recommended Groq Model (Free & Fast)
    AI_MODEL: 'llama-3.3-70b-versatile',
    DEBUG_MODE: false
};

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FITAURA_CONFIG;
} else {
    // Set for browser usage
    window.FITAURA_CONFIG = FITAURA_CONFIG;
}

const { db } = require('../firebase-admin');
const axios = require('axios');

/**
 * Normalizes provider data into the unified schema.
 */
function normalizeData(provider, rawData) {
    // This is a stub. In a real app, you would parse the specific 
    // JSON response from Google Fit, Fitbit, etc., into this format.
    const normalized = {
        steps: rawData.steps || 0,
        heartRateAvg: rawData.heartRateAvg || null,
        heartRateResting: rawData.heartRateResting || null,
        sleepMinutes: rawData.sleepMinutes || 0,
        sleepStages: rawData.sleepStages || { light: 0, deep: 0, rem: 0, awake: 0 },
        activeCalories: rawData.activeCalories || 0,
        hrv: rawData.hrv || null,
        spo2: rawData.spo2 || null,
        bloodPressure: rawData.bloodPressure || null,
        recoveryScore: rawData.recoveryScore || null,
    };
    
    // Simple recovery score calculation if missing but we have HR and Sleep
    if (!normalized.recoveryScore && normalized.heartRateResting && normalized.sleepMinutes) {
        // Dummy algorithm: 100 - (Resting HR - 40) + (Sleep Hours * 5)
        let score = 100 - (normalized.heartRateResting - 40) + ((normalized.sleepMinutes / 60) * 5);
        normalized.recoveryScore = Math.min(100, Math.max(0, Math.round(score)));
    }
    
    return normalized;
}

/**
 * Fetches and syncs data for a specific user and provider.
 */
async function syncProviderData(uid, providerId) {
    if (!db) {
        console.warn(`[SyncService] Firebase not initialized. Skipping sync for ${uid} - ${providerId}`);
        return { success: false, message: 'Firebase not initialized' };
    }

    try {
        console.log(`[SyncService] Starting sync for user ${uid} from ${providerId}`);
        
        // 1. Get Integration doc to get access token
        const integrationRef = db.collection('users').doc(uid).collection('integrations').doc(providerId);
        const integrationDoc = await integrationRef.get();
        
        if (!integrationDoc.exists || integrationDoc.data().status !== 'active') {
             return { success: false, message: 'Integration not active' };
        }
        
        const { accessToken } = integrationDoc.data();
        let rawData = {};
        
        // 2. Fetch data based on provider (Stubbed for now)
        if (providerId === 'google-fit') {
            // e.g., await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', { headers: { Authorization: `Bearer ${accessToken}` } });
            rawData = { steps: 8500, activeCalories: 450, heartRateAvg: 72 };
        } else if (providerId === 'fitbit') {
            // e.g., await axios.get('https://api.fitbit.com/1/user/-/activities/date/today.json', ...);
            rawData = { steps: 9200, sleepMinutes: 420, heartRateResting: 58 };
        } else if (providerId === 'oura') {
            rawData = { hrv: 45, sleepMinutes: 450, recoveryScore: 82, heartRateResting: 55 };
        }

        const today = new Date().toISOString().split('T')[0];
        
        // 3. Normalize Data
        const normalized = normalizeData(providerId, rawData);
        
        // 4. Merge into Daily Metrics
        const dailyRef = db.collection('users').doc(uid).collection('dailyMetrics').doc(today);
        const dailyDoc = await dailyRef.get();
        
        let mergedData = {};
        let sources = {};
        
        if (dailyDoc.exists) {
            mergedData = dailyDoc.data();
            sources = mergedData.sources || {};
        }
        
        // Merge logic: For MVP, just overwrite if this provider has data. 
        // In a real app, you'd check which source is prioritized for which metric.
        Object.keys(normalized).forEach(key => {
            if (normalized[key] !== null && normalized[key] !== undefined && key !== 'sources') {
                mergedData[key] = normalized[key];
                sources[key] = providerId;
            }
        });
        mergedData.sources = sources;
        mergedData.date = today;
        
        await dailyRef.set(mergedData, { merge: true });
        
        // 5. Log Sync History
        await db.collection('users').doc(uid).collection('syncHistory').add({
            timestamp: new Date(),
            source: providerId,
            recordsSynced: Object.keys(normalized).filter(k => normalized[k] !== null).length,
            status: 'success',
            message: 'Synced successfully'
        });
        
        console.log(`[SyncService] Completed sync for user ${uid} from ${providerId}`);
        return { success: true };
        
    } catch (error) {
        console.error(`[SyncService] Error syncing ${providerId} for ${uid}:`, error.message);
        
        if (db) {
            // Log Alert
            await db.collection('users').doc(uid).collection('alerts').add({
                timestamp: new Date(),
                providerId: providerId,
                message: `Sync failed: ${error.message}`,
                isRead: false
            });
            // Log History
             await db.collection('users').doc(uid).collection('syncHistory').add({
                timestamp: new Date(),
                source: providerId,
                recordsSynced: 0,
                status: 'failure',
                message: error.message
            });
        }
        
        return { success: false, message: error.message };
    }
}

module.exports = { syncProviderData, normalizeData };

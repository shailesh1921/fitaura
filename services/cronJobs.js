const cron = require('node-cron');
const { db } = require('../firebase-admin');
const { syncProviderData } = require('./syncService');

/**
 * Initializes all scheduled cron jobs for data synchronization.
 */
function initCronJobs() {
    if (!db) {
        console.warn('[Cron] Firebase not initialized. Auto-sync jobs will not run.');
        return;
    }

    console.log('[Cron] Initializing auto-sync scheduled jobs...');

    // Runs every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Running 5-minute auto-sync check...');
        try {
            const usersSnapshot = await db.collection('users').get();
            
            for (const userDoc of usersSnapshot.docs) {
                const uid = userDoc.id;
                
                // Check sync settings
                const settingsDoc = await db.collection('users').doc(uid).collection('settings').doc('sync').get();
                if (!settingsDoc.exists) continue;
                
                const { backgroundSyncEnabled, syncInterval } = settingsDoc.data();
                if (!backgroundSyncEnabled || syncInterval === 'manual') continue;
                
                // Simple logic for MVP: Since we run every 5m, we just sync if interval is '5m'.
                // If interval is '15m', we'd normally check the last sync time.
                // For demonstration, we'll sync if interval is 5m, 15m, 30m, 1h 
                // (In a real production app, we would query the last sync time from syncHistory)
                
                // Fetch active integrations
                const integrationsSnapshot = await db.collection('users').doc(uid).collection('integrations').where('status', '==', 'active').get();
                
                for (const integrationDoc of integrationsSnapshot.docs) {
                    const providerId = integrationDoc.id;
                    // In a production app, we would add logic here to check if (Date.now() - lastSyncTime > syncIntervalMs)
                    await syncProviderData(uid, providerId);
                }
            }
        } catch (error) {
            console.error('[Cron] Error in 5-minute sync job:', error);
        }
    });
    
    // Runs daily at 7:00 AM for sleep data
    cron.schedule('0 7 * * *', async () => {
        console.log('[Cron] Running 7:00 AM daily sleep sync...');
        try {
            const usersSnapshot = await db.collection('users').get();
            for (const userDoc of usersSnapshot.docs) {
                const uid = userDoc.id;
                const settingsDoc = await db.collection('users').doc(uid).collection('settings').doc('sync').get();
                if (settingsDoc.exists && settingsDoc.data().sleepDataSyncTime) {
                    // Sync active providers that usually provide sleep data
                    const sleepProviders = ['oura', 'whoop', 'fitbit'];
                    for (const provider of sleepProviders) {
                        const integrationDoc = await db.collection('users').doc(uid).collection('integrations').doc(provider).get();
                        if (integrationDoc.exists && integrationDoc.data().status === 'active') {
                            await syncProviderData(uid, provider);
                        }
                    }
                }
            }
        } catch (error) {
             console.error('[Cron] Error in daily sleep sync job:', error);
        }
    });

    console.log('[Cron] Auto-sync scheduled jobs registered.');
}

module.exports = { initCronJobs };

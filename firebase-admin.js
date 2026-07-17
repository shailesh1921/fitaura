const admin = require('firebase-admin');

// To use a service account for actual database access:
// 1. Download the serviceAccountKey.json from Firebase Console
// 2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// OR initialize with credential object if provided in env vars.

try {
  // We'll initialize with default credentials. If not running in GCP/Firebase,
  // it requires GOOGLE_APPLICATION_CREDENTIALS to be set in the environment.
  // For local development without a key yet, this might warn or fail on actual DB calls.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
      admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
      });
  } else {
       admin.initializeApp();
  }
  
  console.log('[Firebase] Admin SDK initialized successfully.');
} catch (error) {
  console.error('[Firebase] Error initializing Admin SDK:', error.message);
  // We catch this so the server doesn't crash if Firebase isn't configured yet during MVP scaffolding
}

let db;
try {
    db = admin.firestore();
} catch (e) {
    console.error("[Firebase] Firestore could not be initialized. Check credentials.");
}

module.exports = { admin, db };

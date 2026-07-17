// Firebase Client SDK Configuration (MVP Stub)
// In a real app, replace with actual config from Firebase Console
const firebaseConfig = {
    apiKey: "dummy-api-key",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummy"
};

try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    window.db = db;
    // MVP Fake Auth
    window.currentUser = { uid: 'test_user_123' };
} catch(e) {
    console.error("Firebase Client init error", e);
}

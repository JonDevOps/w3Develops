import { initializeApp, getApps, App, credential } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is the single source of truth for the server-side Firebase Admin SDK.
// It ensures that the app is initialized only once.

let app: App;
let firestore: Firestore;

if (getApps().length === 0) {
  app = initializeApp({
    // Use applicationDefault to automatically find credentials in a Google Cloud environment.
    credential: credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} else {
  app = getApps()[0];
}

firestore = getFirestore(app);

// Export the initialized instances for use in server actions.
export { app as adminApp, firestore as adminFirestore };

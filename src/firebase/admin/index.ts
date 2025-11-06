import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is the single source of truth for the server-side Firebase Admin SDK.
// It ensures that the app is initialized only once.

let app: admin.app.App;
let firestore: Firestore;

if (admin.apps.length === 0) {
  app = admin.initializeApp({
    // Use applicationDefault to automatically find credentials in a Google Cloud environment.
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
} else {
  app = admin.apps[0]!;
}

firestore = getFirestore(app);

// Export the initialized instances for use in server actions.
export { app as adminApp, firestore as adminFirestore };

import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is the single source of truth for the server-side Firebase Admin SDK.
// It ensures that the app is initialized only once.

let app: admin.app.App;
let firestore: Firestore;

if (!admin.apps.length) {
  // In environments like Firebase App Hosting or Cloud Run, the credentials
  // are discovered automatically. For local development, you need to set
  // GOOGLE_APPLICATION_CREDENTIALS or log in with `firebase login`.
  app = admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
  firestore = getFirestore(app);
} else {
  app = admin.apps[0]!;
  firestore = getFirestore(app);
}


// Export the initialized instances for use in server actions.
export { app as adminApp, firestore as adminFirestore };

import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is the single source of truth for the server-side Firebase Admin SDK.
// It ensures that the app is initialized only once.

let app: admin.app.App;
let firestore: Firestore;

if (admin.apps.length === 0) {
  // Check if the GOOGLE_APPLICATION_CREDENTIALS environment variable is set.
  // This is a common practice for local development with the Admin SDK.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
     app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // In environments like Firebase App Hosting or Cloud Run, the credentials
    // are discovered automatically without the env var.
    app = admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
} else {
  app = admin.apps[0]!;
}

firestore = getFirestore(app);

// Export the initialized instances for use in server actions.
export { app as adminApp, firestore as adminFirestore };


import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  // The FIREBASE_WEBAPP_CONFIG environment variable is set by the build system
  // and contains the full client-side config as a JSON string.
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      const app = initializeApp(config);
      return getSdks(app);
    } catch (e) {
      console.error("Failed to parse FIREBASE_WEBAPP_CONFIG. Falling back to default config.", e);
    }
  }

  // Fallback for client-side rendering and local development,
  // where NEXT_PUBLIC_ variables are available.
  const app = initializeApp(firebaseConfig);
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const app = firebaseApp;
  // Use initializeFirestore to avoid issues with multiple instantiations
  const firestore = initializeFirestore(app, {});

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: firestore
  };
}

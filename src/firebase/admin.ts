import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// This is a guard to prevent re-initializing the app on hot reloads.
export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // When running in a Google Cloud environment, the SDK can automatically
  // discover the service account credentials.
  return initializeApp();
}

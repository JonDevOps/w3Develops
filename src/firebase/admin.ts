import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// This is a guard to prevent re-initializing the app on hot reloads.
export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // process.env.SERVICE_ACCOUNT is a JSON string, so we need to parse it.
  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT as string);

  return initializeApp({
    credential: credential.cert(serviceAccount)
  });
}

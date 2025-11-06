import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { firebaseConfig } from './config'

// This is a temporary solution to get server-side rendering working.
// In a real application, you would want to use a more secure way to store
// and access your service account credentials.
const serviceAccount = {
  projectId: firebaseConfig.projectId,
  clientEmail: `firebase-adminsdk-v2p7w@${firebaseConfig.projectId}.iam.gserviceaccount.com`,
  privateKey:
    process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ||
    '',
}

let app: App

export async function initializeServerApp() {
  if (app) {
    return app
  }

  const apps = getApps()
  if (apps.length > 0) {
    app = apps[0]
    return app
  }
  
  if (serviceAccount.privateKey) {
    app = initializeApp({
      credential: cert(serviceAccount),
    })
    return app
  } else {
    // This is the default for App Hosting
    app = initializeApp()
    return app;
  }
}

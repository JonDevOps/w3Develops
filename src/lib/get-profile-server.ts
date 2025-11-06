import 'server-only';
import { initializeServerApp } from "@/firebase/initialize-server-app";
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

export async function getProfile(uid: string) {
  try {
    const adminApp = await initializeServerApp();
    const adminFirestore = getAdminFirestore(adminApp);
    const profileDoc = await adminFirestore.collection('users').doc(uid).collection('profile').doc('data').get();

    if (!profileDoc.exists) {
      return null;
    }

    return profileDoc.data();
  } catch (error) {
    console.error("Error fetching profile on server:", error);
    return null;
  }
}

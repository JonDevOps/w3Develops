'use server'

import { getFirestore } from 'firebase-admin/firestore'
import { initializeServerApp } from '@/firebase/initialize-server-app'

export async function getProfile(userId: string) {
  const adminApp = await initializeServerApp()
  const firestore = getFirestore(adminApp)
  const profileDoc = await firestore.collection('users').doc(userId).collection('profile').doc('data').get()

  if (!profileDoc.exists) {
    return null
  }

  return profileDoc.data()
}

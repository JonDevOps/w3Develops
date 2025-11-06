'use server'

import { initializeServerApp } from '@/firebase/initialize-server-app'
import { getAuth } from 'firebase-admin/auth'
import { cookies } from 'next/headers'

export async function getUser() {
  const app = await initializeServerApp()
  const auth = getAuth(app)

  const idToken = cookies().get('firebaseIdToken')?.value
  if (!idToken) {
    return null
  }

  try {
    const decodedIdToken = await auth.verifyIdToken(idToken)
    return decodedIdToken
  } catch (error) {
    console.error('Error verifying ID token:', error)
    return null
  }
}

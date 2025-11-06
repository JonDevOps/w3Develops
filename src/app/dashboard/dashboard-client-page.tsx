'use client'

import { useDoc, useFirestore } from '@/firebase'
import { doc } from 'firebase/firestore'
import { useMemo } from 'react';
import type { UserProfile } from '@/lib/types';

export default function DashboardClientPage({ initialProfile, uid }: { initialProfile: UserProfile | null; uid: string; }) {
  const firestore = useFirestore()

  const userProfileRef = useMemo(() => {
    if (!firestore || !uid) return null
    return doc(firestore, 'users', uid, 'profile', 'data')
  }, [uid, firestore])

  const {
    data: userProfile,
  } = useDoc(userProfileRef, {
      initialData: initialProfile ? { ...initialProfile, id: uid } : null
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Welcome back, {userProfile?.displayName || initialProfile?.displayName || 'developer'}!
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/80">
          This is your personal dashboard. More features coming soon!
        </p>
      </div>
    </div>
  )
}

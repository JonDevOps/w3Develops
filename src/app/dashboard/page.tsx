'use client'

import { useDoc, useFirebase, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'

export default function DashboardPage() {
  const { user, isUserLoading } = useFirebase()

  const userProfileRef = useMemoFirebase(() => {
    if (isUserLoading || !user || !firestore) return null
    return doc(firestore, 'users', user.uid, 'profile', 'data')
  }, [user, firestore, isUserLoading])

  const {
    data: userProfile,
    isLoading: isProfileLoading,
  } = useDoc(userProfileRef)
  const { firestore } = useFirebase()

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
            Loading...
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/80">
            Please wait while we fetch your information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Welcome back, {userProfile?.displayName || 'developer'}!
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/80">
          This is your personal dashboard. More features coming soon!
        </p>
      </div>
    </div>
  )
}

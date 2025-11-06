'use client'

import {
  useDoc,
  useFirebase,
  useMemoFirebase,
  useUser,
} from '@/firebase'
import { doc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isUserLoading } = useUser()
  const { firestore } = useFirebase()
  const router = useRouter()

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, 'users', user.uid, 'profile', 'data')
  }, [user, firestore])

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
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

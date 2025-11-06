import { getUser } from '@/firebase/get-user-server'
import { getProfile } from '@/firebase/get-profile-server'

export default async function DashboardPage() {
  const user = await getUser()
  const userProfile = user ? await getProfile(user.uid) : null

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

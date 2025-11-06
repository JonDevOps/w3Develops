'use client';

import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

function DashboardLoading() {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="h-12 w-1/2 animate-pulse rounded-md bg-muted mb-4"></div>
          <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    );
}

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'profile', 'data');
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  if (isUserLoading || isProfileLoading || !user) {
    return <DashboardLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Welcome back, {userProfile?.displayName || user.email || 'developer'}!
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/80">
          This is your account dashboard. You can manage your profile and find study groups.
        </p>
      </div>

       <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Keep your profile up-to-date so others can learn about you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/profile">Edit Your Profile <ArrowRight className="ml-2"/></Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Study Groups</CardTitle>
                    <CardDescription>Find or create a study group to collaborate with other developers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/groups">Explore Study Groups <ArrowRight className="ml-2"/></Link>
                    </Button>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}

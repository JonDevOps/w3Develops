'use client';

import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Loader2, Edit, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

function DashboardLoading() {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-1/2 rounded-md bg-muted"></div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="h-6 w-1/4 rounded-md bg-muted"></div>
                <div className="h-4 w-3/4 rounded-md bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    <div className="h-4 w-full rounded-md bg-muted"></div>
                    <div className="h-4 w-full rounded-md bg-muted"></div>
                    <div className="h-4 w-2/3 rounded-md bg-muted"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="h-6 w-1/3 rounded-md bg-muted"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-8 w-full rounded-md bg-muted"></div>
                         <div className="h-8 w-full rounded-md bg-muted"></div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
}

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Hello, {userProfile?.displayName || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Welcome to your dashboard. Here's a summary of your profile.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>About You</CardTitle>
                    <CardDescription>A brief look at your professional bio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        {userProfile?.bio || "You haven't written a bio yet. Add one to let others know more about you!"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Projects</CardTitle>
                    <CardDescription>Projects you are currently working on.</CardDescription>
                </CardHeader>
                <CardContent>
                    {userProfile?.projects && userProfile.projects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {userProfile.projects.map((project, index) => (
                                <Badge key={index} variant="secondary">{project}</Badge>
                            ))}
                        </div>
                    ) : (
                         <p className="text-muted-foreground">No projects listed yet. Add some to your profile!</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                     <Button asChild variant="outline">
                        <Link href="/profile">
                            <Edit className="mr-2"/> Edit Your Profile
                        </Link>
                    </Button>
                    {userProfile?.portfolioUrl && (
                        <Button asChild variant="outline">
                            <a href={userProfile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2" /> View Portfolio
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}

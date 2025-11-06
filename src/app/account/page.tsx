'use client';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid) as DocumentReference;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  if (isUserLoading || isProfileLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to see your account details.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Hello, {userProfile?.displayName || user.email}!</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This is your personal space. From here you can manage your profile, view your projects, and connect with study groups.</p>
          <Button asChild>
            <Link href="/profile/edit">Edit Your Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    
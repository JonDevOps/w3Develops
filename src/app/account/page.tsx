'use client';

import { useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, DocumentReference, collection, query, where, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserProfile, StudyGroup, Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect to login if user is not loaded or not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const userProjectsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'projects'), where('ownerId', '==', user.uid)) as Query;
  }, [user, firestore]);

  const { data: projects, isLoading: isProjectsLoading } = useCollection<Project>(userProjectsQuery);

  const userGroupsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'studyGroups'), where('memberIds', 'array-contains', user.uid)) as Query;
  }, [user, firestore]);

  const { data: studyGroups, isLoading: isGroupsLoading } = useCollection<StudyGroup>(userGroupsQuery);


  if (isUserLoading || isProfileLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !userProfile) {
    // This state should be brief as the useEffect will redirect.
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline mb-6">Hello, {userProfile?.displayName || user.email}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>A summary of your information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-muted-foreground">
                {userProfile?.bio || "You haven't added a bio yet."}
             </p>
            <Button asChild size="sm">
              <Link href="/profile/edit">Edit Your Profile</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>Projects you have created.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProjectsLoading ? <p>Loading projects...</p> : 
              (projects && projects.length > 0) ? (
                <ul className="space-y-2">
                  {projects.map(p => <li key={p.id} className="text-sm font-medium">{p.name}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't added any projects yet.</p>
              )
            }
             <Button asChild size="sm" variant="secondary">
              <Link href="/projects/create">Add a Project</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Study Groups</CardTitle>
            <CardDescription>Groups you are a member of.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGroupsLoading ? <p>Loading groups...</p> : 
              (studyGroups && studyGroups.length > 0) ? (
                 <div className="flex flex-wrap gap-2">
                  {studyGroups.map(g => <Badge key={g.id} variant="secondary">{g.name}</Badge>)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't joined any groups yet.</p>
              )
            }
             <Button asChild size="sm" variant="secondary">
              <Link href="/groups">Find a Group</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

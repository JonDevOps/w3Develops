'use client';

import { useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, DocumentReference, collection, query, where, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserProfile, StudyGroup, Cohort } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

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

  const userCohortsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'cohorts'), where('memberIds', 'array-contains', user.uid)) as Query;
  }, [user, firestore]);

  const { data: cohorts, isLoading: isCohortsLoading } = useCollection<Cohort>(userCohortsQuery);

  const userGroupsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'studyGroups'), where('memberIds', 'array-contains', user.uid)) as Query;
  }, [user, firestore]);

  const { data: studyGroups, isLoading: isGroupsLoading } = useCollection<StudyGroup>(userGroupsQuery);


  if (isUserLoading || isProfileLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  if (!userProfile) {
    // This case can happen briefly if the user doc hasn't been created yet after signup
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userProfile.profilePictureUrl || user.photoURL || ''} alt={userProfile.displayName || ''} />
          <AvatarFallback className="text-3xl">{userProfile.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-headline">Hello, {userProfile.displayName || user.email}!</h1>
          <p className="text-muted-foreground max-w-xl mt-2">{userProfile.bio || "You haven't added a bio yet. Edit your profile to tell the community about yourself."}</p>
          <div className="flex gap-2 mt-4">
              <Button asChild>
                <Link href="/profile/edit">Edit Your Profile</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/users/${user.uid}`}>View Public Profile</Link>
              </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile.skills && userProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {userProfile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Add skills to your profile to let others know what you're learning.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
                {userProfile.socialLinks?.github ? (
                    <a href={userProfile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Github className="w-5 h-5" /> GitHub
                    </a>
                ) : <p className="text-sm text-muted-foreground">No GitHub link added.</p>}
                 {userProfile.socialLinks?.linkedin ? (
                    <a href={userProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Linkedin className="w-5 h-5" /> LinkedIn
                    </a>
                ) : null}
                 {userProfile.socialLinks?.twitter ? (
                    <a href={userProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Twitter className="w-5 h-5" /> Twitter
                    </a>
                ) : null}
            </CardContent>
        </Card>

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Build Cohorts</CardTitle>
            <CardDescription>Cohorts you have created or joined to build projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCohortsLoading ? <p>Loading cohorts...</p> : 
              (cohorts && cohorts.length > 0) ? (
                <ul className="divide-y">
                  {cohorts.map(c => (
                     <li key={c.id} className="py-2">
                      <Link href={`/cohorts/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't joined any cohorts yet.</p>
              )
            }
             <div className="flex gap-2 pt-4">
                <Button asChild size="sm" variant="secondary">
                  <Link href="/cohorts">Explore Cohorts</Link>
                </Button>
                 <Button asChild size="sm">
                  <Link href="/cohorts/join">Join a Cohort</Link>
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Study Groups</CardTitle>
            <CardDescription>Groups you are a member of to learn and collaborate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGroupsLoading ? <p>Loading groups...</p> : 
              (studyGroups && studyGroups.length > 0) ? (
                 <ul className="divide-y">
                  {studyGroups.map(g => (
                    <li key={g.id} className="py-2">
                      <Link href={`/groups/${g.id}`} className="font-medium hover:underline">{g.name}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't joined any groups yet.</p>
              )
            }
            <div className="flex gap-2 pt-4">
                <Button asChild size="sm" variant="secondary">
                <Link href="/groups">Explore Groups</Link>
                </Button>
                 <Button asChild size="sm">
                  <Link href="/groups/join">Join a Group</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

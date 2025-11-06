'use client';

import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useMemo, useEffect, useState } from 'react';
import { doc, DocumentReference, collection, query, where, Query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserProfile, StudyGroup, Cohort } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { JoinCohortModal } from '@/components/modals/JoinCohortModal';
import { JoinGroupModal } from '@/components/modals/JoinGroupModal';

function AccountPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="rounded-full bg-muted h-24 w-24"></div>
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
          <div className="h-4 bg-muted rounded w-80"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-10 w-32 bg-muted rounded-md"></div>
            <div className="h-10 w-32 bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="lg:col-span-1 rounded-lg border bg-card p-6 space-y-3">
            <div className="h-6 w-24 bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
        </div>
        <div className="lg:col-span-1 rounded-lg border bg-card p-6 space-y-3">
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
        </div>
      </div>
       <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <div className="h-6 w-48 bg-muted rounded"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
          <div className="h-10 mt-4 w-full bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted rounded"></div>
        </div>
         <div className="rounded-lg border bg-card p-6 space-y-3">
          <div className="h-6 w-48 bg-muted rounded"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
          <div className="h-10 mt-4 w-full bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const userCohortsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, 'cohorts'), where('memberIds', 'array-contains', user.uid)) as Query<Cohort>;
  }, [user, firestore]);

  const { data: cohorts, isLoading: isCohortsLoading } = useCollection<Cohort>(userCohortsQuery);

  const userGroupsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, 'studyGroups'), where('memberIds', 'array-contains', user.uid)) as Query<StudyGroup>;
  }, [user, firestore]);

  const { data: studyGroups, isLoading: isGroupsLoading } = useCollection<StudyGroup>(userGroupsQuery);


  if (isUserLoading || isProfileLoading || !userProfile) {
    return <AccountPageSkeleton />;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  return (
    <>
      <JoinCohortModal isOpen={isCohortModalOpen} onClose={() => setIsCohortModalOpen(false)} />
      <JoinGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userProfile.profilePictureUrl || user.photoURL || ''} alt={userProfile.username || ''} />
            <AvatarFallback className="text-3xl">{userProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-headline">Hello, {userProfile.username || user.email}!</h1>
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
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
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
          
          <Card className="lg:col-span-1">
              <CardHeader>
                  <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                  {userProfile.socialLinks?.github ? (
                      <a href={userProfile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                          <Github className="w-5 h-5" />
                      </a>
                  ) : <p className="text-sm text-muted-foreground">No GitHub</p>}
                   {userProfile.socialLinks?.linkedin ? (
                      <a href={userProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                          <Linkedin className="w-5 h-5" />
                      </a>
                  ) : <p className="text-sm text-muted-foreground">No LinkedIn</p>}
                   {userProfile.socialLinks?.twitter ? (
                      <a href={userProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                          <Twitter className="w-5 h-5" />
                      </a>
                  ) : <p className="text-sm text-muted-foreground">No Twitter</p>}
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
              {isCohortsLoading ? <div className="h-10 w-full bg-muted rounded animate-pulse"></div> : 
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
                   <Button size="sm" onClick={() => setIsCohortModalOpen(true)}>
                    Join a Cohort
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
              {isGroupsLoading ? <div className="h-10 w-full bg-muted rounded animate-pulse"></div> : 
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
                   <Button size="sm" onClick={() => setIsGroupModalOpen(true)}>
                    Join a Group
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

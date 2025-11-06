'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, DocumentReference, collection, query, where, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { UserProfile, StudyGroup, Cohort } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Twitter, BrainCircuit, Users } from 'lucide-react';
import Link from 'next/link';

function ProfilePageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="rounded-full bg-muted h-32 w-32 flex-shrink-0"></div>
          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <div className="h-8 bg-muted rounded w-48 mx-auto md:mx-0"></div>
            <div className="h-4 bg-muted rounded w-full max-w-lg mx-auto md:mx-0"></div>
            <div className="h-4 bg-muted rounded w-full max-w-md mx-auto md:mx-0"></div>
            <div className="flex justify-center md:justify-start items-center gap-4 pt-2">
              <div className="h-6 w-6 bg-muted rounded"></div>
              <div className="h-6 w-6 bg-muted rounded"></div>
              <div className="h-6 w-6 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
        <CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
          <CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent>
        </Card>
        <Card>
          <CardHeader><div className="h-6 w-32 bg-muted rounded"></div></CardHeader>
          <CardContent><div className="h-10 w-full bg-muted rounded"></div></CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const firestore = useFirestore();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      setIsProfileLoading(true);
      const userDocRef = doc(firestore, 'users', userId) as DocumentReference<UserProfile>;
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setUserProfile(null);
      }
      setIsProfileLoading(false);
    };

    fetchUserProfile();
  }, [userId, firestore]);

  const userCohortsQuery = useMemo(() => {
    if (!userId) return null;
    return query(collection(firestore, 'cohorts'), where('memberIds', 'array-contains', userId)) as Query;
  }, [userId, firestore]);

  const { data: cohorts, isLoading: isCohortsLoading } = useCollection<Cohort>(userCohortsQuery);

  const userGroupsQuery = useMemo(() => {
    if (!userId) return null;
    return query(collection(firestore, 'studyGroups'), where('memberIds', 'array-contains', userId)) as Query;
  }, [userId, firestore]);

  const { data: studyGroups, isLoading: isGroupsLoading } = useCollection<StudyGroup>(userGroupsQuery);
  
  if (isProfileLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!userProfile) {
    return <div className="text-center py-10">User not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-primary flex-shrink-0">
            <AvatarImage src={userProfile.profilePictureUrl || ''} alt={userProfile.username} />
            <AvatarFallback className="text-5xl">{userProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-headline">{userProfile.username}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">{userProfile.bio}</p>
            <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
              {userProfile.socialLinks?.github && (
                <a href={userProfile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Github className="w-6 h-6" />
                </a>
              )}
              {userProfile.socialLinks?.linkedin && (
                <a href={userProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {userProfile.socialLinks?.twitter && (
                <a href={userProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><BrainCircuit className="w-5 h-5" /> Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {userProfile.skills && userProfile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
            </div>
          ) : <p className="text-sm text-muted-foreground">No skills listed yet.</p>}
        </CardContent>
      </Card>

       <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="mr-2" />Build Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            {isCohortsLoading ? <div className="h-10 w-full bg-muted rounded animate-pulse"></div> :
             cohorts && cohorts.length > 0 ? (
                <ul className="space-y-2">
                    {cohorts.map(c => (
                        <li key={c.id}>
                          <Link href={`/cohorts/${c.id}`} className="font-medium p-2 rounded-md hover:bg-accent flex justify-between items-center">
                            <span>{c.name}</span>
                            <Badge variant="secondary">{c.topic}</Badge>
                          </Link>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-muted-foreground">Not a member of any cohorts yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="mr-2" />Study Groups</CardTitle>
          </CardHeader>
          <CardContent>
             {isGroupsLoading ? <div className="h-10 w-full bg-muted rounded animate-pulse"></div> :
             studyGroups && studyGroups.length > 0 ? (
                <ul className="space-y-2">
                    {studyGroups.map(g => (
                        <li key={g.id}>
                          <Link href={`/groups/${g.id}`} className="font-medium p-2 rounded-md hover:bg-accent flex justify-between items-center">
                            <span>{g.name}</span>
                            <Badge variant="secondary">{g.topic}</Badge>
                          </Link>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-muted-foreground">Not a member of any groups yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

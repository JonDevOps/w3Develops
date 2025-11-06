'use client';

import { useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, DocumentReference, collection, query, where, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { UserProfile, StudyGroup, Cohort } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Twitter, Mail, BrainCircuit, CalendarCheck } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, 'users', userId) as DocumentReference<UserProfile>;
  }, [userId, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const userCohortsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, 'cohorts'), where('memberIds', 'array-contains', userId)) as Query;
  }, [userId, firestore]);

  const { data: cohorts, isLoading: isCohortsLoading } = useCollection<Cohort>(userCohortsQuery);

  const userGroupsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, 'studyGroups'), where('memberIds', 'array-contains', userId)) as Query;
  }, [userId, firestore]);

  const { data: studyGroups, isLoading: isGroupsLoading } = useCollection<StudyGroup>(userGroupsQuery);
  
  if (isProfileLoading) {
    return <div className="text-center py-10">Loading user profile...</div>;
  }

  if (!userProfile) {
    return <div className="text-center py-10">User not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarImage src={userProfile.profilePictureUrl || ''} alt={userProfile.displayName} />
            <AvatarFallback className="text-5xl">{userProfile.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-headline">{userProfile.displayName}</h1>
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
               <a href={`mailto:${userProfile.email}`} className="text-muted-foreground hover:text-foreground">
                  <Mail className="w-6 h-6" />
                </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
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

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><CalendarCheck className="w-5 h-5" />Learning Pace</CardTitle>
            </CardHeader>
             <CardContent>
                <Badge variant="secondary" className="text-base">{userProfile.learningPace || 'Not specified'}</Badge>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member of Build Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            {isCohortsLoading ? <p>Loading...</p> :
             cohorts && cohorts.length > 0 ? (
                <ul className="space-y-2">
                    {cohorts.map(c => (
                        <li key={c.id} className="font-medium p-2 rounded-md hover:bg-accent flex justify-between items-center">
                          <span>{c.name}</span>
                          <Badge variant="secondary">{c.topic}</Badge>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-muted-foreground">Not a member of any cohorts yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member of Study Groups</CardTitle>
          </CardHeader>
          <CardContent>
             {isGroupsLoading ? <p>Loading...</p> :
             studyGroups && studyGroups.length > 0 ? (
                <ul className="space-y-2">
                    {studyGroups.map(g => (
                        <li key={g.id} className="font-medium p-2 rounded-md hover:bg-accent flex justify-between items-center">
                          <span>{g.name}</span>
                          <Badge variant="secondary">{g.topic}</Badge>
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

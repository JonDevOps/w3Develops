'use client';

import { useDoc, useMemoFirebase, useCollection, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, DocumentReference, collection, query, where, Query, arrayRemove } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Cohort, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Github, Users, CalendarDays, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatTimestamp } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function MemberList({ memberIds }: { memberIds: string[] }) {
    const firestore = useFirestore();

    const membersQuery = useMemoFirebase(() => {
        if (!memberIds || memberIds.length === 0) return null;
        // Use a 'where in' query to fetch only the members of this cohort.
        // This is secure and efficient. Firestore limits 'in' queries to 30 elements.
        // If a cohort could have more, pagination would be needed.
        return query(collection(firestore, 'users'), where('id', 'in', memberIds));
    }, [firestore, memberIds]);

    const { data: members, isLoading } = useCollection<UserProfile>(membersQuery);

    if (isLoading) {
        return <p>Loading members...</p>;
    }
    
    if (!members || members.length === 0) {
        return <p className="text-muted-foreground text-sm">No members found.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {members.map(member => (
                <Link href={`/users/${member.id}`} key={member.id}>
                    <div className="flex flex-col items-center text-center gap-2 hover:bg-accent p-2 rounded-lg">
                        <Avatar>
                            <AvatarImage src={member.profilePictureUrl} />
                            <AvatarFallback>{member.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium truncate w-full">{member.displayName}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}


export default function CohortDashboardPage({ params }: { params: { cohortId: string } }) {
  const { cohortId } = params;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const cohortDocRef = useMemoFirebase(() => {
    if (!cohortId) return null;
    return doc(firestore, 'cohorts', cohortId) as DocumentReference<Cohort>;
  }, [cohortId, firestore]);

  const { data: cohort, isLoading: isCohortLoading } = useDoc<Cohort>(cohortDocRef);

  const isMember = cohort?.memberIds.includes(user?.uid || '');

  const handleLeave = async () => {
    if (!user || !cohort || !cohortDocRef) return;
    
    if (!confirm('Are you sure you want to leave this cohort?')) return;

    setIsLeaving(true);
    try {
        updateDocumentNonBlocking(cohortDocRef, {
            memberIds: arrayRemove(user.uid)
        });
        toast({ title: 'Success', description: 'You have left the cohort.' });
        router.push('/account');
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || "Could not leave cohort." });
    }
    setIsLeaving(false);
  }

  if (isCohortLoading) {
    return <div className="text-center py-10">Loading cohort dashboard...</div>;
  }

  if (!cohort) {
    return <div className="text-center py-10">Cohort not found.</div>;
  }

  return (
    <div className="space-y-8">
        <Link href="/cohorts" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Cohorts
        </Link>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl">{cohort.name}</CardTitle>
                <CardDescription className="mt-2">{cohort.description}</CardDescription>
            </div>
            {isMember && (
                <Button variant="outline" size="sm" onClick={handleLeave} disabled={isLeaving}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLeaving ? 'Leaving...' : 'Leave Cohort'}
                </Button>
            )}
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex flex-wrap gap-4 items-center">
             <Badge variant="secondary" className="text-base">{cohort.topic}</Badge>
             <Badge variant="outline" className="text-base">{cohort.commitment}</Badge>
              {cohort.githubUrl && (
                <a href={cohort.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Github className="w-5 h-5" /> GitHub Repository
                </a>
             )}
           </div>
           <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4 mr-2" />
                Created on {formatTimestamp(cohort.createdAt)}
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members ({cohort.memberIds.length} / 25)
            </CardTitle>
        </CardHeader>
        <CardContent>
            <MemberList memberIds={cohort.memberIds} />
        </CardContent>
      </Card>

    </div>
  );
}

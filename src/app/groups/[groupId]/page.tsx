'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemo, useState, useEffect } from 'react';
import { doc, DocumentReference, collection, query, where, Query, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { StudyGroup, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/utils';
import { ONE_WEEK_IN_MS } from '@/lib/constants';

function MemberList({ memberIds }: { memberIds: string[] }) {
    const firestore = useFirestore();
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!memberIds || memberIds.length === 0) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // Firestore 'in' queries are limited to 30 elements.
                const membersQuery = query(collection(firestore, 'users'), where('id', 'in', memberIds.slice(0, 30)));
                const snapshot = await getDocs(membersQuery);
                const memberData = snapshot.docs.map(doc => doc.data() as UserProfile);
                setMembers(memberData);
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, JSON.stringify(memberIds)]);

    if (isLoading) {
        return <p>Loading members...</p>;
    }

    if (!members || members.length === 0) {
        return <p className="text-muted-foreground text-sm">This group doesn't have any members yet.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {members.map(member => (
                <Link href={`/users/${member.id}`} key={member.id}>
                    <div className="flex flex-col items-center text-center gap-2 hover:bg-accent p-2 rounded-lg">
                        <Avatar>
                            <AvatarImage src={member.profilePictureUrl} />
                            <AvatarFallback>{member.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium truncate w-full">{member.username}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}


export default function GroupDashboardPage({ params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const firestore = useFirestore();

  const groupDocRef = useMemo(() => {
    if (!groupId) return null;
    return doc(firestore, 'studyGroups', groupId) as DocumentReference<StudyGroup>;
  }, [groupId, firestore]);

  const { data: group, isLoading: isGroupLoading, error: groupError } = useDoc<StudyGroup>(groupDocRef);


  if (isGroupLoading) {
    return <div className="text-center py-10">Loading group dashboard...</div>;
  }
  
  if (groupError) {
      return <div className="text-center py-10 text-destructive">Error: {groupError.message}</div>
  }

  if (!group) {
    return <div className="text-center py-10">Group not found.</div>;
  }

  const isNew = group.createdAt && (Date.now() - group.createdAt.toMillis()) < ONE_WEEK_IN_MS;

  return (
    <div className="space-y-8">
        <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Groups
        </Link>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className='space-y-2'>
                <div className="flex flex-wrap items-center gap-4">
                    <CardTitle className="font-headline text-3xl">{group.name}</CardTitle>
                     {isNew ? (
                        <Badge>New</Badge>
                    ) : (
                        <Badge variant="secondary">In Progress</Badge>
                    )}
                </div>
                <CardDescription>{group.description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex flex-wrap gap-4 items-center">
             <Badge variant="secondary" className="text-base">{group.topic}</Badge>
             <Badge variant="outline" className="text-base">{group.commitment}</Badge>
           </div>
           <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4 mr-2" />
                Created on {formatTimestamp(group.createdAt)}
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members ({group.memberIds.length})
            </CardTitle>
        </CardHeader>
        <CardContent>
            <MemberList memberIds={group.memberIds} />
        </CardContent>
      </Card>

    </div>
  );
}

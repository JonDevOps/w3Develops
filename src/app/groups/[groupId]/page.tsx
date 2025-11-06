'use client';

import { useDoc, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { doc, DocumentReference, collection, query, where, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { StudyGroup, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatTimestamp } from '@/lib/utils';
import { leaveGroup } from '@/app/actions/membership';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function MemberList({ memberIds }: { memberIds: string[] }) {
    const firestore = useFirestore();

    const membersQuery = useMemoFirebase(() => {
        if (!memberIds || memberIds.length === 0) return null;
        // Firestore 'in' queries are limited to 30 elements. Our max group size is smaller.
        return query(collection(firestore, 'users'), where('id', 'in', memberIds)) as Query;
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


export default function GroupDashboardPage({ params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const groupDocRef = useMemoFirebase(() => {
    if (!groupId) return null;
    return doc(firestore, 'studyGroups', groupId) as DocumentReference<StudyGroup>;
  }, [groupId, firestore]);

  const { data: group, isLoading: isGroupLoading } = useDoc<StudyGroup>(groupDocRef);

  const isMember = group?.memberIds.includes(user?.uid || '');

  const handleLeave = async () => {
    if (!user || !group) return;

    if (!confirm('Are you sure you want to leave this group?')) return;
    
    setIsLeaving(true);
    const result = await leaveGroup(group.id, user.uid);
    if (result.success) {
        toast({ title: 'Success', description: 'You have left the group.' });
        router.push('/account');
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsLeaving(false);
  }

  if (isGroupLoading) {
    return <div className="text-center py-10">Loading group dashboard...</div>;
  }

  if (!group) {
    return <div className="text-center py-10">Group not found.</div>;
  }

  return (
    <div className="space-y-8">
        <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Groups
        </Link>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl">{group.name}</CardTitle>
                <CardDescription className="mt-2">{group.description}</CardDescription>
            </div>
             {isMember && (
                <Button variant="outline" size="sm" onClick={handleLeave} disabled={isLeaving}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLeaving ? 'Leaving...' : 'Leave Group'}
                </Button>
            )}
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
                Members ({group.memberIds.length} / 25)
            </CardTitle>
        </CardHeader>
        <CardContent>
            <MemberList memberIds={group.memberIds} />
        </CardContent>
      </Card>

    </div>
  );
}

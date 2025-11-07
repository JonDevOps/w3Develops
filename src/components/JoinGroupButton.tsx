'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { arrayUnion, doc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { StudyGroup } from '@/lib/types';
import { useRouter } from 'next/navigation';

async function updateDocumentNonBlocking(ref: any, data: any) {
  const batch = writeBatch(ref.firestore);
  batch.update(ref, data);
  await batch.commit();
}

async function createNotificationsForMembers(firestore: any, memberIds: string[], message: string, link: string) {
    const batch = writeBatch(firestore);
    memberIds.forEach(memberId => {
        const notificationRef = doc(collection(firestore, 'users', memberId, 'notifications'));
        batch.set(notificationRef, {
            message,
            link,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    });
    await batch.commit();
}

export default function JoinGroupButton({ group }: { group: StudyGroup }) {
    const { user } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const [isJoining, setIsJoining] = useState(false);
    
    if (!user) return null;

    const isMember = group.memberIds.includes(user.uid);
    const isFull = group.memberIds.length >= 25;

    if (isMember) {
        return (
            <Button variant="outline" asChild size="sm">
                <Link href={`/groups/${group.id}`}>View Group</Link>
            </Button>
        );
    }
    
    if (isFull) {
         return <Button size="sm" disabled>Group Full</Button>;
    }
    
    const handleJoin = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to join a group.' });
            return;
        }

        if(isMember) {
            toast({ variant: 'destructive', title: 'Already a Member', description: 'You are already a member of this group.' });
            return;
        }

        setIsJoining(true);

        try {
            const groupRef = doc(firestore, 'studyGroups', group.id);
            await updateDocumentNonBlocking(groupRef, { memberIds: arrayUnion(user.uid) });

            toast({ title: 'Success!', description: `You've joined the group: ${group.name}` });

             // If the group is now full, create notifications
            if (group.memberIds.length + 1 === 25) {
                const message = `Your study group "${group.name}" is now full!`;
                const link = `/groups/${group.id}`;
                // Include the new member in the notification list
                const allMemberIds = [...group.memberIds, user.uid];
                await createNotificationsForMembers(firestore, allMemberIds, message, link);
                toast({ title: 'Group Full!', description: `Notifications sent to all members.`});
            }

            router.push(`/groups/${group.id}`);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Could Not Join', description: error.message || "An unexpected error occurred." });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Button onClick={handleJoin} disabled={isJoining} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            {isJoining ? 'Joining...' : 'Join Group'}
        </Button>
    );
}

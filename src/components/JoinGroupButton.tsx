'use client';

import { useState } from 'react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { arrayUnion, doc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { StudyGroup } from '@/lib/types';
import { useRouter } from 'next/navigation';

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
            // Use a non-blocking update which plays well with the real-time listener
            updateDocumentNonBlocking(groupRef, { memberIds: arrayUnion(user.uid) });

            toast({ title: 'Success!', description: `You've joined the group: ${group.name}` });
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

'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { arrayUnion, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Cohort } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function JoinCohortButton({ cohort, onJoinSuccess }: { cohort: Cohort, onJoinSuccess?: (id: string) => void }) {
    const { user } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const [isJoining, setIsJoining] = useState(false);
    
    if (!user) return null;

    const isMember = cohort.memberIds.includes(user.uid);
    const isFull = cohort.memberIds.length >= 25;

    if (isMember) {
        return (
            <Button variant="outline" asChild size="sm">
                <Link href={`/cohorts/${cohort.id}`}>View Cohort</Link>
            </Button>
        );
    }

    if (isFull) {
        return <Button size="sm" disabled>Cohort Full</Button>;
    }
    
    const handleJoin = async () => {
        if(isMember) {
            toast({ variant: 'destructive', title: 'Already a Member', description: 'You are already a member of this cohort.' });
            return;
        }
        setIsJoining(true);
        
        try {
            const cohortRef = doc(firestore, 'cohorts', cohort.id);
            const userProfileRef = doc(firestore, 'users', user.uid);
            const batch = writeBatch(firestore);

            batch.update(cohortRef, { memberIds: arrayUnion(user.uid) });
            batch.update(userProfileRef, { joinedCohortIds: arrayUnion(cohort.id) });


            if (cohort.memberIds.length + 1 === 25) {
                const message = `Your build cohort "${cohort.name}" is now full!`;
                const link = `/cohorts/${cohort.id}`;
                const allMemberIds = [...cohort.memberIds, user.uid];
                
                allMemberIds.forEach(memberId => {
                    const notificationRef = doc(collection(firestore, 'users', memberId, 'notifications'));
                    batch.set(notificationRef, {
                        id: notificationRef.id,
                        message,
                        link,
                        isRead: false,
                        createdAt: serverTimestamp(),
                    });
                });
                toast({ title: 'Cohort Full!', description: `Notifications sent to all members.`});
            }
            
            await batch.commit();

            toast({ title: 'Success!', description: `You've joined the cohort: ${cohort.name}`});
            
            if (onJoinSuccess) {
                onJoinSuccess(cohort.id);
            } else {
                router.push(`/cohorts/${cohort.id}`);
            }

        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Could Not Join', description: error.message || "An unexpected error occurred." });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Button onClick={handleJoin} disabled={isJoining} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            {isJoining ? 'Joining...' : 'Join Cohort'}
        </Button>
    );
}

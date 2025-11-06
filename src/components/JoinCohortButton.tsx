'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { arrayUnion, doc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Cohort } from '@/lib/types';

export default function JoinCohortButton({ cohort }: { cohort: Cohort }) {
    const { user } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
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
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to join a cohort.' });
            return;
        }
        setIsJoining(true);
        
        try {
            const cohortRef = doc(firestore, 'cohorts', cohort.id);
            await runTransaction(firestore, async (transaction) => {
                const cohortDoc = await transaction.get(cohortRef);
                if (!cohortDoc.exists()) {
                    throw new Error("Cohort does not exist!");
                }
                const currentData = cohortDoc.data();
                if (currentData.memberIds.length >= 25) {
                    throw new Error("This cohort is already full.");
                }
                if (currentData.memberIds.includes(user.uid)) {
                     throw new Error("You are already a member of this cohort.");
                }
                transaction.update(cohortRef, { memberIds: arrayUnion(user.uid) });
            });

            toast({ title: 'Success!', description: `You've joined the cohort: ${cohort.name}`});

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

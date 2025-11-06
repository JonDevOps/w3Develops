'use server';

import { 
    collection, 
    query, 
    where, 
    runTransaction, 
    doc,
    serverTimestamp,
    arrayUnion,
    getDocs,
    limit,
    Timestamp,
    Firestore
} from 'firebase/firestore';
import { getSdks } from '@/firebase';

const MAX_MEMBERS = 25;
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface MatchmakingParams {
    topic: string;
    commitment: string;
    userId: string;
}

// This function now runs on the server but uses the client-side SDK via getSdks
async function findAndJoin(collectionName: 'studyGroups' | 'cohorts', params: MatchmakingParams) {
    // We need to initialize the SDKs on the server.
    // This is safe because server actions are isolated.
    const { firestore } = getSdks();
    
    try {
        const { topic, commitment, userId } = params;

        const oneWeekAgo = Timestamp.fromMillis(Date.now() - ONE_WEEK_IN_MS);
        
        const collectionRef = collection(firestore, collectionName);

        const result = await runTransaction(firestore, async (transaction) => {
            // Query for a suitable group/cohort
            const q = query(
                collectionRef,
                where('topic', '==', topic),
                where('commitment', '==', commitment),
                where('createdAt', '>', oneWeekAgo)
            );

            const querySnapshot = await getDocs(q);
            
            let suitableGroup = null;
            for (const doc of querySnapshot.docs) {
                if (doc.data().memberIds.length < MAX_MEMBERS) {
                    suitableGroup = doc;
                    break; 
                }
            }
            
            if (suitableGroup) {
                // Join existing group
                const groupRef = doc(firestore, collectionName, suitableGroup.id);
                transaction.update(groupRef, {
                    memberIds: arrayUnion(userId)
                });
                return { action: 'joined', name: suitableGroup.data().name, id: suitableGroup.id };
            } else {
                // Create a new group
                const newGroupName = `${topic} ${collectionName === 'studyGroups' ? 'Group' : 'Cohort'} - ${Date.now()}`; 
                const newGroupData = {
                    name: newGroupName,
                    topic: topic,
                    commitment: commitment,
                    memberIds: [userId],
                    createdAt: serverTimestamp(),
                    description: `A new ${collectionName === 'studyGroups' ? 'group' : 'cohort'} for ${topic}.`
                };

                // In a transaction with the client SDK, we can't get the ref beforehand.
                // We add it and then the transaction ensures atomicity. The server action
                // context does not easily give us back the ID, so we return the name.
                const newGroupRef = doc(collection(firestore, collectionName));
                transaction.set(newGroupRef, newGroupData);


                return { action: 'created', name: newGroupName, id: newGroupRef.id };
            }
        });

        if (result.action === 'joined') {
            return { success: true, message: `Successfully joined: ${result.name}` };
        } else {
            return { success: true, message: `No suitable match found. A new one was created for you: ${result.name}` };
        }

    } catch (error: any) {
        console.error(`Error in ${collectionName} matchmaking:`, error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}


export async function findAndJoinGroup(params: MatchmakingParams) {
    return findAndJoin('studyGroups', params);
}

export async function findAndJoinCohort(params: MatchmakingParams) {
    return findAndJoin('cohorts', params);
}

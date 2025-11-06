'use server';

import { 
    FieldValue,
    Timestamp,
} from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

const MAX_MEMBERS = 25;
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface MatchmakingParams {
    topic: string;
    commitment: string;
    userId: string;
}

// This function now correctly uses the Firebase Admin SDK on the server.
async function findAndJoin(collectionName: 'studyGroups' | 'cohorts', params: MatchmakingParams) {
    // Initialize the Admin SDK on the server.
    initializeAdminApp();
    const firestore = getFirestore();
    
    try {
        const { topic, commitment, userId } = params;

        const oneWeekAgo = Timestamp.fromMillis(Date.now() - ONE_WEEK_IN_MS);
        
        const collectionRef = firestore.collection(collectionName);

        const result = await firestore.runTransaction(async (transaction) => {
            // Query for a suitable group/cohort
            const q = collectionRef
                .where('topic', '==', topic)
                .where('commitment', '==', commitment)
                .where('createdAt', '>', oneWeekAgo);

            const querySnapshot = await transaction.get(q);
            
            let suitableGroup = null;
            for (const doc of querySnapshot.docs) {
                if (doc.data().memberIds.length < MAX_MEMBERS) {
                    suitableGroup = doc;
                    break; 
                }
            }
            
            if (suitableGroup) {
                // Join existing group
                transaction.update(suitableGroup.ref, {
                    memberIds: FieldValue.arrayUnion(userId)
                });
                return { action: 'joined', name: suitableGroup.data().name, id: suitableGroup.id };
            } else {
                // Create a new group
                const newGroupName = `${topic} ${collectionName === 'studyGroups' ? 'Group' : 'Cohort'} - ${Date.now()}`; 
                const newGroupRef = collectionRef.doc(); // Create a new doc reference
                const newGroupData = {
                    name: newGroupName,
                    topic: topic,
                    commitment: commitment,
                    memberIds: [userId],
                    createdAt: FieldValue.serverTimestamp(),
                    description: `A new ${collectionName === 'studyGroups' ? 'group' : 'cohort'} for ${topic}.`
                };
                
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

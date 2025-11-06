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
            // Query for a suitable group/cohort.
            // The check for whether a user is already in the group is now handled in the loop below,
            // as 'not-in' queries are limited to 10 comparison values, which is not scalable.
            const q = collectionRef
                .where('topic', '==', topic)
                .where('commitment', '==', commitment)
                .where('createdAt', '>', oneWeekAgo);

            const querySnapshot = await transaction.get(q);
            
            let suitableGroup = null;
            // Find the first suitable group with space that the user is not already a member of.
            for (const doc of querySnapshot.docs) {
                const groupData = doc.data();
                const isMember = groupData.memberIds.includes(userId);
                if (!isMember && groupData.memberIds.length < MAX_MEMBERS) {
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
                const name_lowercase = newGroupName.toLowerCase();
                const newGroupRef = collectionRef.doc(); // Create a new doc reference
                const newGroupData = {
                    name: newGroupName,
                    name_lowercase: name_lowercase,
                    topic: topic,
                    commitment: commitment,
                    memberIds: [userId],
                    createdAt: FieldValue.serverTimestamp(), // Use serverTimestamp for consistency
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

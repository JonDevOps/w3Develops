'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { adminFirestore } from '@/firebase/admin';

const MAX_MEMBERS = 25;
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface MatchmakingParams {
    topic: string;
    commitment: string;
    userId: string;
}

// This function now correctly uses the centralized Firebase Admin instance.
async function findAndJoin(collectionName: 'studyGroups' | 'cohorts', params: MatchmakingParams) {
    const firestore = adminFirestore;
    
    try {
        const { topic, commitment, userId } = params;

        // First, check if the user is already in a group/cohort with the same topic and commitment.
        // This is a business rule to prevent joining duplicates.
        const collectionsToCheck = ['studyGroups', 'cohorts'];
        for (const coll of collectionsToCheck) {
            const existingMembershipQuery = firestore.collection(coll)
                .where('memberIds', 'array-contains', userId)
                .where('topic', '==', topic)
                .where('commitment', '==', commitment);
            
            const existingMembershipSnapshot = await existingMembershipQuery.get();
            if (!existingMembershipSnapshot.empty) {
                 const docData = existingMembershipSnapshot.docs[0].data();
                 const name = docData.name || 'a group/cohort';
                 const type = coll === 'studyGroups' ? 'study group' : 'build cohort';
                return { success: false, message: `You are already in a ${type} (${name}) with this topic and commitment.` };
            }
        }

        const oneWeekAgo = new Date(Date.now() - ONE_WEEK_IN_MS);
        
        const collectionRef = firestore.collection(collectionName);

        const result = await firestore.runTransaction(async (transaction) => {
            // Query for a suitable group/cohort that is less than a week old and not full.
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

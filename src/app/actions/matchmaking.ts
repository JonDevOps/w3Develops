'use server';

import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    limit, 
    Timestamp, 
    runTransaction, 
    doc,
    serverTimestamp,
    arrayUnion,
    addDoc,
} from 'firebase-admin/firestore';
import { auth } from 'firebase-admin';
import { initializeAdminApp } from '@/firebase/admin';

const MAX_MEMBERS = 25;
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface MatchmakingParams {
    topic: string;
    commitment: string;
}

// Ensure the admin app is initialized
initializeAdminApp();
const db = getFirestore();

async function findAndJoin(collectionName: 'studyGroups' | 'cohorts', params: MatchmakingParams) {
    try {
        const currentUser = await auth().getUser(auth().currentUser.uid);
        if (!currentUser) {
            return { success: false, message: 'Authentication required.' };
        }
        const userId = currentUser.uid;
        
        const oneWeekAgo = Timestamp.fromMillis(Date.now() - ONE_WEEK_IN_MS);
        
        const collectionRef = collection(db, collectionName);

        const result = await runTransaction(db, async (transaction) => {
            // Query for a suitable group/cohort
            const q = query(
                collectionRef,
                where('topic', '==', params.topic),
                where('commitment', '==', params.commitment),
                where('createdAt', '>', oneWeekAgo)
            );

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
                const groupRef = doc(db, collectionName, suitableGroup.id);
                transaction.update(groupRef, {
                    memberIds: arrayUnion(userId)
                });
                return { action: 'joined', name: suitableGroup.data().name };
            } else {
                // Create a new group
                const newGroupName = `${params.topic} Group - ${Date.now()}`; 
                const newGroupRef = doc(collectionRef); // Let Firestore generate the ID
                
                transaction.set(newGroupRef, {
                    name: newGroupName,
                    topic: params.topic,
                    commitment: params.commitment,
                    memberIds: [userId],
                    createdAt: serverTimestamp(),
                    description: `A new ${collectionName === 'studyGroups' ? 'group' : 'cohort'} for ${params.topic}.`
                });

                return { action: 'created', name: newGroupName };
            }
        });

        if (result.action === 'joined') {
            return { success: true, message: `Successfully joined the group: ${result.name}` };
        } else {
            return { success: true, message: `No suitable group found. A new one was created for you: ${result.name}` };
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

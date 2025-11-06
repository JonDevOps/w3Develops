'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { adminFirestore } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

async function leave(collectionName: 'studyGroups' | 'cohorts', id: string, userId: string) {
    const firestore = adminFirestore;

    try {
        const docRef = firestore.collection(collectionName).doc(id);

        await docRef.update({
            memberIds: FieldValue.arrayRemove(userId)
        });

        // Revalidate the pages that show this information to reflect the change
        revalidatePath(`/${collectionName.slice(0, -1)}s/${id}`); // e.g. /groups/:id
        revalidatePath('/account');

        return { success: true, message: `Successfully left the ${collectionName === 'studyGroups' ? 'group' : 'cohort'}.` };
    } catch (error: any) {
        console.error(`Error leaving ${collectionName}:`, error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function leaveGroup(groupId: string, userId: string) {
    return leave('studyGroups', groupId, userId);
}

export async function leaveCohort(cohortId: string, userId: string) {
    return leave('cohorts', cohortId, userId);
}

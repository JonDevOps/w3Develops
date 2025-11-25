'use server';

import { adminFirestore } from '@/firebase/admin';

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
    
    const isEmail = (email: string): boolean => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    if (!email || !isEmail(email)) {
        return { success: false, error: 'A valid email is required.' };
    }

    try {
        const subscribersCollection = adminFirestore.collection('newsletter-subscribers');
        
        // Check if the email already exists
        const snapshot = await subscribersCollection.where('email', '==', email).limit(1).get();
        if (!snapshot.empty) {
            return { success: false, error: 'This email is already subscribed.' };
        }

        // If not, add the new subscriber
        await subscribersCollection.add({
            email: email,
            subscribedAt: new Date(), // Using server-side date
        });

        return { success: true };
    } catch (error) {
        console.error('Error in subscribeToNewsletter:', error);
        // In a real app, you'd want to log this error to a monitoring service
        return { success: false, error: 'An internal server error occurred.' };
    }
}

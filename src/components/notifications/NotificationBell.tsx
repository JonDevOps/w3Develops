'use client';

import { useNotifications } from '@/firebase/firestore/use-notifications';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationBell() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const unreadCount = useNotifications();

    const handleBellClick = async () => {
        if (!user || !firestore) return;

        if (unreadCount > 0) {
            // Mark all as read
            try {
                const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
                const q = query(notificationsRef, where('isRead', '==', false));
                const querySnapshot = await getDocs(q);
                
                const batch = writeBatch(firestore);
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { isRead: true });
                });
                await batch.commit();

            } catch (error) {
                console.error("Error marking notifications as read: ", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not update notifications. Please try again."
                });
            }
        }
        // Navigate to notifications page regardless
        router.push('/notifications');
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleBellClick} className="relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
                <div className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center text-xs text-destructive-foreground">
                    {unreadCount}
                </div>
            )}
            <span className="sr-only">View notifications</span>
        </Button>
    );
}

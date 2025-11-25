
'use client';

import { useCollection, useUser, useFirestore } from '@/firebase';
import { useMemo, useEffect } from 'react';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Notification } from '@/lib/types';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/utils';
import { BellRing, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';

function NotificationItem({ notification }: { notification: Notification }) {
    return (
        <Link href={notification.link || '#'} className="block p-4 border-b last:border-b-0 hover:bg-accent">
            <div className="flex items-start gap-4">
                <div className={`mt-1 h-2 w-2 rounded-full ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`}></div>
                <div className="flex-1">
                    <p className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.message}</p>
                    <p className="text-sm text-muted-foreground">{formatTimestamp(notification.createdAt, true)}</p>
                </div>
                 {notification.isRead ? <Check className="w-5 h-5 text-muted-foreground" /> : <BellRing className="w-5 h-5 text-primary" />}
            </div>
        </Link>
    )
}

export default function NotificationsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?redirect=/notifications');
        }
    }, [user, isUserLoading, router]);

    const notificationsQuery = useMemo(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc')
        ) as Query<Notification>;
    }, [user, firestore]);

    const { data: notifications, isLoading: isNotificationsLoading } = useCollection<Notification>(notificationsQuery);

    if (isUserLoading || isNotificationsLoading || !user) {
        return (
            <div className="p-4 md:p-10">
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Your recent updates and alerts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {notifications && notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map(notif => (
                                <NotificationItem key={notif.id} notification={notif} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <BellRing className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="font-semibold">No notifications yet</h3>
                            <p>We'll let you know when something important happens.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

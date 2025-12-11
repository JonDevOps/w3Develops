'use client';

import { useTransition, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, DocumentReference } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';
import { CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NewsletterPage() {
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const userDocRef = useMemo(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const isSubscribed = userProfile?.isSubscribedToNewsletter || false;

    const handleToggleSubscription = async () => {
        if (!user || !userDocRef) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'You must be logged in to manage your subscription.',
            });
            return;
        }

        const newSubscriptionState = !isSubscribed;

        startTransition(async () => {
            try {
                await updateDoc(userDocRef, {
                    isSubscribedToNewsletter: newSubscriptionState
                });

                toast({
                    title: 'Success!',
                    description: newSubscriptionState
                        ? "You have successfully subscribed to the newsletter."
                        : "You have unsubscribed from the newsletter.",
                });

            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: error.message || 'An unknown error occurred. Please check your connection and security rules.',
                });
            }
        });
    };
    
    if (isUserLoading || (user && isProfileLoading)) {
      return (
        <div className="p-4 md:p-10">
          <LoadingSkeleton />
        </div>
      );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">w3Develops Newsletter</CardTitle>
                    <CardDescription>
                        Get the latest news, articles, and resources from the w3Develops community, sent straight to your inbox.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {user && userProfile ? (
                        <div className="space-y-4">
                            {isSubscribed ? (
                                <div className="flex flex-col items-center gap-4 p-6 bg-accent/20 rounded-lg">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                    <p className="font-semibold text-lg">You are subscribed!</p>
                                    <p className="text-muted-foreground text-sm">Your email: {userProfile.email}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 p-6 bg-secondary rounded-lg">
                                     <Mail className="h-12 w-12 text-primary" />
                                     <p className="font-semibold text-lg">You are not subscribed.</p>
                                      <p className="text-muted-foreground text-sm">Click the button below to join.</p>
                                </div>
                            )}
                            <Button onClick={handleToggleSubscription} disabled={isPending} className="w-full sm:w-auto">
                                {isPending ? 'Updating...' : isSubscribed ? 'Unsubscribe' : 'Subscribe Now'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <p className="text-muted-foreground">
                                Please <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="underline font-semibold hover:text-primary">sign in</Link> to manage your newsletter subscription.
                            </p>
                             <Button asChild>
                                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>Login</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

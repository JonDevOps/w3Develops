'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function NewsletterPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [email, setEmail] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'You must be logged in to subscribe to the newsletter.',
            });
            return;
        }

        if (!email) {
            toast({
                variant: 'destructive',
                title: 'Email Required',
                description: 'Please enter your email address.',
            });
            return;
        }

        startTransition(async () => {
            const subscriberDocRef = doc(firestore, 'newsletter-subscribers', user.uid);
            
            try {
                // Check if the document already exists, which means user is subscribed
                const docSnap = await getDoc(subscriberDocRef);
                if (docSnap.exists()) {
                    toast({
                        variant: 'destructive',
                        title: 'Already Subscribed',
                        description: 'This account is already subscribed to the newsletter.',
                    });
                    return;
                }

                // If not subscribed, create the document
                await setDoc(subscriberDocRef, {
                    email: email,
                    subscribedAt: serverTimestamp(),
                    userId: user.uid,
                });

                toast({
                    title: 'Subscription Successful!',
                    description: "Thanks for subscribing! You're on the list.",
                });
                setEmail('');

            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Subscription Failed',
                    description: error.message || 'An unknown error occurred. Please check your connection and security rules.',
                });
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Subscribe to our Newsletter</CardTitle>
                    <CardDescription>
                        Get the latest news, articles, and resources from the w3Develops community, sent straight to your inbox.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                        <div className="w-full">
                           <Label htmlFor="email" className="sr-only">Email</Label>
                           <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isPending || !user}
                                required
                                className="w-full"
                            />
                        </div>
                        <Button type="submit" disabled={isPending || !user} className="w-full sm:w-auto">
                            {isPending ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                    </form>
                    {!user && (
                        <p className="text-sm text-center text-muted-foreground mt-4">
                            Please <a href="/login" className="underline">sign in</a> to subscribe to the newsletter.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

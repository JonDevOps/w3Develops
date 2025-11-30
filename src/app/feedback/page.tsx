'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';

export default function FeedbackPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const pathname = usePathname();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
             toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'You must be signed in to submit feedback.',
            });
            return;
        }

        if (!feedback.trim()) {
            toast({
                variant: 'destructive',
                title: 'Feedback cannot be empty',
                description: 'Please write your feedback before submitting.',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                throw new Error("Could not find your user profile to submit feedback.");
            }
            const userProfile = userDocSnap.data() as UserProfile;

            const feedbackData: {
                feedback: string;
                createdAt: any;
                userId: string;
                username: string;
            } = {
                feedback,
                createdAt: serverTimestamp(),
                userId: user.uid,
                username: userProfile.username || 'Unknown User'
            };

            await addDoc(collection(firestore, 'feedback'), feedbackData);

            toast({
                title: 'Feedback Submitted!',
                description: 'Thank you for helping us improve.',
            });
            setFeedback('');

        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: error.message || 'Could not submit your feedback. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isUserLoading) {
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
                    <CardTitle className="font-headline text-3xl">Submit Feedback</CardTitle>
                    <CardDescription>
                        Have a suggestion or found a bug? Let us know! We appreciate your input.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {user ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="feedback-message">Your Feedback</Label>
                                <Textarea 
                                    placeholder="Type your message here." 
                                    id="feedback-message"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    required
                                    minLength={10}
                                    maxLength={2000}
                                    disabled={isSubmitting} 
                                />
                                <p className="text-sm text-muted-foreground">
                                    You are submitting as {user.displayName || user.email}.
                                </p>
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </form>
                    ) : (
                         <div className="text-center py-8 space-y-4">
                            <p className="text-muted-foreground">You must be logged in to submit feedback.</p>
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
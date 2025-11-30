'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/lib/types';

export default function FeedbackPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const pathname = usePathname();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openErrorWindow = (error: any) => {
        const errorDetails = `
            <html>
                <head>
                    <title>Submission Error Details</title>
                    <style>
                        body { font-family: sans-serif; background-color: #f8f9fa; color: #212529; padding: 2rem; }
                        pre { background-color: #e9ecef; padding: 1rem; border-radius: 0.5rem; white-space: pre-wrap; word-wrap: break-word; }
                        h1 { color: #dc3545; }
                    </style>
                </head>
                <body>
                    <h1>Feedback Submission Failed</h1>
                    <p>The following error occurred while trying to submit your feedback:</p>
                    <pre>${JSON.stringify({
                        code: error.code,
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    }, null, 2)}</pre>
                </body>
            </html>
        `;
        const newWindow = window.open();
        newWindow?.document.write(errorDetails);
        newWindow?.document.close();
    };


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
            // Fetch the user's profile to get their username
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                throw new Error("Could not find your user profile to get username.");
            }
            
            const userProfile = userDocSnap.data() as UserProfile;

            await addDoc(collection(firestore, 'feedback'), {
                feedback,
                createdAt: serverTimestamp(),
                userId: user.uid,
                username: userProfile.username, // Use the username from the profile
            });

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
                description: 'Could not submit your feedback. Click for details.',
                action: (
                    <ToastAction altText="View Details" onClick={() => openErrorWindow(error)}>
                        View Details
                    </ToastAction>
                ),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                    You are submitting as {user.email}.
                                </p>
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </form>
                    ) : (
                         <div className="text-center py-8 space-y-4">
                            <p className="text-muted-foreground">
                                You must be signed in to submit feedback.
                            </p>
                            <Button asChild>
                                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>Sign In</Link>
                            </Button>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

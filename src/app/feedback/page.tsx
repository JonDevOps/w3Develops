'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function FeedbackPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            const feedbackData: {
                feedback: string;
                createdAt: any;
                userId?: string;
                username?: string;
            } = {
                feedback,
                createdAt: serverTimestamp(),
            };

            if (user) {
                feedbackData.userId = user.uid;
                feedbackData.username = user.displayName || user.email || 'Unknown User';
            }

            await addDoc(collection(firestore, 'feedback'), feedbackData);

            toast({
                title: 'Feedback Submitted!',
                description: 'Thank you for helping us improve.',
            });
            setFeedback('');

        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'Could not submit your feedback. Please try again.',
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
                                {user ? `You are logged in as ${user.displayName || user.email}.` : "You are submitting feedback anonymously."}
                            </p>
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

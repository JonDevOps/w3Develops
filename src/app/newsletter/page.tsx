'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { subscribeToNewsletter } from '@/app/actions';
import { Label } from '@/components/ui/label';

export default function NewsletterPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            toast({
                variant: 'destructive',
                title: 'Email Required',
                description: 'Please enter your email address.',
            });
            return;
        }

        startTransition(async () => {
            const result = await subscribeToNewsletter(email);
            if (result.success) {
                toast({
                    title: 'Subscription Successful!',
                    description: "Thanks for subscribing! You're on the list.",
                });
                setEmail('');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Subscription Failed',
                    description: result.error || 'An unknown error occurred. Please try again.',
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
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isPending}
                            required
                        />
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookClubsPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Book Clubs</CardTitle>
                    <CardDescription>
                        A place for community book clubs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">Under Construction</h3>
                        <p className="text-muted-foreground mt-2">
                            This page is coming soon. Stay tuned!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

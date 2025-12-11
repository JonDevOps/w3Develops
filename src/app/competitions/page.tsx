
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompetitionsPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Competitions</CardTitle>
                    <CardDescription>
                        Test your skills in our community coding competitions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">Under Construction</h3>
                        <p className="text-muted-foreground mt-2">
                            The competitions page is coming soon. Stay tuned!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

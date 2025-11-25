
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function JobBoardPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Job Board</CardTitle>
                    <CardDescription>
                        Find your next opportunity in the tech industry.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">Under Construction</h3>
                        <p className="text-muted-foreground mt-2">
                           Coming soon is a job board, a tutor section and an apprenticeship section.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

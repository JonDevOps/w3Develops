'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LearnPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Learn</CardTitle>
                    <CardDescription>
                        Learn new skills and technologies with our curated resources.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">Under Construction</h3>
                        <p className="text-muted-foreground mt-2">
                            The learn page is coming soon. Stay tuned for tutorials and courses!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle>Terms of Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>This is a placeholder for the Terms of Use page.</p>
                    <p>You can add your full terms of use content here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>This is a placeholder for the Privacy Policy page.</p>
                    <p>You can add your full privacy policy content here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

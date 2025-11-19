'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Cookie Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>This is a placeholder for the Cookie Policy page.</p>
                    <p>You can add your full cookie policy content here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

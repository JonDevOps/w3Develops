'use client';

import { FeedbackForm } from "@/components/FeedbackForm";
import { useUser } from "@/firebase/provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSkeleton } from "@/components/layout/loading-skeleton";

export default function FeedbackPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?redirect=/feedback');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading) {
        return <LoadingSkeleton />;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="container py-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <FeedbackForm />
        </div>
    );
}

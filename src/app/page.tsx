'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user state is determined and a user is logged in, redirect to the account dashboard.
    if (!isUserLoading && user) {
      router.push('/account');
    }
  }, [user, isUserLoading, router]);

  // While checking auth state or if user is logged in and redirecting, show a loading state.
  if (isUserLoading || user) {
    return <LoadingSkeleton />;
  }
  
  // If user is not logged in, show the public homepage.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
        Welcome to w3Develops
      </h1>
      <p className="max-w-[700px] text-lg text-muted-foreground mb-8">
        The platform to connect with developers, form study groups, and build amazing projects together.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';

export default function ContributePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/contribute/intro');
  }, [router]);

  return <LoadingSkeleton />;
}

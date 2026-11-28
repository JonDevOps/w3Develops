import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { interactionCookie, pilotEnabled } from '@/lib/developer-api/config';
import { readInteraction } from '@/lib/developer-api/interaction';
import DeveloperAccess from './DeveloperAccess';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Developer access',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function DeveloperAccessPage() {
  if (!pilotEnabled()) notFound();
  const interaction = readInteraction((await cookies()).get(interactionCookie)?.value);
  return <DeveloperAccess nonce={interaction?.nonce ?? null} />;
}

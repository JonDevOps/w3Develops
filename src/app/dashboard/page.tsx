import { getProfile } from '@/lib/get-profile-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientPage from './dashboard-client-page';
import type { UserProfile } from '@/lib/types';


export default async function DashboardPage() {
  const cookieStore = cookies();
  const uid = cookieStore.get('firebase-uid')?.value;

  if (!uid) {
    redirect('/login');
  }

  const initialProfile = await getProfile(uid);

  return <DashboardClientPage initialProfile={initialProfile as UserProfile | null} uid={uid} />;
}

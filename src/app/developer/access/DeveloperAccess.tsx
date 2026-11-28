'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const loginPath = '/login?redirect=%2Fdeveloper%2Faccess';
type AccessStatus = { status: string; expiresAt: string | null };

export default function DeveloperAccess({ nonce }: { nonce: string | null }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [loadedAccess, setAccess] = useState<{ uid: string; value: AccessStatus } | null>(null);
  const access = loadedAccess?.uid === user?.uid ? loadedAccess?.value : null;
  const [use, setUse] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [reauthenticate, setReauthenticate] = useState(false);

  useEffect(() => {
    if (!user) return;
    const signedIn = user;
    const controller = new AbortController();
    async function load() {
      try {
        const token = await signedIn.getIdToken();
        const result = await fetch('/api/developer/access', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!result.ok) throw new Error('Developer access is unavailable for this sign-in.');
        const value = await result.json();
        if (!controller.signal.aborted) setAccess({ uid: signedIn.uid, value });
      } catch {
        if (!controller.signal.aborted) setMessage('Developer access is unavailable for this sign-in.');
      }
    }
    void load();
    return () => controller.abort();
  }, [user]);

  async function submit(action: 'request' | 'allow' | 'deny' | 'revoke') {
    if (!user) return;
    setBusy(true);
    setMessage('');
    setReauthenticate(false);
    try {
      const token = await user.getIdToken(true);
      const result = await fetch('/api/developer/access', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, use, nonce }),
      });
      const body = await result.json();
      if (!result.ok) {
        setReauthenticate(result.status === 401);
        setMessage(typeof body.error === 'string' ? body.error : 'The request could not be completed.');
        return;
      }
      if (body.redirect) {
        window.location.assign(body.redirect);
        return;
      }
      setAccess({ uid: user.uid, value: body });
      setMessage(action === 'request' ? 'Your request is pending review.' : 'Your developer access was revoked.');
    } catch {
      setMessage('The request could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Developer access" className="mx-auto w-full max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{nonce ? 'Authorize the w3Develops CLI' : 'Developer access'}</CardTitle>
          <CardDescription>Developer access lets the CLI read approved public learning resources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isUserLoading ? <p role="status">Checking your sign-in…</p> : !user ? (
            <Button asChild><Link href={loginPath}>Sign in to continue</Link></Button>
          ) : (
            <>
              {nonce && access?.status === 'approved' ? (
                <>
                  <p>Allow the CLI to read the directory using a token that expires after 10 minutes?</p>
                  {access.expiresAt && <p>Your pilot approval expires {new Date(access.expiresAt).toLocaleDateString()}.</p>}
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={busy} onClick={() => void submit('allow')}>Allow access</Button>
                    <Button variant="outline" disabled={busy} onClick={() => void submit('deny')}>Decline</Button>
                  </div>
                </>
              ) : access?.status === 'approved' ? (
                <>
                  <p>Your developer access is approved.</p>
                  <Button variant="outline" disabled={busy} onClick={() => void submit('revoke')}>Revoke access</Button>
                </>
              ) : access?.status === 'pending' ? (
                <p>Your access request is pending review.</p>
              ) : access && (
                <form className="space-y-3" onSubmit={event => { event.preventDefault(); void submit('request'); }}>
                  <Label htmlFor="use">What will you use developer access for?</Label>
                  <Textarea id="use" value={use} onChange={event => setUse(event.target.value)} minLength={10} maxLength={500} required />
                  <Button disabled={busy} type="submit">Request access</Button>
                </form>
              )}
              {message && <p role="status">{message}</p>}
              {reauthenticate && (
                <Button variant="outline" onClick={() => void signOut(auth).then(() => router.replace(loginPath)).catch(() => setMessage('Could not sign out. Try again.'))}>
                  Sign in again
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

import type { User } from 'firebase/auth';

/**
 * Asks the server to tell search engines about a new or changed public page
 * (see src/app/api/indexnow/route.ts). Runs in the background; failures
 * don't matter, since the sitemap lists the page anyway.
 */
export function notifySearchEngines(path: string, user: User): void {
  void user.getIdToken().then(token => fetch('/api/indexnow', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
    keepalive: true,
  })).catch(() => {});
}

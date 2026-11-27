import { publicResources } from '@/lib/public-resource-directory';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({ resources: publicResources }, {
    headers: { 'X-Robots-Tag': 'noindex' },
  });
}

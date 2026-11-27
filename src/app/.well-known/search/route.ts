import { SITE_URL } from '@/lib/site-pages';
import { SEARCH_QUERY_MAX, PUBLIC_SEARCH_INSTRUCTIONS, searchPublicDocs } from '@/lib/public-search';

export const dynamic = 'force-dynamic';

function markdown(s: string, status = 200) {
  return new Response(s + '\n', {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
      'Content-Signal': 'search=yes, ai-input=no, ai-train=no',
      'Cache-Control': status === 200 ? 'public, max-age=300, s-maxage=3600' : 'no-store',
    },
  });
}

export function GET(request: Request) {
  if (request.url.length > 2048) return markdown('# Search URL is too long', 414);
  const values = new URL(request.url).searchParams.getAll('q');
  const query = values[0]?.trim();
  if (values.length !== 1 || !query || query.length > SEARCH_QUERY_MAX) {
    return markdown('# Public learning search\n\nSupply one q parameter of 1 to ' + SEARCH_QUERY_MAX + ' characters.\n\n' + PUBLIC_SEARCH_INSTRUCTIONS, 400);
  }
  const results = searchPublicDocs(query);
  return markdown([
    '# w3Develops public search',
    '',
    results.length ? 'Public links and short descriptions. Results do not certify group or event availability.' : 'No matching public pages were found. Try fewer or different keywords.',
    '',
    ...results.map(({ path, title, description }) => '- [' + title + '](' + SITE_URL + path + '): ' + description),
  ].join('\n'));
}

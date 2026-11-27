import { HOME_DESCRIPTION, SITE_PAGES, SITE_URL } from '@/lib/site-pages';
import { PUBLIC_SEARCH_INSTRUCTIONS, PUBLIC_SEARCH_URL } from '@/lib/public-search';

const HOME_FEATURES = ['/studygroups', '/groupprojects', '/competitions', '/hackathons'] as const;

export const dynamic = 'force-static';

export function GET() {
  const content = [
    '---',
    'agent:',
    '  endpoint: ' + JSON.stringify(PUBLIC_SEARCH_URL + '?q={query}'),
    '  method: GET',
    '  instructions: ' + JSON.stringify(PUBLIC_SEARCH_INSTRUCTIONS),
    '---',
    '',
    '# w3Develops',
    '',
    HOME_DESCRIPTION,
    '',
    `[Join for free](${SITE_URL}/signup) · [Explore](${SITE_URL}/explore)`,
    '',
    '## What we offer',
    '',
    ...HOME_FEATURES.map(path => {
      const { title, description } = SITE_PAGES[path];
      return `- [${title}](${SITE_URL}${path}): ${description}`;
    }),
    '',
    `[Find a mentor](${SITE_URL}/mentorship) · [Read the community guides](${SITE_URL}/docs)`,
    '',
  ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      Link: `<${SITE_URL}/>; rel="canonical"`,
    },
  });
}

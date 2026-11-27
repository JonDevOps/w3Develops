import { HOME_DESCRIPTION, SITE_PAGES, SITE_URL } from '@/lib/site-pages';

const HOME_FEATURES = ['/studygroups', '/groupprojects', '/competitions', '/hackathons'] as const;

export const dynamic = 'force-static';

export function GET() {
  const content = [
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
    `[How to find and join a study group](${SITE_URL}/docs/guides/study-groups)`,
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

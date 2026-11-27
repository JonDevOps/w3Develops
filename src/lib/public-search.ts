import { SITE_PAGES, SITE_URL } from './site-pages';

export const PUBLIC_SEARCH_PATH = '/.well-known/search';
export const PUBLIC_SEARCH_URL = SITE_URL + PUBLIC_SEARCH_PATH;
export const SEARCH_QUERY_MAX = 160;
export const SEARCH_RESULT_MAX = 8;
export const PUBLIC_SEARCH_INSTRUCTIONS =
  'Search public w3Develops learning resources and documentation with GET and the q parameter. Results are Markdown links and short descriptions, not live membership or event availability.';

const pages = [
  '/studygroups', '/groupprojects', '/book-clubs', '/learn', '/docs', '/faq', '/mentorship',
  '/pair-programming', '/events', '/meetups', '/competitions', '/hackathons', '/contribute',
] as const;
const documents: SearchResult[] = [
  { path: '/', title: 'About w3Develops', description: 'A free developer community to learn, build, and team up.', labels: 'about homepage community free coding' },
  { path: '/docs/quickstart', title: 'Quickstart', description: 'Create a free account and learn where to begin.', labels: 'beginner signup start first step' },
  { path: '/docs/guides/study-groups', title: 'Study groups and book clubs', description: 'Find groups and understand how participation works. A listing does not establish current availability.', labels: 'javascript python html css beginner join study group' },
  { path: '/docs/guides/running-a-study-group', title: 'Running a study group', description: 'Plan a curriculum and run check-ins, meetings, and shared tasks.', labels: 'host learning facilitator' },
  { path: '/docs/guides/curriculum-templates', title: 'Curriculum templates', description: 'Get a starting structure for a study group or project.', labels: 'javascript beginner learning curriculum' },
  { path: '/docs/guides/group-projects', title: 'Group and solo projects', description: 'Discover practical ways to build projects with other developers.', labels: 'portfolio team project' },
  { path: '/docs/guides/connections', title: 'Mentorship, tutoring and pairing', description: 'Find help and collaborate by matching with other members.', labels: 'mentor tutor pair programming' },
  { path: '/docs/guides/safety', title: 'Safety and reporting', description: 'Learn how to report problems and protect your account in the community.', labels: 'privacy report help' },
];
type SearchResult = { path: string; title: string; description: string; labels?: string };

const items: SearchResult[] = [
  ...pages.map(path => ({ path, title: SITE_PAGES[path].title, description: SITE_PAGES[path].description })),
  ...documents,
];
function words(text: string): string[] {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().match(/[a-z0-9]+/g) || [];
}

const stop = new Set(['a','an','and','are','can','do','for','i','in','is','it','me','my','of','on','or','the','to','what','where','with','you']);
const index = items.map(item => ({
  item,
  headline: new Set(words(item.title)),
  text: new Set(words(item.title + ' ' + item.description + ' ' + (item.labels || ''))),
}));

export function searchPublicDocs(query: string) {
  const terms = [...new Set(words(query).filter(w => !stop.has(w)))].slice(0, 12);
  if (!terms.length) return [];
  const threshold = Math.ceil(terms.length / 2);
  return index
    .map(({ item, headline, text }, i) => ({
      item, i,
      hits: terms.filter(term => text.has(term)).length,
      rank: terms.reduce((score, term) => score + (headline.has(term) ? 4 : text.has(term) ? 1 : 0), 0),
    }))
    .filter(r => r.hits >= threshold)
    .sort((a, b) => b.hits - a.hits || b.rank - a.rank || a.i - b.i)
    .slice(0, SEARCH_RESULT_MAX)
    .map(r => r.item);
}

import { SITE_PAGES, SITE_URL } from '@/lib/site-pages';

export const RESOURCE_DIRECTORY_PATH = '/api/v1/resources';

// Only editorial navigation links are published here. Do not build this
// directory from account data or from the dynamic sitemap.
const PUBLIC_RESOURCE_PATHS = [
  '/learn',
  '/studygroups',
  '/groupprojects',
  '/project-ideas',
  '/book-clubs',
  '/algorithms-daily',
  '/mentorship',
  '/pair-programming',
  '/docs',
] as const;

export const publicResources = PUBLIC_RESOURCE_PATHS.map(path => {
  const { title, description } = SITE_PAGES[path];
  return { title, description, url: `${SITE_URL}${path}` };
});

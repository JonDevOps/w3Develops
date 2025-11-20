import { MetadataRoute } from 'next';

const URL = 'https://w3develops.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/account',
    '/book-clubs',
    '/chat',
    '/cohorts',
    '/cohorts/create',
    '/competitions',
    '/cookies',
    '/donate',
    '/groups',
    '/groups/create',
    '/hackathons',
    '/job-board',
    '/login',
    '/mentorship',
    '/merch',
    '/meetups',
    '/news',
    '/notifications',
    '/pair-programming',
    '/podcast',
    '/privacy',
    '/profile/edit',
    '/search',
    '/security',
    '/settings',
    '/signup',
    '/solo-projects',
    '/terms',
    '/tutor',
  ];

  return staticRoutes.map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
  }));
}

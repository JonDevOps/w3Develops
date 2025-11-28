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
    '/explore',
    '/groups',
    '/groups/create',
    '/hackathons',
    '/hackerspaces',
    '/job-board',
    '/learn',
    '/login',
    '/mentorship',
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
    '/hackathon'
  ];

  return staticRoutes.map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
  }));
}

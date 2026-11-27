import { RESOURCE_DIRECTORY_PATH } from '@/lib/public-resource-directory';
import { SITE_URL } from '@/lib/site-pages';

export const resourceNavigationSkill = {
  name: 'find-w3develops-resources',
  description: 'Find public learning materials, study groups, projects, mentorship, and guides on w3Develops.',
};

export const resourceNavigationSkillText = `---
name: ${resourceNavigationSkill.name}
description: ${resourceNavigationSkill.description}
---

# Find w3Develops resources

Use the [public resource directory](${SITE_URL}${RESOURCE_DIRECTORY_PATH}) to find links by title and description. Use [Learn to Code](${SITE_URL}/learn) for self-study, [Study Groups](${SITE_URL}/studygroups) for learning with peers, or [Group Projects](${SITE_URL}/groupprojects) for team projects.

For help navigating the community, use the [w3Develops guides](${SITE_URL}/docs). Provide the most relevant links so the visitor can open them directly.

The directory supports public navigation. Account creation, joining groups, and messaging are handled on the website by the visitor. Honor the content-use preferences in [robots.txt](${SITE_URL}/robots.txt).
`;

import { createHash } from 'node:crypto';
import { resourceNavigationSkill, resourceNavigationSkillText } from '@/lib/resource-navigation-skill';
import { SITE_URL } from '@/lib/site-pages';

export const dynamic = 'force-static';

export function GET() {
  const { name, description } = resourceNavigationSkill;
  const digest = createHash('sha256').update(resourceNavigationSkillText).digest('hex');

  // Advertise the real static skill. Use the same source bytes as its
  // discovery index so neither the URL nor the digest can drift.
  return Response.json({
    entries: [{
      '@context': 'https://agenticresourcediscovery.org/context/v1',
      identifier: `urn:air:w3develops.org:skills:${name}`,
      displayName: 'Find public resources on w3Develops',
      type: 'application/agent-skills+md',
      url: `${SITE_URL}/.well-known/agent-skills/${name}/SKILL.md`,
      description,
      capabilities: ['find-public-learning-links'],
      representativeQueries: [
        'Where can I find public learning resources on w3Develops?',
        'How can I find study groups or team projects on w3Develops?',
      ],
      metadata: { digest: `sha256:${digest}` },
    }],
  });
}

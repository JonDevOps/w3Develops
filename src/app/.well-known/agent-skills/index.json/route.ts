import { createHash } from 'node:crypto';
import { resourceNavigationSkill, resourceNavigationSkillText } from '@/lib/resource-navigation-skill';

export const dynamic = 'force-static';

export function GET() {
  const digest = createHash('sha256').update(resourceNavigationSkillText).digest('hex');
  return Response.json({
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [{
      ...resourceNavigationSkill,
      type: 'skill-md',
      url: `/.well-known/agent-skills/${resourceNavigationSkill.name}/SKILL.md`,
      digest: `sha256:${digest}`,
    }],
  });
}

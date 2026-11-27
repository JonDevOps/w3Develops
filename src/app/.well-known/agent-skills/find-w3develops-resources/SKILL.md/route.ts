import { resourceNavigationSkillText } from '@/lib/resource-navigation-skill';

export const dynamic = 'force-static';

export function GET() {
  return new Response(resourceNavigationSkillText, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}

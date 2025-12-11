import CohortDashboardPage from './client';

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { cohortId: string } }) {
  return <CohortDashboardPage params={params} />;
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, Query, orderBy, where, limit, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cohort } from '@/lib/types';
import { Github, Users, Search, CalendarDays, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatTimestamp } from '@/lib/utils';
import { ONE_WEEK_IN_MS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { JoinCohortModal } from '@/components/modals/JoinCohortModal';
import JoinCohortButton from '@/components/JoinCohortButton';

export default function CohortsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const oneWeekAgo = useMemo(() => new Date(Date.now() - ONE_WEEK_IN_MS), []);

  const newCohortsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'cohorts'),
      orderBy('createdAt', 'desc'),
      where('createdAt', '>', oneWeekAgo),
      limit(25)
    ) as Query;
  }, [firestore, oneWeekAgo, user]);

  const inProgressCohortsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'cohorts'),
      orderBy('createdAt', 'desc'),
      where('createdAt', '<=', oneWeekAgo),
      limit(50)
    ) as Query;
  }, [firestore, oneWeekAgo, user]);

  const { data: newCohorts, isLoading: isLoadingNew } = useCollection<Cohort>(newCohortsQuery);
  const { data: inProgressCohorts, isLoading: isLoadingInProgress } = useCollection<Cohort>(inProgressCohortsQuery);

  const filteredCohorts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return { newCohorts, inProgressCohorts };

    return {
      newCohorts: newCohorts?.filter(c => c.name_lowercase.includes(term) || c.topic.toLowerCase().includes(term)),
      inProgressCohorts: inProgressCohorts?.filter(c => c.name_lowercase.includes(term) || c.topic.toLowerCase().includes(term)),
    };
  }, [searchTerm, newCohorts, inProgressCohorts]);

  const isLoading = isLoadingNew || isLoadingInProgress;

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <JoinCohortModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-headline">Build Cohorts</h1>
            <p className="text-muted-foreground">Explore cohorts building projects in the w3Develops community.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
             <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Join a Cohort
            </Button>
            <Button asChild variant="secondary">
                <Link href="/cohorts/create">Create a Cohort</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by cohort name or topic..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && <p>Loading cohorts...</p>}
        
        {!isLoading && !filteredCohorts.newCohorts?.length && !filteredCohorts.inProgressCohorts?.length && searchTerm && (
          <div className="text-center py-12">
              <h3 className="text-xl font-semibold">No Cohorts Found</h3>
              <p className="text-muted-foreground mt-2">Try a different search term.</p>
          </div>
        )}

        {/* New Cohorts Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New</h2>
          {!isLoading && filteredCohorts.newCohorts && filteredCohorts.newCohorts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCohorts.newCohorts.map(cohort => (
                <Card key={cohort.id} className="flex flex-col">
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                       <Link href={`/cohorts/${cohort.id}`} className="hover:underline">
                        <CardTitle>{cohort.name}</CardTitle>
                      </Link>
                      <Badge>New</Badge>
                    </div>
                     <Badge variant="secondary" className="w-fit text-center">{cohort.topic}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden">{cohort.description}</p>
                         <div className="flex flex-col text-sm text-muted-foreground gap-2">
                          <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {cohort.memberIds.length} / 25 Members</div>
                          <Badge variant="outline" className="w-fit">{cohort.commitment}</Badge>
                          <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(cohort.createdAt)}</div>
                        </div>
                      </div>
                    <div className="flex gap-2 items-center">
                      {cohort.githubUrl && (
                          <Button variant="outline" asChild size="sm">
                              <a href={cohort.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="w-4 h-4 mr-2" />
                                  View on GitHub
                              </a>
                          </Button>
                      )}
                      <JoinCohortButton cohort={cohort} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <p className="text-muted-foreground">No new cohorts at this time.</p>
          )}
        </section>

        {/* In Progress Cohorts Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">In Progress</h2>
          {!isLoading && filteredCohorts.inProgressCohorts && filteredCohorts.inProgressCohorts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCohorts.inProgressCohorts.map(cohort => (
                <Card key={cohort.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Link href={`/cohorts/${cohort.id}`} className="hover:underline">
                        <CardTitle>{cohort.name}</CardTitle>
                      </Link>
                      <Badge variant="destructive">In Progress</Badge>
                    </div>
                    <Badge variant="secondary" className="w-fit text-center">{cohort.topic}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                      <div>
                          <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden">{cohort.description}</p>
                          <div className="flex flex-col text-sm text-muted-foreground gap-2">
                                  <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {cohort.memberIds.length} / 25 Members</div>
                                  <Badge variant="outline" className="w-fit">{cohort.commitment}</Badge>
                                  <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(cohort.createdAt)}</div>
                          </div>
                      </div>
                    <div className="flex gap-2 items-center">
                      {cohort.githubUrl && (
                          <Button variant="outline" asChild size="sm">
                              <a href={cohort.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="w-4 h-4 mr-2" />
                                  View on GitHub
                              </a>
                          </Button>
                      )}
                      <JoinCohortButton cohort={cohort} />
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <p className="text-muted-foreground">No in-progress cohorts at this time.</p>
          )}
        </section>
      </div>
    </>
  );
}

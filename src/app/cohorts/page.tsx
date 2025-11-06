'use client';

import { useState, useMemo } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cohort } from '@/lib/types';
import { Github, Users, Search, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function formatTimestamp(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
}


export default function CohortsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const cohortsQuery = useMemoFirebase(() => {
    return collection(firestore, 'cohorts') as Query;
  }, [firestore]);

  const { data: cohorts, isLoading } = useCollection<Cohort>(cohortsQuery);

  const { newCohorts, inProgressCohorts } = useMemo(() => {
    if (!cohorts) return { newCohorts: [], inProgressCohorts: [] };
    
    const now = Date.now();
    const allFilteredCohorts = cohorts.filter(cohort => 
      cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const newCohorts = allFilteredCohorts
      .filter(c => c.createdAt && (now - c.createdAt.toMillis()) < ONE_WEEK_IN_MS)
      .sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      
    const inProgressCohorts = allFilteredCohorts
      .filter(c => !c.createdAt || (now - c.createdAt.toMillis()) >= ONE_WEEK_IN_MS)
      .sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

    return { newCohorts, inProgressCohorts };
  }, [cohorts, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
         <div>
          <h1 className="text-3xl font-headline">Build Cohorts</h1>
          <p className="text-muted-foreground">Explore cohorts building projects in the w3Develops community.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <Button asChild>
                <Link href="/cohorts/join">Join a Cohort</Link>
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
      
      {!isLoading && cohorts?.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Cohorts Found</h3>
            <p className="text-muted-foreground mt-2">Be the first to create or join a cohort!</p>
        </div>
      )}

      {/* New Cohorts Section */}
      {newCohorts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newCohorts.map(cohort => (
              <Card key={cohort.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <CardTitle>{cohort.name}</CardTitle>
                    <Badge>New</Badge>
                  </div>
                   <Badge variant="secondary" className="w-fit text-center">{cohort.topic}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{cohort.description}</p>
                   <div className="flex flex-col text-sm text-muted-foreground gap-2">
                    <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {cohort.memberIds.length} / 25 Members</div>
                    <Badge variant="outline" className="w-fit">{cohort.commitment}</Badge>
                    <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(cohort.createdAt)}</div>
                  </div>
                  {cohort.githubUrl && (
                    <Button variant="outline" asChild size="sm">
                        <a href={cohort.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            View on GitHub
                        </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* In Progress Cohorts Section */}
      {inProgressCohorts.length > 0 && (
         <section className="space-y-4">
          <h2 className="text-2xl font-semibold">In Progress</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCohorts.map(cohort => (
              <Card key={cohort.id}>
                <CardHeader>
                    <CardTitle>{cohort.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit text-center">{cohort.topic}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{cohort.description}</p>
                  <div className="flex flex-col text-sm text-muted-foreground gap-2">
                        <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {cohort.memberIds.length} / 25 Members</div>
                        <Badge variant="outline" className="w-fit">{cohort.commitment}</Badge>
                        <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(cohort.createdAt)}</div>
                  </div>
                  {cohort.githubUrl && (
                    <Button variant="outline" asChild size="sm">
                        <a href={cohort.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            View on GitHub
                        </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

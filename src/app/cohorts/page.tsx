'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cohort } from '@/lib/types';
import { Github, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CohortsPage() {
  const firestore = useFirestore();

  const cohortsQuery = useMemoFirebase(() => {
    return collection(firestore, 'cohorts') as Query;
  }, [firestore]);

  const { data: cohorts, isLoading } = useCollection<Cohort>(cohortsQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
         <div>
          <h1 className="text-3xl font-headline">Community Cohorts</h1>
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

      {isLoading && <p>Loading cohorts...</p>}
      
      {!isLoading && cohorts && cohorts.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Cohorts Yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to create or join a cohort!</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cohorts?.map(cohort => (
          <Card key={cohort.id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <CardTitle>{cohort.name}</CardTitle>
                <Badge variant="secondary" className="w-fit">{cohort.topic}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground h-10 overflow-hidden">{cohort.description}</p>
              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-2">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{cohort.memberIds.length} Member(s)</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{cohort.commitment}</span>
                    </div>
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
    </div>
  );
}

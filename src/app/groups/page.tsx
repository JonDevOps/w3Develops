'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudyGroup } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';

export default function GroupsPage() {
  const firestore = useFirestore();

  const groupsQuery = useMemoFirebase(() => {
    return collection(firestore, 'studyGroups') as Query;
  }, [firestore]);

  const { data: studyGroups, isLoading } = useCollection<StudyGroup>(groupsQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline">Explore Study Groups</h1>
          <p className="text-muted-foreground">Find a group to learn and grow with.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <Button asChild>
                <Link href="/groups/join">Join a Group</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/groups/create">Create a Group</Link>
            </Button>
        </div>
      </div>
      
      {isLoading && <p>Loading groups...</p>}

      {!isLoading && studyGroups && studyGroups.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Groups Yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to create or join a study group!</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studyGroups?.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden">{group.description}</p>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{group.memberIds.length} Member(s)</span>
                </div>
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{group.commitment}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

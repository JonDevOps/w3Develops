'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudyGroup } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function GroupsPage() {
  const firestore = useFirestore();

  const groupsQuery = useMemoFirebase(() => {
    return collection(firestore, 'studyGroups') as Query;
  }, [firestore]);

  const { data: studyGroups, isLoading } = useCollection<StudyGroup>(groupsQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Explore Study Groups</h1>
          <p className="text-muted-foreground">Find a group to learn and grow with.</p>
        </div>
        <Button asChild>
          <Link href="/groups/create">Create a Group</Link>
        </Button>
      </div>
      
      {isLoading && <p>Loading groups...</p>}

      {!isLoading && studyGroups && studyGroups.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Groups Yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to create a study group!</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studyGroups?.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <Badge variant="secondary" className="w-fit">{group.skill}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span>{group.memberIds.length} Member(s)</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

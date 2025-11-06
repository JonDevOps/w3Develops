'use client';

import { useMemo, useState } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudyGroup } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function GroupsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const groupsQuery = useMemoFirebase(() => {
    return collection(firestore, 'studyGroups') as Query;
  }, [firestore]);

  const { data: studyGroups, isLoading } = useCollection<StudyGroup>(groupsQuery);
  
  const filteredGroups = useMemo(() => {
    if (!studyGroups) return [];
    return studyGroups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [studyGroups, searchTerm]);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
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
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by group name or topic..."
          className="pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && <p>Loading groups...</p>}

      {!isLoading && filteredGroups.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Matching Groups Found</h3>
            <p className="text-muted-foreground mt-2">Try a different search or be the first to create a group!</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups?.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{group.name}</CardTitle>
                <Badge variant="secondary" className="w-fit text-center">{group.topic}</Badge>
              </div>
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

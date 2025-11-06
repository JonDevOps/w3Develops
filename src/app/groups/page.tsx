'use client';

import { useMemo, useState } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudyGroup } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Search, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function formatTimestamp(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
}


export default function GroupsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const groupsQuery = useMemoFirebase(() => {
    return collection(firestore, 'studyGroups') as Query;
  }, [firestore]);

  const { data: studyGroups, isLoading } = useCollection<StudyGroup>(groupsQuery);
  
  const { newGroups, inProgressGroups } = useMemo(() => {
    if (!studyGroups) return { newGroups: [], inProgressGroups: [] };
    
    const now = Date.now();
    const allFilteredGroups = studyGroups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const newGroups = allFilteredGroups
      .filter(g => g.createdAt && (now - g.createdAt.toMillis()) < ONE_WEEK_IN_MS)
      .sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      
    const inProgressGroups = allFilteredGroups
      .filter(g => !g.createdAt || (now - g.createdAt.toMillis()) >= ONE_WEEK_IN_MS)
      .sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });

    return { newGroups, inProgressGroups };
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

      {!isLoading && studyGroups?.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Groups Found</h3>
            <p className="text-muted-foreground mt-2">Be the first to create or join a group!</p>
        </div>
      )}

      {/* New Groups Section */}
      {newGroups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New</h2>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newGroups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{group.name}</CardTitle>
                    <Badge>New</Badge>
                  </div>
                  <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{group.description}</p>
                  <div className="flex flex-col text-sm text-muted-foreground gap-2">
                    <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {group.memberIds.length} / 25 Members</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {group.commitment}</div>
                    <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(group.createdAt)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* In Progress Groups Section */}
      {inProgressGroups.length > 0 && (
         <section className="space-y-4">
          <h2 className="text-2xl font-semibold">In Progress</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inProgressGroups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
                </CardHeader>
                 <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{group.description}</p>
                  <div className="flex flex-col text-sm text-muted-foreground gap-2">
                    <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {group.memberIds.length} / 25 Members</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {group.commitment}</div>
                    <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(group.createdAt)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
    </div>
  );
}

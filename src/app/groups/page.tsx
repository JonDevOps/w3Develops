'use client';

import { useMemo, useState } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query, Timestamp, orderBy, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudyGroup } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users, Search, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function formatTimestamp(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
}

export default function GroupsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const oneWeekAgo = useMemo(() => new Timestamp(Math.floor((Date.now() - ONE_WEEK_IN_MS) / 1000), 0), []);

  const newGroupsQuery = useMemoFirebase(() => {
    return query(
        collection(firestore, 'studyGroups'), 
        orderBy('createdAt', 'desc'),
        where('createdAt', '>', oneWeekAgo),
        limit(25)
    ) as Query;
  }, [firestore, oneWeekAgo]);

  const inProgressGroupsQuery = useMemoFirebase(() => {
    return query(
        collection(firestore, 'studyGroups'),
        orderBy('createdAt', 'desc'),
        where('createdAt', '<=', oneWeekAgo),
        limit(50)
    ) as Query;
  }, [firestore, oneWeekAgo]);

  const { data: newGroups, isLoading: isLoadingNew } = useCollection<StudyGroup>(newGroupsQuery);
  const { data: inProgressGroups, isLoading: isLoadingInProgress } = useCollection<StudyGroup>(inProgressGroupsQuery);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return { newGroups, inProgressGroups };
    
    return {
        newGroups: newGroups?.filter(g => g.name.toLowerCase().includes(term) || g.topic.toLowerCase().includes(term)),
        inProgressGroups: inProgressGroups?.filter(g => g.name.toLowerCase().includes(term) || g.topic.toLowerCase().includes(term))
    }
  }, [searchTerm, newGroups, inProgressGroups]);

  const isLoading = isLoadingNew || isLoadingInProgress;

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

      {!isLoading && !filteredGroups.newGroups?.length && !filteredGroups.inProgressGroups?.length && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Groups Found</h3>
            <p className="text-muted-foreground mt-2">{searchTerm ? 'Try a different search term.' : 'Be the first to create or join a group!'}</p>
        </div>
      )}

      {/* New Groups Section */}
      {filteredGroups.newGroups && filteredGroups.newGroups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New</h2>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.newGroups.map(group => (
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
                    <Badge variant="outline" className="w-fit">{group.commitment}</Badge>
                    <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(group.createdAt)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* In Progress Groups Section */}
      {filteredGroups.inProgressGroups && filteredGroups.inProgressGroups.length > 0 && (
         <section className="space-y-4">
          <h2 className="text-2xl font-semibold">In Progress</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.inProgressGroups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
                </CardHeader>
                 <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{group.description}</p>
                  <div className="flex flex-col text-sm text-muted-foreground gap-2">
                    <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {group.memberIds.length} / 25 Members</div>
                    <Badge variant="outline" className="w-fit">{group.commitment}</Badge>
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

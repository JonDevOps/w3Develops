'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { collection, Query, orderBy, where, limit, query, getDocs, arrayUnion, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudyGroup } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Users, Search, CalendarDays, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatTimestamp } from '@/lib/utils';
import { ONE_WEEK_IN_MS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

function JoinGroupButton({ group }: { group: StudyGroup }) {
    const { user } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isJoining, setIsJoining] = useState(false);
    
    const isMember = user ? group.memberIds.includes(user.uid) : false;
    const canJoin = group.memberIds.length < 25 && !isMember;

    if (!canJoin) {
        if (isMember) {
            return (
                <Button variant="outline" asChild size="sm">
                    <Link href={`/groups/${group.id}`}>View Group</Link>
                </Button>
            );
        }
        return null;
    }
    
    const handleJoin = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to join a group.' });
            return;
        }

        setIsJoining(true);

        try {
            // Client-side check: See if user is already in a similar group
            const userGroupsQuery = query(
                collection(firestore, 'studyGroups'),
                where('memberIds', 'array-contains', user.uid),
                where('topic', '==', group.topic),
                where('commitment', '==', group.commitment)
            );
            const existingGroupsSnapshot = await getDocs(userGroupsQuery);

            if (!existingGroupsSnapshot.empty) {
                toast({ variant: 'destructive', title: 'Already in a similar group', description: "You're already a member of a group with the same topic and commitment." });
                setIsJoining(false);
                return;
            }

            // If check passes, attempt to join
            const groupRef = doc(firestore, 'studyGroups', group.id);
            updateDocumentNonBlocking(groupRef, {
                memberIds: arrayUnion(user.uid)
            });

            toast({ title: 'Success!', description: `You've joined the group: ${group.name}` });
            // The UI will update automatically due to the real-time listener.
            // isMember will become true, and the button will change to "View Group".

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Could Not Join', description: error.message || "An unexpected error occurred." });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Button onClick={handleJoin} disabled={isJoining} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            {isJoining ? 'Joining...' : 'Join Group'}
        </Button>
    );
}

export default function GroupsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const oneWeekAgo = useMemo(() => new Date(Date.now() - ONE_WEEK_IN_MS), []);

  const newGroupsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'studyGroups'), 
        orderBy('createdAt', 'desc'),
        where('createdAt', '>', oneWeekAgo),
        limit(25)
    ) as Query;
  }, [firestore, oneWeekAgo, user]);

  const inProgressGroupsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'studyGroups'),
        orderBy('createdAt', 'desc'),
        where('createdAt', '<=', oneWeekAgo),
        limit(50)
    ) as Query;
  }, [firestore, oneWeekAgo, user]);

  const { data: newGroups, isLoading: isLoadingNew } = useCollection<StudyGroup>(newGroupsQuery);
  const { data: inProgressGroups, isLoading: isLoadingInProgress } = useCollection<StudyGroup>(inProgressGroupsQuery);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return { newGroups, inProgressGroups };
    
    return {
        newGroups: newGroups?.filter(g => g.name_lowercase.includes(term) || g.topic.toLowerCase().includes(term)),
        inProgressGroups: inProgressGroups?.filter(g => g.name_lowercase.includes(term) || g.topic.toLowerCase().includes(term))
    }
  }, [searchTerm, newGroups, inProgressGroups]);

  const isLoading = isLoadingNew || isLoadingInProgress;

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

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

      {!isLoading && !filteredGroups.newGroups?.length && !filteredGroups.inProgressGroups?.length && searchTerm && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Groups Found</h3>
            <p className="text-muted-foreground mt-2">Try a different search term.</p>
        </div>
      )}

      {/* New Groups Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">New</h2>
        {!isLoading && filteredGroups.newGroups && filteredGroups.newGroups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.newGroups.map(group => (
              <Card key={group.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Link href={`/groups/${group.id}`} className="hover:underline">
                      <CardTitle>{group.name}</CardTitle>
                    </Link>
                    <Badge>New</Badge>
                  </div>
                  <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden">{group.description}</p>
                    <div className="flex flex-col text-sm text-muted-foreground gap-2">
                        <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {group.memberIds.length} / 25 Members</div>
                        <Badge variant="outline" className="w-fit">{group.commitment}</Badge>
                        <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(group.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                     <JoinGroupButton group={group} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && <p className="text-muted-foreground">No new groups at this time.</p>
        )}
      </section>
      
      {/* In Progress Groups Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">In Progress</h2>
        {!isLoading && filteredGroups.inProgressGroups && filteredGroups.inProgressGroups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.inProgressGroups.map(group => (
              <Card key={group.id} className="flex flex-col">
                <CardHeader>
                    <Link href={`/groups/${group.id}`} className="hover:underline">
                        <CardTitle>{group.name}</CardTitle>
                    </Link>
                    <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
                </CardHeader>
                 <CardContent className="space-y-4 flex-grow flex flex-col">
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden flex-grow">{group.description}</p>
                  <div className="flex flex-col text-sm text-muted-foreground gap-2">
                    <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {group.memberIds.length} / 25 Members</div>
                    <Badge variant="outline" className="w-fit">{group.commitment}</Badge>
                    <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Created: {formatTimestamp(group.createdAt)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && <p className="text-muted-foreground">No in-progress groups at this time.</p>
        )}
      </section>
      
    </div>
  );
}

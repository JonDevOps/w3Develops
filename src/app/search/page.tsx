'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { UserProfile, StudyGroup, Cohort } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

function SearchResultsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-96 bg-muted rounded"></div>
      
      {/* Users Skeleton */}
      <section>
        <div className="h-7 w-24 bg-muted rounded mb-4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full bg-muted h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </section>

      {/* Groups Skeleton */}
      <section>
        <div className="h-7 w-36 bg-muted rounded mb-4"></div>
        <div className="grid gap-6 md:grid-cols-2">
           {[...Array(2)].map((_, i) => (
            <Card key={i}><CardHeader>
              <div className="h-6 w-48 bg-muted rounded"></div>
              <div className="h-5 w-24 bg-muted rounded-full mt-2"></div>
            </CardHeader><CardContent className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="flex items-center gap-4 mt-4">
                <div className="h-5 w-32 bg-muted rounded"></div>
                <div className="h-6 w-28 bg-muted rounded-full"></div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!q) return null;
    const lowerQ = q.toLowerCase();
    return query(
        collection(firestore, 'users'), 
        orderBy('name_lowercase'),
        where('name_lowercase', '>=', lowerQ),
        where('name_lowercase', '<=', lowerQ + '\uf8ff'),
        limit(10)
    );
  }, [q, firestore]);

  const groupsQuery = useMemoFirebase(() => {
    if (!q) return null;
    const lowerQ = q.toLowerCase();
    return query(
        collection(firestore, 'studyGroups'), 
        orderBy('name_lowercase'),
        where('name_lowercase', '>=', lowerQ),
        where('name_lowercase', '<=', lowerQ + '\uf8ff'),
        limit(10)
    );
  }, [q, firestore]);

  const cohortsQuery = useMemoFirebase(() => {
    if (!q) return null;
    const lowerQ = q.toLowerCase();
    return query(
        collection(firestore, 'cohorts'), 
        orderBy('name_lowercase'),
        where('name_lowercase', '>=', lowerQ),
        where('name_lowercase', '<=', lowerQ + '\uf8ff'),
        limit(10)
    );
  }, [q, firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);
  const { data: groups, isLoading: groupsLoading } = useCollection<StudyGroup>(groupsQuery);
  const { data: cohorts, isLoading: cohortsLoading } = useCollection<Cohort>(cohortsQuery);

  const isLoading = usersLoading || groupsLoading || cohortsLoading;
  const noResults = !isLoading && !users?.length && !groups?.length && !cohorts?.length;

  if (!q) {
    return <div className="text-center text-muted-foreground">Please enter a search term to begin.</div>;
  }
  
  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline">Search Results for &quot;{q}&quot;</h1>
      
      {noResults && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Results Found</h3>
            <p className="text-muted-foreground mt-2">We couldn't find any users, groups, or cohorts matching your search.</p>
        </div>
      )}

      {users && users.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map(user => (
              <Link key={user.id} href={`/users/${user.id}`} className="block">
                <Card className="h-full hover:bg-accent transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.profilePictureUrl} />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {groups && groups.length > 0 && (
         <section>
          <h2 className="text-2xl font-semibold mb-4">Study Groups</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {groups.map(group => (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader>
                      <CardTitle>{group.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit">{group.topic}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground h-10 overflow-hidden">{group.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{group.memberIds.length} / 25 Members</div>
                          <Badge variant="outline" className="w-fit">{group.commitment}</Badge>
                      </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

       {cohorts && cohorts.length > 0 && (
         <section>
          <h2 className="text-2xl font-semibold mb-4">Build Cohorts</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {cohorts.map(cohort => (
               <Link href={`/cohorts/${cohort.id}`} key={cohort.id}>
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader>
                      <CardTitle>{cohort.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit">{cohort.topic}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground h-10 overflow-hidden">{cohort.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{cohort.memberIds.length} / 25 Members</div>
                          <Badge variant="outline" className="w-fit">{cohort.commitment}</Badge>
                      </div>
                  </CardContent>
                </Card>
               </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults />
        </Suspense>
    )
}

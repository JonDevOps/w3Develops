
'use client';

import { useDoc, useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Users, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'


function DashboardLoading() {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 rounded-md bg-muted mb-4"></div>
          <div className="h-6 w-1/2 rounded-md bg-muted mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <div className="h-48 rounded-lg bg-muted"></div>
            </div>
            <div className="space-y-6">
                <div className="h-32 rounded-lg bg-muted"></div>
                <div className="h-32 rounded-lg bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    );
}

function MemberAvatar({ member }: { member: any }) {
  if (!member) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <Link href={`/profile/${member.username}`}>
                <Avatar className="border-2 border-background">
                    <AvatarImage src={member.profilePictureUrl} alt={member.username} />
                    <AvatarFallback>{member.username?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
            </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{member.username}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function MyGroups({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const groupsQuery = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return query(collection(firestore, 'learning_groups'), where('members', 'array-contains', userId));
    }, [firestore, userId]);

    const { data: groups, isLoading } = useCollection(groupsQuery);
    
    if (isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (!groups || groups.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Study Groups</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You haven't joined any groups yet.</p>
                </CardContent>
                 <CardFooter>
                     <Button asChild variant="secondary">
                        <Link href="/groups">Find a Group</Link>
                    </Button>
                 </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Study Groups</CardTitle>
                 <CardDescription>
                    The groups you are currently a member of.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {groups.map((group) => {
                    const members = group.members || [];
                    return (
                        <div key={group.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{group.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Badge variant="secondary">{group.primarySkill}</Badge>
                                    <span>·</span>
                                    <span>{members.length} / {group.groupSizeLimit || 25} members</span>
                                </div>
                            </div>
                           <Button asChild>
                                <Link href={`/groups/${group.id}`}>
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                           </Button>
                        </div>
                    )
                 })}
            </CardContent>
        </Card>
    )
}


export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return <DashboardLoading />;
  }
  
  if (!userProfile) {
     // This case should ideally be handled by the signup process ensuring a profile is created.
     // But as a fallback, we can prompt the user to create one.
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="font-headline text-3xl font-bold">Welcome!</h1>
        <p className="mt-4 text-lg text-foreground/80">
          It looks like your profile isn't set up yet.
        </p>
         <Button asChild className="mt-6">
            <Link href="/profile">Create Your Profile <ArrowRight className="ml-2"/></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Welcome back, {userProfile.displayName}!
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-foreground/80">
          Here's a quick overview of your activity. Find your study groups, manage your profile, and connect with other developers.
        </p>
      </div>

       <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
                {user && <MyGroups userId={user.uid} />}
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Keep your profile up-to-date so others can find you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/profile"><User className="mr-2"/> Edit Profile</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Study Groups</CardTitle>
                        <CardDescription>Find or create a group to collaborate and learn.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/groups"><Users className="mr-2"/> Explore Groups</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
       </div>
    </div>
  );
}

    
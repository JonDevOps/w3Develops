'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, PlusCircle, Users } from 'lucide-react'
import { useCollection, useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase'
import { arrayUnion, collection, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { differenceInDays, fromUnixTime } from 'date-fns'

function MemberAvatar({ memberId }: { memberId: string }) {
  const { firestore } = useFirebase()
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore) return null
    return doc(firestore, 'users', memberId, 'profile', 'data')
  }, [firestore, memberId])

  const { data: member } = useDoc(userProfileRef)

  if (!member) {
    return (
      <Avatar className="border-2 border-background">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className="border-2 border-background">
            <AvatarImage src={member.profilePictureUrl} alt={member.displayName} />
            <AvatarFallback>{member.username?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{member.username || member.displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function GroupsPage() {
  const { firestore, user } = useFirebase()
  const { toast } = useToast()
  
  const groupsCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'learning_groups') : null),
    [firestore]
  )
  const { data: groups, isLoading } = useCollection(groupsCollectionRef)

  const handleJoinGroup = (groupId: string, memberIds: string[], createdAt: any) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Not signed in",
        description: "You must be signed in to join a group.",
      });
      return;
    }

    if (memberIds.includes(user.uid)) {
      toast({
        variant: "destructive",
        title: "Already a member",
        description: "You are already in this group.",
      });
      return;
    }

    if (memberIds.length >= 25) {
      toast({
        variant: "destructive",
        title: "Group is full",
        description: "This group has reached its member limit.",
      });
      return;
    }
    
    if (createdAt) {
      const groupCreationDate = fromUnixTime(createdAt.seconds);
      if (differenceInDays(new Date(), groupCreationDate) > 7) {
        toast({
          variant: "destructive",
          title: "Group is too old",
          description: "This group is more than a week old and no longer accepting new members.",
        });
        return;
      }
    }


    const groupRef = doc(firestore, 'learning_groups', groupId);
    updateDocumentNonBlocking(groupRef, {
      memberIds: arrayUnion(user.uid)
    });
    toast({
      title: "Successfully joined!",
      description: "You have been added to the group.",
    });
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Learning Groups
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
          Discover active groups, create your own, or get matched with the perfect team.
        </p>
      </div>

      <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/groups/find">
            <Users className="mr-2 h-5 w-5" /> Get Matched with a Group
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/groups/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Create a New Group
          </Link>
        </Button>
      </div>

      {isLoading && <p className='text-center'>Loading groups...</p>}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <Card key={group.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6 flex flex-wrap gap-2">
                <Badge variant="secondary">{group.primarySkill}</Badge>
              </div>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                Members ({group.memberIds.length} / 25)
              </h4>
              <div className="-space-x-2 flex">
                {group.memberIds.slice(0, 5).map((memberId: string) => (
                  <MemberAvatar key={memberId} memberId={memberId} />
                ))}
                {group.memberIds.length > 5 && (
                  <Avatar className="border-2 border-background">
                    <AvatarFallback>
                      +{group.memberIds.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleJoinGroup(group.id, group.memberIds, group.createdAt)}>
                Join This Group <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

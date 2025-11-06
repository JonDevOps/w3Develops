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
import { ArrowRight, PlusCircle, Users, Group } from 'lucide-react'
import { useCollection, useDoc, useFirebase, useMemoFirebase, useUser } from '@/firebase'
import { collection, doc } from 'firebase/firestore'

function MemberAvatar({ memberId }: { memberId: string }) {
  const { firestore } = useFirebase()
  const { isUserLoading } = useUser();
  
  const userProfileRef = useMemoFirebase(() => {
    if (isUserLoading || !firestore) return null
    return doc(firestore, 'users', memberId, 'profile', 'data')
  }, [firestore, memberId, isUserLoading])

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
  const { firestore, isUserLoading } = useFirebase()
  
  const groupsCollectionRef = useMemoFirebase(
    () => (isUserLoading || !firestore ? null : collection(firestore, 'learning_groups')),
    [firestore, isUserLoading]
  )
  const { data: groups, isLoading } = useCollection(groupsCollectionRef)

  const renderEmptyState = () => (
    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
      <Group className="mx-auto h-16 w-16 text-muted-foreground" />
      <h2 className="mt-6 text-xl font-semibold">No Study Groups Yet</h2>
      <p className="mt-2 text-muted-foreground">
        It looks like there are no active study groups right now.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/groups/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Be the First to Create One!
          </Link>
        </Button>
      </div>
    </div>
  )


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Study Groups
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

      {(isLoading || isUserLoading) && <p className='text-center'>Loading groups...</p>}

      {!isLoading && !isUserLoading && groups && groups.length === 0 && renderEmptyState()}

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
                <Badge variant="outline">{group.timeCommitment}</Badge>
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
              <Button asChild className="w-full">
                  <Link href={`/groups/${group.id}`}>
                    View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

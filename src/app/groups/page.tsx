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
import { ArrowRight } from 'lucide-react'
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase'
import { collection, doc } from 'firebase/firestore'

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
            <AvatarFallback>{member.displayName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{member.displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function GroupsPage() {
  const { firestore } = useFirebase()
  const groupsCollectionRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'learning_groups') : null),
    [firestore]
  )
  const { data: groups, isLoading } = useCollection(groupsCollectionRef)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Learning Groups
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
          Discover active groups and see who's collaborating.
        </p>
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
                Members ({group.memberIds.length})
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
                <Link href="/signup">
                  Join This Group <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

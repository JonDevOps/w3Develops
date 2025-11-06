
'use client'

import { useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase'
import { arrayRemove, doc } from 'firebase/firestore'
import { notFound, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

function MemberPill({ memberId }: { memberId: string }) {
  const { firestore } = useFirebase()

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore) return null
    return doc(firestore, 'users', memberId, 'profile', 'data')
  }, [firestore, memberId])

  const { data: member } = useDoc(userProfileRef)

  if (!member) {
    return (
      <div className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">Loading...</span>
      </div>
    )
  }

  return (
    <Link href={`/profile/${member.username}`} className="transition-transform hover:scale-105">
        <div className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3 hover:bg-muted">
        <Avatar className="h-8 w-8">
            <AvatarImage src={member.profilePictureUrl} alt={member.displayName} />
            <AvatarFallback>{member.username?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{member.displayName}</span>
        </div>
    </Link>
  )
}


export default function GroupDashboardPage({ params }: { params: { groupId: string } }) {
  const { firestore, user } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.groupId;

  const groupRef = useMemoFirebase(() => {
    if (!firestore || !groupId) return null
    return doc(firestore, 'learning_groups', groupId)
  }, [firestore, groupId])

  const { data: group, isLoading } = useDoc(groupRef)

  const handleLeaveGroup = async () => {
    if (!user || !groupRef) return

    try {
        updateDocumentNonBlocking(groupRef, {
            memberIds: arrayRemove(user.uid)
        });
        toast({
            title: "You have left the group.",
            description: "You can always join another group from the study groups page.",
        });
        router.push('/groups');
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message || "Could not leave the group.",
        })
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12">Loading group dashboard...</div>
  }

  if (!group) {
    return notFound()
  }

  const isMember = user && group.memberIds.includes(user.uid);

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-headline text-4xl mb-2">{group.name}</CardTitle>
              <CardDescription className="text-lg">{group.description}</CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{group.primarySkill}</Badge>
                <Badge variant="outline">{group.timeCommitment}</Badge>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-shrink-0 gap-2">
                 <Button asChild>
                    <a href="https://discord.com/invite/ckQ52gA" target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="mr-2"/> Group Chat
                    </a>
                </Button>
                {isMember && (
                    <Button variant="destructive" onClick={handleLeaveGroup}>
                        <LogOut className="mr-2"/> Leave Group
                    </Button>
                )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Shared Resources</CardTitle>
                    <CardDescription>Links, articles, and tools shared by the group.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Members ({group.memberIds.length} / {group.groupSizeLimit})</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {group.memberIds.map((memberId: string) => (
                        <MemberPill key={memberId} memberId={memberId} />
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

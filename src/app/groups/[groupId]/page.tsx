
'use client'

import { useDoc, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase'
import { arrayRemove, arrayUnion, doc } from 'firebase/firestore'
import { notFound, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, MessageSquare, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import React from 'react'

type GroupMember = {
  userId: string;
  username: string;
  profilePictureUrl?: string;
  displayName?: string;
}

function MemberPill({ member }: { member: GroupMember }) {
  if (!member) return null;

  return (
    <Link href={`/profile/${member.username}`} className="transition-transform hover:scale-105">
        <div className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3 hover:bg-muted">
        <Avatar className="h-8 w-8">
            <AvatarImage src={member.profilePictureUrl} alt={member.displayName} />
            <AvatarFallback>{member.username?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{member.displayName || member.username}</span>
        </div>
    </Link>
  )
}


export default function GroupDashboardPage({ params }: { params: { groupId: string } }) {
  const resolvedParams = React.use(params);
  const { firestore, user, isUserLoading } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = resolvedParams.groupId;

  const groupRef = useMemoFirebase(() => {
    if (!firestore || !groupId) return null
    return doc(firestore, 'learning_groups', groupId)
  }, [firestore, groupId])

  const userProfileRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'users', user.uid, 'profile', 'data')
  }, [user, firestore])

  const { data: group, isLoading: isGroupLoading } = useDoc(groupRef)
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef)
  
  const handleLeaveGroup = async () => {
    if (!user || !groupRef || !group) return

    const memberToRemove = group.members.find((m: GroupMember) => m.userId === user.uid)
    if (!memberToRemove) return;

    try {
        updateDocumentNonBlocking(groupRef, {
            members: arrayRemove(memberToRemove)
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
  
  const handleJoinGroup = async () => {
      if (!user || !groupRef || !userProfile) return;

      const newMember = {
          userId: user.uid,
          username: userProfile.username,
          profilePictureUrl: userProfile.profilePictureUrl || '',
          displayName: userProfile.displayName
      };

      try {
          updateDocumentNonBlocking(groupRef, {
              members: arrayUnion(newMember)
          });
          toast({
              title: "Welcome to the group!",
              description: "You have successfully joined.",
          });
      } catch(e: any) {
          toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: e.message || "Could not join the group.",
          })
      }
  }


  if (isGroupLoading || isUserLoading || isProfileLoading) {
    return <div className="container mx-auto px-4 py-12">Loading group dashboard...</div>
  }

  if (!group) {
    return notFound()
  }

  const memberIds = group.members.map((m: GroupMember) => m.userId);
  const isMember = user && memberIds.includes(user.uid);
  const isFull = group.members.length >= group.groupSizeLimit;

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
                {isMember ? (
                    <Button variant="destructive" onClick={handleLeaveGroup}>
                        <LogOut className="mr-2"/> Leave Group
                    </Button>
                ) : (
                    <Button onClick={handleJoinGroup} disabled={isFull}>
                        <UserPlus className="mr-2"/> {isFull ? "Group Full" : "Join Group"}
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
                    <CardTitle>Members ({group.members.length} / {group.groupSizeLimit})</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {group.members.map((member: GroupMember) => (
                        <MemberPill key={member.userId} member={member} />
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

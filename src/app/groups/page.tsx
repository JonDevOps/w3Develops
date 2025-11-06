import Image from 'next/image'
import { groups, User } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function MemberAvatar({ member }: { member: User }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className="border-2 border-background">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{member.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function GroupsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Learning Groups
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Discover active groups and see who's collaborating.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map((group) => (
          <Card key={group.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{group.skill}</Badge>
                <Badge variant="outline">{group.pace} Pace</Badge>
              </div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Members ({group.members.length})</h4>
              <div className="flex -space-x-2">
                {group.members.slice(0, 5).map((member) => (
                  <MemberAvatar key={member.id} member={member} />
                ))}
                {group.members.length > 5 && (
                   <Avatar className="border-2 border-background">
                     <AvatarFallback>+{group.members.length - 5}</AvatarFallback>
                   </Avatar>
                )}
              </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/signup">Join This Group <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

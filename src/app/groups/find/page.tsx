'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useFirebase } from '@/firebase'
import { collection, query, where, getDocs, runTransaction, doc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

const technologies = ["html/css", "javascript", "python", "react", "django", "nodejs", "rust", "digital marketing", "web3", "cryptocurrency", "cybersecurity", "nfts", "sql", "artifical intelligence", "web design", "programming fundementals"] as const;

const findGroupSchema = z.object({
  primarySkill: z.enum(technologies),
  timeCommitment: z.enum(['part-time', 'full-time']),
})

export default function FindGroupPage() {
  const { toast } = useToast()
  const { user, firestore, isUserLoading } = useFirebase()
  const router = useRouter()

  const form = useForm<z.infer<typeof findGroupSchema>>({
    resolver: zodResolver(findGroupSchema),
    defaultValues: {
      primarySkill: 'javascript',
      timeCommitment: 'part-time',
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof findGroupSchema>) {
    if (!user || !firestore || isUserLoading) {
        toast({
            variant: "destructive",
            title: "Not signed in",
            description: "You must be signed in to find a group.",
        })
        return;
    }

    const groupsRef = collection(firestore, 'learning_groups');
    
    try {
      const suitableGroupsQuery = query(
        groupsRef,
        where('primarySkill', '==', values.primarySkill),
        where('timeCommitment', '==', values.timeCommitment),
      );
      const querySnapshot = await getDocs(suitableGroupsQuery);
      
      const availableGroups = querySnapshot.docs.filter(doc => {
          const data = doc.data();
          const memberIds = data.members?.map((m: any) => m.userId) || []
          return memberIds.length < data.groupSizeLimit && !memberIds.includes(user.uid);
      });

      if (availableGroups.length > 0) {
        const groupToJoinRef = availableGroups[0].ref;
        await runTransaction(firestore, async (transaction) => {
          const [groupDoc, userProfileDoc] = await Promise.all([
            transaction.get(groupToJoinRef),
            getDoc(doc(firestore, 'users', user.uid, 'profile', 'data'))
          ]);
          
          if (!groupDoc.exists()) {
            throw "This group no longer exists. Please try again.";
          }
          if (!userProfileDoc.exists()) {
              throw "Could not find your user profile.";
          }

          const groupData = groupDoc.data();
          const userProfile = userProfileDoc.data();

          if (groupData.members.length >= groupData.groupSizeLimit) {
            throw "This group is now full. Please try finding another one.";
          }
          
          const newMember = {
              userId: user.uid,
              username: userProfile.username,
              displayName: userProfile.displayName,
              profilePictureUrl: userProfile.profilePictureUrl || ''
          };

          transaction.update(groupToJoinRef, { members: arrayUnion(newMember) });
        });
        toast({
          title: 'Joined Existing Group!',
          description: `You have been added to ${availableGroups[0].data().name}.`,
        });
        router.push(`/groups/${availableGroups[0].id}`);

      } else {
        // No available group, create a new one within a transaction
        const counterRef = doc(firestore, 'counters', `group--${values.primarySkill}--${values.timeCommitment}`);
        const newGroupRef = doc(groupsRef); // Auto-generate ID for the new group
        const userProfileRef = doc(firestore, 'users', user.uid, 'profile', 'data');


        await runTransaction(firestore, async (transaction) => {
            const [counterDoc, userProfileDoc] = await Promise.all([
                transaction.get(counterRef),
                transaction.get(userProfileRef)
            ]);
            
            if (!userProfileDoc.exists()) {
                throw "Could not find your user profile to create a new group.";
            }
            const userProfile = userProfileDoc.data();

            const newCount = counterDoc.exists() ? counterDoc.data().count + 1 : 1;
            
            const skillLabel = values.primarySkill.charAt(0).toUpperCase() + values.primarySkill.slice(1);
            const commitmentLabel = values.timeCommitment;
            const groupName = `${skillLabel} ${commitmentLabel} #${newCount}`;

            const newGroup = {
                name: groupName,
                description: `A group for developers focusing on ${values.primarySkill}.`,
                primarySkill: values.primarySkill,
                timeCommitment: values.timeCommitment,
                members: [{
                    userId: user.uid,
                    username: userProfile.username,
                    displayName: userProfile.displayName,
                    profilePictureUrl: userProfile.profilePictureUrl || ''
                }],
                groupSizeLimit: 25,
                createdAt: serverTimestamp(),
            };
            
            transaction.set(newGroupRef, newGroup);
            if (counterDoc.exists()) {
              transaction.update(counterRef, { count: counterDoc.data().count + 1 });
            } else {
              transaction.set(counterRef, { count: 1 });
            }
        });

        toast({
            title: 'New Group Created!',
            description: `You have been placed in a new group.`,
        });
        router.push(`/groups/${newGroupRef.id}`);
      }


    } catch (e: any) {
        console.error("Group matching failed: ", e);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: typeof e === 'string' ? e : e.message || "Could not find or create a group. Please try again.",
        });
    }
  }
  
  if (isUserLoading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8">
        Find Your Perfect Study Group
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Matching Preferences</CardTitle>
          <CardDescription>
            Tell us what you want to learn and your availability, and we'll find the right group for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="primarySkill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you want to learn?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a technology" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                         {technologies.map(tech => <SelectItem key={tech} value={tech}>{tech.charAt(0).toUpperCase() + tech.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will be the main focus of your group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How much time can you commit?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="part-time" />
                          </FormControl>
                          <Label className="font-normal">
                            Part-time (6 hours per day)
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="full-time" />
                          </FormControl>
                          <Label className="font-normal">
                            Full-time (12 hours per day)
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting || isUserLoading}>
                {isSubmitting ? 'Finding Group...' : 'Find My Group'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

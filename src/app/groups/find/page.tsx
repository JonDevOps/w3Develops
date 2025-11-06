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
import { addDoc, collection, query, where, getDocs, limit, updateDoc, arrayUnion, doc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

const technologies = ["html/css", "javascript", "python", "react", "django", "nodejs", "rust", "digital marketing", "web3", "cryptocurrency", "cybersecurity", "nfts", "sql", "artifical intelligence", "web design", "programming fundementals"] as const;

const findGroupSchema = z.object({
  primarySkill: z.enum(technologies),
  timeCommitment: z.enum(['part-time', 'full-time']),
})

export default function FindGroupPage() {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const router = useRouter()

  const form = useForm<z.infer<typeof findGroupSchema>>({
    resolver: zodResolver(findGroupSchema),
    defaultValues: {
      primarySkill: 'javascript',
      timeCommitment: 'part-time',
    },
  })

  async function onSubmit(values: z.infer<typeof findGroupSchema>) {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Not signed in",
            description: "You must be signed in to find a group.",
        })
        return;
    }

    const groupsRef = collection(firestore, 'learning_groups');
    
    // Query for an existing group that matches the criteria and has space
    const q = query(
      groupsRef,
      where('primarySkill', '==', values.primarySkill),
      where('timeCommitment', '==', values.timeCommitment),
      where('groupSizeLimit', '>', 24), // Simple way to check if it's less than 25
      limit(1)
    );

    try {
        const querySnapshot = await getDocs(q);

        let groupJoined = false;

        if (!querySnapshot.empty) {
            // Found a group, attempt to join
            const groupDoc = querySnapshot.docs[0];
            
            // Check if user is already a member
            const memberIds = groupDoc.data().memberIds as string[];
            if (memberIds.includes(user.uid)) {
                toast({
                    title: 'Already in Group',
                    description: `You are already a member of ${groupDoc.data().name}.`,
                });
                router.push('/groups');
                return;
            }

            const groupRef = doc(firestore, 'learning_groups', groupDoc.id);
            await updateDoc(groupRef, {
                memberIds: arrayUnion(user.uid)
            });
            toast({
                title: 'Joined Existing Group!',
                description: `You have been added to ${groupDoc.data().name}.`,
            });
            groupJoined = true;

        } else {
            // No group found, create a new one
            const groupName = `${values.primarySkill.charAt(0).toUpperCase() + values.primarySkill.slice(1)} ${values.timeCommitment === 'full-time' ? 'Coders' : 'Learners'}`;
            const newGroup = {
                name: groupName,
                description: `A group for developers focusing on ${values.primarySkill}.`,
                primarySkill: values.primarySkill,
                timeCommitment: values.timeCommitment,
                memberIds: [user.uid],
                groupSizeLimit: 25,
                createdAt: serverTimestamp(),
            };
            await addDoc(groupsRef, newGroup);
            toast({
                title: 'New Group Created!',
                description: `You have been placed in a new group: ${groupName}.`,
            });
            groupJoined = true;
        }

        if (groupJoined) {
            router.push('/groups');
        }

    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message || "Could not find or create a group.",
        });
    }
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8">
        Find Your Perfect Group
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
                        </SelectTrigger>
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
                            Part-time (6-12 hours per week)
                          </Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="full-time" />
                          </FormControl>
                          <Label className="font-normal">
                            Full-time (12+ hours per week)
                          </Label>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Find My Group</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

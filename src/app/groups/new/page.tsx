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
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirebase } from '@/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

const technologies = ["html/css", "javascript", "python", "react", "django", "nodejs", "rust", "digital marketing", "web3", "cryptocurrency", "cybersecurity", "nfts", "sql", "artifical intelligence", "web design", "programming fundementals"] as const;

const newGroupSchema = z.object({
  name: z.string().min(5, { message: 'Group name must be at least 5 characters.' }),
  description: z.string().max(200, { message: 'Description must not be longer than 200 characters.' }).min(10, { message: 'Description must be at least 10 characters.' }),
  primarySkill: z.enum(technologies),
  timeCommitment: z.enum(['part-time', 'full-time']),
})

export default function NewGroupPage() {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const router = useRouter()

  const form = useForm<z.infer<typeof newGroupSchema>>({
    resolver: zodResolver(newGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      primarySkill: 'javascript',
      timeCommitment: 'part-time',
    },
  })

  async function onSubmit(values: z.infer<typeof newGroupSchema>) {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Not signed in",
            description: "You must be signed in to create a group.",
        })
        return;
    }
    
    const groupsCollectionRef = collection(firestore, 'learning_groups');
    
    try {
        await addDoc(groupsCollectionRef, {
            ...values,
            memberIds: [user.uid],
            groupSizeLimit: 25,
            createdAt: serverTimestamp(),
        })

        toast({
            title: 'Group Created!',
            description: `${values.name} has been successfully created.`,
        })
        router.push('/groups');

    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message || "Could not create group.",
        });
    }
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8">
        Create a New Group
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
          <CardDescription>
            Fill out the information below to create your new learning group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React Rangers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What is the main goal of this group?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primarySkill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Technology</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a technology focus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technologies.map(tech => <SelectItem key={tech} value={tech}>{tech.charAt(0).toUpperCase() + tech.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will be the main topic for your group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Commitment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expected time commitment" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="part-time">Part-time (6-12 hours/week)</SelectItem>
                        <SelectItem value="full-time">Full-time (12+ hours/week)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit">Create Group</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

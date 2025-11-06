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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useDoc, useFirebase, useMemoFirebase, setDocumentNonBlocking } from '@/firebase'
import { doc } from 'firebase/firestore'
import { useEffect } from 'react'

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.'}),
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).optional(),
  github: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
})

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, firestore } = useFirebase()
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'avatar-1')

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, 'users', user.uid, 'profile', 'data')
  }, [user, firestore])

  const { data: userProfile, isLoading } = useDoc(userProfileRef)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      username: '',
      bio: '',
      github: '',
      linkedin: '',
    },
  })
  
  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.displayName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        github: userProfile.socialLinks?.find((l: string) => l.includes('github')) || '',
        linkedin: userProfile.socialLinks?.find((l: string) => l.includes('linkedin')) || '',
      })
    }
  }, [userProfile, form])

  function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!userProfileRef || !user) return
    const socialLinks = [];
    if (values.github) socialLinks.push(values.github);
    if (values.linkedin) socialLinks.push(values.linkedin);

    const updatedProfile = {
        userId: user.uid,
        username: values.username,
        displayName: values.displayName,
        bio: values.bio || '',
        socialLinks,
    }
    
    setDocumentNonBlocking(userProfileRef, updatedProfile, { merge: true })

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    })
  }
  
  if (isLoading) {
    return <p>Loading profile...</p>
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8">
        My Profile
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            This information will be used to match you with a learning group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile?.profilePictureUrl || userAvatar?.imageUrl} />
                  <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline">Change Photo</Button>
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="john_doe" {...field} disabled />
                    </FormControl>
                     <FormDescription>
                      Username cannot be changed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/your-username" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/your-username" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth, useFirestore, useUser, errorEmitter } from '@/firebase'
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, getDoc, writeBatch } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FirestorePermissionError } from '@/firebase/errors'

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.'}).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

export default function SignupPage() {
  const { toast } = useToast()
  const auth = useAuth()
  const firestore = useFirestore()
  const { user, isUserLoading } = useUser();
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
    },
  })

  // Redirect if user is already logged in
  if (!isUserLoading && user) {
    router.push('/dashboard');
    return null; // Render nothing while redirecting
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !auth) return;
    setIsSubmitting(true);

    const usernameRef = doc(firestore, 'usernames', values.username);
    const usernameDoc = await getDoc(usernameRef);

    if (usernameDoc.exists()) {
      form.setError('username', { type: 'manual', message: 'This username is already taken.' });
      setIsSubmitting(false);
      return;
    }

    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userProfileRef = doc(firestore, 'users', user.uid, 'profile', 'data');
        const usernameDocRef = doc(firestore, 'usernames', values.username);

        const userProfileData = {
          userId: user.uid,
          username: values.username,
          displayName: values.fullName,
          profilePictureUrl: '',
          socialLinks: [],
          bio: '',
          portfolioUrl: '',
          projects: [],
        };
        
        const batch = writeBatch(firestore);
        batch.set(userProfileRef, userProfileData);
        batch.set(usernameDocRef, { userId: user.uid });
        
        await batch.commit();

        router.push('/dashboard');
      })
      .catch((e: any) => {
        setIsSubmitting(false);
        if (e.code && e.code.includes('permission-denied')) {
             errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: `users/${auth.currentUser?.uid}/profile/data` ,
                operation: 'create',
                requestResourceData: {
                  userId: auth.currentUser?.uid,
                  username: values.username,
                  displayName: values.fullName,
                },
              })
            )
        } else {
           toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message || "Could not create account.",
          });
        }
      });
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Join w3Develops and find your coding crew today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
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
                    <Input placeholder="john_doe" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

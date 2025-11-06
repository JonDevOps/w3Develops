'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from '@/firebase/provider';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useToast } from "@/components/ui/use-toast";
import { doc, collection, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';
import { UserProfile } from '@/lib/types';
import { deleteUser } from 'firebase/auth';

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Redirect if user is already logged in
    if (!isUserLoading && user) {
      router.push('/account');
    }
  }, [user, isUserLoading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out all fields.",
      });
      return;
    }

    let newUser;
    try {
      // 1. Create user with email and password first
      const userCredential = await initiateEmailSignUp(auth, email, password);
      newUser = userCredential.user;
      const usernameLower = username.toLowerCase();
      
      // 2. Use a transaction to guarantee username uniqueness and create the profile
      await runTransaction(firestore, async (transaction) => {
        const userDocRef = doc(firestore, "users", newUser.uid);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("username_lowercase", "==", usernameLower));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // This will abort the transaction and be caught by the outer catch block
          throw new Error("This username is already in use. Please choose another one.");
        }

        // If username is unique, create the user profile document
        const userData: UserProfile = {
          id: newUser.uid,
          email: email,
          username: username,
          username_lowercase: usernameLower,
          profilePictureUrl: '',
          bio: '',
          socialLinks: {},
          skills: [],
        };
        transaction.set(userDocRef, userData);
      });
        // If transaction is successful, the useEffect will handle the redirect.
    } catch (error: any) {
      // If any part of the process fails, attempt to clean up the auth user
      if (newUser) {
        try {
          await deleteUser(newUser);
        } catch (deleteError: any) {
            // This is a critical state - user auth exists but profile creation failed
            // and cleanup failed. The user needs to know.
            toast({
              variant: "destructive",
              title: "Critical Sign Up Error",
              description: "Your account could not be fully created, and cleanup failed. Please contact support.",
              duration: 10000,
            });
            return; // Stop further execution
        }
      }

      let description = "An unknown error occurred during sign up.";
      // Handle both auth errors and transaction errors
      if (error.message === "This username is already in use. Please choose another one.") {
        description = error.message;
      } else {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = "This email address is already in use by another account.";
            break;
          case 'auth/weak-password':
            description = "The password is too weak. Please use at least 6 characters.";
            break;
          case 'auth/invalid-email':
            description = "The email address is not valid.";
            break;
        }
      }
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: description,
      });
    }
  };
  
  if (isUserLoading || user) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join our community of developers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="adalovelace"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>              <Input 
                id="password" 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Already have an account?&nbsp;
          <Link href="/login" className="underline">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

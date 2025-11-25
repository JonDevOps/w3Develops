'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useToast } from "@/components/ui/use-toast";
import { doc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';
import { UserProfile } from '@/lib/types';
import { deleteUser, UserCredential, createUserWithEmailAndPassword } from 'firebase/auth';

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedUsername = useDebounce(username, 500);

  const checkUsername = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsUsernameAvailable(true); // Don't show error for short usernames
      return;
    }
    setIsUsernameChecking(true);
    const usernameLower = usernameToCheck.toLowerCase();
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("username_lowercase", "==", usernameLower));
    const querySnapshot = await getDocs(q);
    setIsUsernameAvailable(querySnapshot.empty);
    setIsUsernameChecking(false);
  }, [firestore]);

  useEffect(() => {
    if (debouncedUsername) {
      checkUsername(debouncedUsername);
    }
  }, [debouncedUsername, checkUsername]);


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
    
    if (!isUsernameAvailable) {
        toast({
            variant: "destructive",
            title: "Username taken",
            description: "Please choose another username.",
        });
        return;
    }

    setIsSubmitting(true);
    let userCredential: UserCredential | null = null;
    
    try {
      const usernameLower = username.toLowerCase();
      
      // We already checked, but as a final safeguard before creation
      const q = query(collection(firestore, 'users'), where("username_lowercase", "==", usernameLower));
      const querySnapshot = await getDocs(q);
      if(!querySnapshot.empty) {
        setIsUsernameAvailable(false);
        throw new Error("This username is already in use. Please choose another one.");
      }

      // 2. If username is unique, create user with email and password
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // 3. Create the user profile document
      const userDocRef = doc(firestore, "users", newUser.uid);
      const userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'> & { createdAt: any, lastLoginAt: any } = {
        email: email,
        username: username,
        username_lowercase: usernameLower,
        profilePictureUrl: '',
        bio: '',
        socialLinks: {},
        skills: [],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        followers: [],
        following: [],
        followInfoPrivate: false,
      };
      await setDoc(userDocRef, userData);
        
      // If successful, onAuthStateChanged in the provider will handle the redirect.
    } catch (error: any) {
      // If any part of the process fails AFTER user creation, attempt to clean up the auth user
      if (userCredential) {
        try {
          await deleteUser(userCredential.user);
        } catch (deleteError: any) {
            toast({
              variant: "destructive",
              title: "Critical Sign Up Error",
              description: "Your account could not be fully created, and automatic cleanup failed. Please contact support.",
              duration: 10000,
            });
            setIsSubmitting(false);
            return; 
        }
      }

      let description = "An unknown error occurred during sign up.";
      // Handle custom error and Firebase auth errors
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
    } finally {
        setIsSubmitting(false);
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
                disabled={isSubmitting}
                className={!isUsernameAvailable ? 'border-destructive' : ''}
              />
              {isUsernameChecking && <p className="text-xs text-muted-foreground">Checking...</p>}
              {!isUsernameAvailable && !isUsernameChecking && username.length > 2 && (
                  <p className="text-xs text-destructive">Username is already taken.</p>
              )}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !isUsernameAvailable}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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


'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function validatePassword(password: string) {
    const errors: string[] = [];
    if (password.length < 6) {
        errors.push("be at least 6 characters long");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("contain an uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("contain a lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("contain a number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push("contain a special character");
    }
    
    if (errors.length > 0) {
        return `Password must ${errors.join(', ')}.`;
    }
    return null;
}


function SignupPageContent() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

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
      setIsUsernameAvailable(true);
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
    if (!isUserLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, redirectUrl]);

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

    const passwordError = validatePassword(password);
    if (passwordError) {
        toast({
            variant: "destructive",
            title: "Weak Password",
            description: passwordError,
            duration: 7000,
        });
        return;
    }

    setIsSubmitting(true);
    let userCredential: UserCredential | null = null;
    
    try {
      const usernameLower = username.toLowerCase();
      
      const q = query(collection(firestore, 'users'), where("username_lowercase", "==", usernameLower));
      const querySnapshot = await getDocs(q);
      if(!querySnapshot.empty) {
        setIsUsernameAvailable(false);
        throw new Error("This username is already in use. Please choose another one.");
      }

      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      const userDocRef = doc(firestore, "users", newUser.uid);
      const userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt' > & { createdAt: any, lastLoginAt: any } = {
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
        createdStudyGroupIds: [],
        joinedStudyGroupIds: [],
        createdCohortIds: [],
        joinedCohortIds: [],
        isSubscribedToNewsletter: false,
      };
      await setDoc(userDocRef, userData);
        
    } catch (error: any) {
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
    <div className="p-4 md:p-10">
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
                  autoComplete="username"
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
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                    Must contain an uppercase letter, a lowercase letter, a number, a special character, and be at least 6 characters long.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !isUsernameAvailable}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            Already have an account?&nbsp;
            <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="underline">
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SignupPageContent />
    </Suspense>
  )
}

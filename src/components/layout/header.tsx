'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useUser, useAuth, useFirestore, useDoc } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from './search-bar';
import { useRouter } from 'next/navigation';
import { doc, DocumentReference } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import NotificationBell from '@/components/notifications/NotificationBell';
import Sidebar from './sidebar';


export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
        await auth.signOut();
        router.push('/');
    } catch (error) {
        console.error("Error signing out: ", error);
        // Optionally, show a toast message to the user
    }
  };

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isUserLoading || isProfileLoading;
  
  const username = userProfile?.username || user?.email;
  const avatarFallback = userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Sidebar />
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Image src="/logo.png" alt="w3Develops Logo" width={32} height={32} className="rounded-full" />
            w3Develops
          </Link>
        </div>

        <div className="flex-1 md:flex justify-center px-4 lg:px-20">
          <div className="w-full max-w-lg">
            <SearchBar 
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.profilePictureUrl || user.photoURL || ''} alt={userProfile?.username || ''} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>

                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{username}</p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/account">Home</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/users/${user.uid}`}>Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
          ) : (
              <div className="flex items-center gap-2">
              <Button asChild size="sm">
                  <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="hidden sm:flex">
                  <Link href="/signup">Sign Up</Link>
              </Button>
              </div>
          )}
        </div>
      </div>
    </header>
  );
}

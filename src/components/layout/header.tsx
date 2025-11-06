'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search, Menu, ArrowLeft } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
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


export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileSearchVisible) {
      // Use a short timeout to ensure the input is rendered and visible before focusing
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isMobileSearchVisible]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobileSearchVisible &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsMobileSearchVisible(false);
      }
    }

    if (isMobileSearchVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSearchVisible]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/');
    });
  };

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const logoHref = user ? '/account' : '/';
  const isLoading = isUserLoading || isProfileLoading;
  
  const username = userProfile?.username || user?.email;
  const avatarFallback = userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Mobile Search View */}
        <div ref={mobileSearchContainerRef} className={`flex items-center gap-2 md:hidden ${isMobileSearchVisible ? 'w-full' : 'hidden'}`}>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchVisible(false)}>
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="w-full">
                <SearchBar 
                  ref={searchInputRef}
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                />
            </div>
        </div>

        {/* Default Header View */}
        <div className={`flex items-center gap-4 ${isMobileSearchVisible ? 'hidden' : 'flex'} w-full`}>
          <div className="flex items-center gap-4 flex-1">
            <Link href={logoHref} className="flex items-center gap-2 flex-shrink-0">
              <Image src="/logo.jpg" alt="w3Develops Logo" width={32} height={32} className="rounded-full" />
            </Link>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchVisible(true)}>
                  <Search className="h-6 w-6" />
                  <span className="sr-only">Open Search</span>
              </Button>
            </div>
            <div className="hidden md:block w-full max-w-[15rem]">
              <SearchBar 
                query={searchQuery}
                onQueryChange={setSearchQuery}
              />
            </div>
          </div>
        
          <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/groups" className="text-muted-foreground transition-colors hover:text-foreground">
                      Study Groups
                  </Link>                  <Link href="/cohorts" className="text-muted-foreground transition-colors hover:text-foreground">
                      Build Cohorts
                  </Link>
              </nav>
              
              <div className="md:hidden">
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href="/groups">Study Groups</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/cohorts">Build Cohorts</Link></DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              {isLoading ? (
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              ) : user ? (
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
                      <DropdownMenuItem asChild><Link href="/account">Dashboard</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                      Log out
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
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
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search, Menu } from 'lucide-react';
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
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

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/');
    });
  };

  const userDocRef = useMemoFirebase(() => {
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
        <div className="flex items-center gap-4">
          <Link href={logoHref} className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo.jpg" alt="w3Develops Logo" width={32} height={32} className="rounded-full" />
          </Link>
          <div className="hidden md:block">
             <SearchBar />
          </div>
          <div className="md:hidden">
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                  <Search className="h-6 w-6" />
                  <span className="sr-only">Toggle Search</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <div className="p-2">
                    <SearchBar />
                  </div>
              </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/groups" className="text-muted-foreground transition-colors hover:text-foreground">
                    Study Groups
                </Link>
                <Link href="/cohorts" className="text-muted-foreground transition-colors hover:text-foreground">
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
                    <DropdownMenuItem asChild><Link href="/profile/edit">Edit Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/users/${user.uid}`}>View Profile</Link></DropdownMenuItem>
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
    </header>
  );
}

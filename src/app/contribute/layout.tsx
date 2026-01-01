
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search, Github } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

function ContributeHeader() {
  return (
    <header className="bg-[#0a0a23] border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <Link href="/contribute/intro" className="flex items-center gap-2 font-bold text-lg text-white">
            w3Develops(🔥)
          </Link>
        </div>
        <div className="flex-1 max-w-lg ml-8 hidden md:block">
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                    type="search"
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-[#3b3b4f] text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border border-gray-500 rounded-sm px-1.5 py-0.5">Ctrl K</div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500">
                <Github />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500">
                <FaXTwitter size={24} />
            </a>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#3b3b4f] border-gray-600 text-white hover:bg-gray-700 hover:text-white">
                    Menu
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#3b3b4f] border-gray-600 text-white" align="end">
                <DropdownMenuItem asChild><Link href="#">Sign In</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


export default function ContributeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#0a0a23] text-white min-h-screen">
      <ContributeHeader />
      <main>{children}</main>
    </div>
  )
}

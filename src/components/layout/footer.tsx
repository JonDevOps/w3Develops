'use client';

import { Github, Twitter, Youtube, Facebook } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">

          {/* Social Links Group */}
          <div className="flex justify-center gap-6 flex-wrap">
              <a href="https://github.com/w3develops/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github />
              </a>
              <a href="https://twitter.com/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter />
              </a>
              <a href="https://www.youtube.com/w3Develops?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Youtube />
              </a>
               <a href="https://www.facebook.com/groups/w3develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook />
              </a>
              <a href="https://discord.gg/ckQ52gA" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <FaDiscord size={24} />
              </a>
          </div>

          {/* Slogan and Links */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Made with ❤️ for a better web</p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground">Terms of Use</Link>
                <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
                <Link href="/donate" className="hover:text-foreground">Donate</Link>
                <Link href="/merch" className="hover:text-foreground">Merch</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

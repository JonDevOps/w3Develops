'use client';

import Link from "next/link";
import { Github, Twitter, Youtube, Facebook, Linkedin, Podcast, Instagram } from 'lucide-react';
import { FaDiscord, FaMedium } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-card border-t py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          
          <div className="flex justify-center md:justify-start gap-4">
              <a href="https://github.com/w3develops/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github />
              </a>
              <a href="https://twitter.com/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter />
              </a>
              <a href="https://www.youtube.com/w3Develops?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Youtube />
              </a>
              <a href="https://discord.gg/WphGvTT" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <FaDiscord size={24} />
              </a>
          </div>

          <div className="text-sm text-muted-foreground text-center order-first md:order-none">
            <p>Made with ❤️ for a better web</p>
          </div>
          
          <div className="flex justify-center md:justify-end gap-4">
             <a href="https://www.instagram.com/w3develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram />
              </a>
              <a href="https://medium.com/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <FaMedium size={24} />
              </a>
              <a href="https://www.linkedin.com/company/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin />
              </a>
              <a href="https://www.youtube.com/watch?v=VLZhlngst2E&list=PLTwiqKOPckq-z5E-LUpMXpcv_GWXE2k4F" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Podcast />
              </a>
              <a href="https://www.facebook.com/groups/w3develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook />
              </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

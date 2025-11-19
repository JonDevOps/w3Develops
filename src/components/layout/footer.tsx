'use client';

import { Github, Twitter, Youtube, Facebook, Instagram, Linkedin, Rss } from 'lucide-react';
import { FaDiscord, FaMedium, FaReddit, FaPodcast } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* Social Icons (Mobile - grouped and centered) */}
          <div className="flex flex-col items-center md:hidden gap-4">
            <div className="flex justify-center gap-5">
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
             <div className="flex justify-center gap-5">
                <a href="https://www.instagram.com/w3develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Instagram />
                </a>
                <a href="https://medium.com/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <FaMedium size={24} />
                </a>
                <a href="https://www.linkedin.com/company/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Linkedin />
                </a>
                <a href="https://www.reddit.com/r/w3Develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <FaReddit size={24} />
                </a>
                <a href="https://www.youtube.com/watch?v=VLZhlngst2E&list=PLTwiqKOPckq-z5E-LUpMXpcv_GWXE2k4F" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <FaPodcast size={24} />
                </a>
            </div>
          </div>

          {/* Left Column (Desktop) */}
          <div className="hidden md:flex justify-start gap-5">
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

          {/* Center Column */}
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

          {/* Right Column (Desktop) */}
          <div className="hidden md:flex justify-end gap-5">
             <a href="https://www.instagram.com/w3develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Instagram />
            </a>
            <a href="https://medium.com/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <FaMedium size={24} />
            </a>
            <a href="https://www.linkedin.com/company/w3develops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Linkedin />
            </a>
            <a href="https://www.reddit.com/r/w3Develops/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <FaReddit size={24} />
            </a>
            <a href="https://www.youtube.com/watch?v=VLZhlngst2E&list=PLTwiqKOPckq-z5E-LUpMXpcv_GWXE2k4F" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
               <FaPodcast size={24} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Github, Twitter, Youtube, Facebook } from 'lucide-react';

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
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Made with ❤️ for a better web</p>
            <div className="flex justify-center gap-4 mt-2">
                <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground">Terms of Use</Link>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end gap-4">
             <a href="https://discord.gg/WphGvTT" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                {/* Discord Icon was here, removed due to missing package */}
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


import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Toaster } from "@/components/ui/toaster";


const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: "w3Develops",
  description: "A community for developers to learn, build, and connect.",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          lexend.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="flex min-h-screen w-full flex-col">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
              {children}
            </main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

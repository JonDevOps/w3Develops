import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
        Welcome to w3Develops
      </h1>
      <p className="max-w-[700px] text-lg text-muted-foreground mb-8">
        The platform to connect with developers, form study groups, and build amazing projects together.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

    
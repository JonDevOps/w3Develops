
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Hello World
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Your Next.js application is running correctly.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button>Get started</Button>
          <Button variant="outline">Learn more &rarr;</Button>
        </div>
      </div>
    </main>
  );
}

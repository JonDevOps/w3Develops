
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Hello World
        </h1>

        <p className="mt-3 text-2xl">
          Your Next.js app is running correctly.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Button asChild>
            <Link href="/login">
              Go to Login
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

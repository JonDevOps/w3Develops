
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Code, Users, BookOpen, ArrowRight, GitBranch, Trophy, Hammer } from "lucide-react";
import placeholderImages from './lib/placeholder-images.json';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';

const features = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Study Groups",
    description: "Find your tribe. Learn and grow with developers who share your interests.",
    link: "/groups"
  },
  {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: "Group Projects",
    description: "Gain real-world experience by building applications in a team setting.",
    link: "/cohorts"
  },
  {
    icon: <Trophy className="h-10 w-10 text-primary" />,
    title: "Competitions",
    description: "Test your skills and challenge yourself in community coding competitions.",
    link: "/competitions"
  },
  {
    icon: <Hammer className="h-10 w-10 text-primary" />,
    title: "Hackathons",
    description: "Join hackathons to innovate, build amazing things, and win prizes.",
    link: "/hackathons"
  },
];


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { hero, whyJoin } = placeholderImages;

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/account');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-[70vh] flex items-center justify-center text-center text-white py-20 px-4">
            <Image
                src={hero.src}
                alt="Diverse group of developers collaborating on a project"
                fill
                className="object-cover -z-10 brightness-[.4]"
                data-ai-hint={hero.hint}
                priority
            />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-headline tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Learn | Build | Get the Job
                </h1>
                <p className="mt-6 text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                    w3Develops is a global community for developers to team up, build projects, and accelerate their careers—together.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/signup">Join For Free <ArrowRight className="h-5 w-5" /></Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                        <Link href="/groups">Explore Groups</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* What we offer Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">What We Offer</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A World of Collaboration</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From casual study sessions to intense hackathons, find the perfect space to grow.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <Link href={feature.link} key={feature.title}>
                  <Card className="h-full hover:shadow-lg hover:-translate-y-2 transition-transform duration-300">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                      {feature.icon}
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
            <div className="container grid items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-6">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Why Join Us?</div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Escape Tutorial Hell, Enter Collaborative Reality.</h2>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Watching videos is one thing. Building real software with a team is another. At w3Develops, you learn by doing, supported by a community that wants you to succeed.
                    </p>
                    <ul className="grid gap-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                            <span><span className="font-semibold">Gain Practical Experience:</span> Build a portfolio of real-world projects that employers will notice.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                            <span><span className="font-semibold">Learn from Peers:</span> Work in teams, review code, and absorb knowledge from fellow developers.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                            <span><span className="font-semibold">Expand Your Network:</span> Connect with mentors and peers who can become lifelong colleagues and friends.</span>
                        </li>
                    </ul>
                </div>
                <div className="flex justify-center">
                   <Image
                      src={whyJoin.src}
                      width={600}
                      height={400}
                      alt="Two developers high-fiving over a successful project"
                      className="rounded-xl object-cover shadow-2xl"
                      data-ai-hint={whyJoin.hint}
                    />
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

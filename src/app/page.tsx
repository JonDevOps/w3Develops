
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Code, Users, BookOpen } from "lucide-react";
import placeholderImages from './lib/placeholder-images.json';

export default function Home() {
  const { hero, tutors } = placeholderImages;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
            <Image
                src={hero.src}
                alt="Collaborative coding session"
                fill
                className="object-cover -z-10 brightness-50"
                data-ai-hint={hero.hint}
                priority
            />
            <div className="container px-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                        Learn, Build, and Connect with Developers
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-primary/90">
                        w3Develops is a global community dedicated to helping you grow as a developer through collaboration, mentorship, and real-world projects.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button asChild size="lg">
                            <Link href="/signup">Join the Community</Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg">
                            <Link href="/groups">Explore Groups</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Three simple steps to start your journey with w3Develops.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
              <div className="grid gap-1 text-center p-6 rounded-lg">
                <Users className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">1. Join a Group</h3>
                <p className="text-sm text-muted-foreground">Find a study group or a project cohort that matches your interests and skill level.</p>
              </div>
              <div className="grid gap-1 text-center p-6 rounded-lg">
                <Code className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">2. Start Building</h3>
                <p className="text-sm text-muted-foreground">Collaborate with your peers on real-world projects, learn new technologies, and build your portfolio.</p>
              </div>
              <div className="grid gap-1 text-center p-6 rounded-lg">
                <BookOpen className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">3. Grow Together</h3>
                <p className="text-sm text-muted-foreground">Get mentorship, share your knowledge, and grow your network within our supportive community.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tutors Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Featured Tutors & Mentors</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connect with experienced developers from our community who are ready to help you learn and grow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-4">
              {tutors.map((tutor) => (
                <Card key={tutor.id} className="text-center">
                  <CardContent className="p-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
                      <AvatarImage src={tutor.image.src} alt={tutor.name} data-ai-hint={tutor.image.hint} />
                      <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold">{tutor.name}</h3>
                    <p className="text-sm text-muted-foreground">{tutor.expertise}</p>
                     <Button variant="secondary" className="mt-4" asChild>
                        <Link href={`/users/${tutor.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild size="lg">
                    <Link href="/tutor">Find a Tutor</Link>
                </Button>
             </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">A Better Way to Learn and Grow as a Developer</h2>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Say goodbye to tutorial hell. At w3Develops, you learn by doing, with the support of a vibrant community.
                    </p>
                    <ul className="grid gap-4">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                            <span><span className="font-semibold">Project-Based Learning:</span> Build real applications and gain practical experience.</span>
                        </li>
                         <li className="flex items-start gap-2">
                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                            <span><span className="font-semibold">Collaborative Environment:</span> Work in teams, review code, and learn from your peers.</span>
                        </li>
                         <li className="flex items-start gap-2">
                            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                            <span><span className="font-semibold">Mentorship Opportunities:</span> Get guidance from experienced developers and accelerate your growth.</span>
                        </li>
                    </ul>
                </div>
                <div className="flex justify-center">
                   <Image
                      src="https://picsum.photos/seed/2/600/400"
                      width={600}
                      height={400}
                      alt="A developer working on code"
                      className="rounded-xl object-cover"
                      data-ai-hint="developer code"
                    />
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}

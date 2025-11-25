'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

// Mock data - in a real app, this would come from an API
const featuredTutors = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    skills: ["React", "Node.js", "TypeScript"],
    rate: 50
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    skills: ["Python", "Django", "Machine Learning"],
    rate: 65
  },
  {
    id: 3,
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    skills: ["UX/UI Design", "Figma", "Webflow"],
    rate: 55
  }
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center bg-card p-10 rounded-lg shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-4">
          Unlock Your Potential with Expert Tutors
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Find the perfect tutor to help you master new skills, from programming and design to marketing and beyond.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/groups">Browse Tutors</Link>
          </Button>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section>
        <h2 className="text-3xl font-bold text-center font-headline mb-8">Featured Tutors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTutors.map((tutor) => (
            <Card key={tutor.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                  <AvatarImage src={tutor.avatar} alt={tutor.name} />
                  <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-headline mb-1">{tutor.name}</CardTitle>
                <p className="text-muted-foreground mb-4 font-semibold">${tutor.rate}/hr</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {tutor.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
                <Button className="w-full">View Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

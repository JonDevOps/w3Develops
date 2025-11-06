'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  BrainCircuit,
  Trophy,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { useUser } from '@/firebase'
import { useRouter } from 'next/navigation'

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1')

const features = [
  {
    icon: <Users className="h-10 w-10 text-primary-foreground" />,
    title: 'Collaborative Learning',
    description:
      'Join forces with like-minded developers. Share knowledge, tackle challenges together, and grow as a team.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary-foreground" />,
    title: 'Skill-Based Matching',
    description:
      'Our algorithm connects you with peers based on your skills and learning pace, ensuring a productive and balanced group dynamic.',
  },
  {
    icon: <Trophy className="h-10 w-10 text-primary-foreground" />,
    title: 'Achieve Your Goals',
    description:
      'Stay motivated and accountable. With your dedicated group, you are more likely to reach your development goals faster.',
  },
]

const steps = [
  {
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your skills and learning preferences.',
  },
  {
    title: 'Get Matched',
    description: 'Our system automatically places you in a group that fits you.',
  },
  {
    title: 'Start Collaborating',
    description: 'Connect with your new team and start building something amazing.',
  },
]

export default function Home() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()

  if (!isUserLoading && user) {
    router.push('/dashboard')
    return null; // Render nothing while redirecting
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <section className="relative py-20 md:py-32 bg-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Coding Crew.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Stop coding alone. Join w3Develops to connect with a small, dedicated
            group of developers who share your goals and pace.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Join a Group <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/groups">See All Study Groups</Link>
            </Button>
          </div>
        </div>
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover -z-10 opacity-10"
          />
        )}
      </section>

      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Why w3Develops?
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-foreground/70">
              Everything you need to accelerate your learning and build your network.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-2 hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 bg-primary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Get Started in 3 Simple Steps
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-foreground/70">
              Joining a group has never been easier.
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-background border-2 border-primary text-primary font-bold text-2xl mb-6">
                  {index + 1}
                </div>
                <h3 className="font-headline text-xl font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 text-foreground/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            Ready to Supercharge Your Skills?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Your new learning group is waiting for you. Take the first step
            towards better collaboration and faster growth.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/signup">
                Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

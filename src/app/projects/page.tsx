'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, PlusCircle } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Build Projects
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
          This section is coming soon! This is where you will be able to find and collaborate on projects with other developers.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

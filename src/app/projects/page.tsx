'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, Query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { Github } from 'lucide-react';

export default function ProjectsPage() {
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() => {
    return collection(firestore, 'projects') as Query;
  }, [firestore]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <div>
          <h1 className="text-3xl font-headline">Community Projects</h1>
          <p className="text-muted-foreground">Explore projects built by the w3Develops community.</p>
        </div>
        <Button asChild>
          <Link href="/projects/create">Add Your Project</Link>
        </Button>
      </div>

      {isLoading && <p>Loading projects...</p>}
      
      {!isLoading && projects && projects.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Projects Yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to add a project!</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground h-20 overflow-hidden">{project.description}</p>
              {project.githubUrl && (
                 <Button variant="outline" asChild size="sm">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        View on GitHub
                    </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

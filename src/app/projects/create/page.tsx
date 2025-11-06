'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { useToast } from "@/components/ui/use-toast";
import { collection } from 'firebase/firestore';

export default function CreateProjectPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to add a project." });
        return;
    }
    if (!name) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please provide a project name." });
      return;
    }
    
    const projectsCollection = collection(firestore, "projects");
    const newProject = {
        name,
        description,
        githubUrl,
        ownerId: user.uid,
    };
    
    addDocumentNonBlocking(projectsCollection, newProject)
      .then(() => {
        toast({ title: "Project Added!", description: `${name} has been added to the showcase.` });
        router.push('/projects');
      })
      .catch((e) => {
        console.error(e);
        toast({ variant: "destructive", title: "Something went wrong", description: "Could not add the project." });
      });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Project</CardTitle>
          <CardDescription>
            Showcase a project you've built.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" placeholder="My Awesome App" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" placeholder="https://github.com/user/repo" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="A brief description of your project." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit">Add Project</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

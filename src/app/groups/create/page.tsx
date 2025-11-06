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

export default function CreateGroupPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a group." });
        return;
    }
    if (!name || !skill) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out the group name and skill." });
      return;
    }
    
    const groupsCollection = collection(firestore, "studyGroups");
    const newGroup = {
        name,
        skill,
        description,
        memberIds: [user.uid], // Creator is the first member
    };
    
    addDocumentNonBlocking(groupsCollection, newGroup)
      .then(() => {
        toast({ title: "Group Created!", description: `${name} has been created successfully.` });
        router.push('/groups');
      })
      .catch((e) => {
        // Errors are handled globally by FirebaseErrorListener, but we can still toast a generic message
        console.error(e);
        toast({ variant: "destructive", title: "Something went wrong", description: "Could not create the group." });
      });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Study Group</CardTitle>
          <CardDescription>
            Start a new group to collaborate with others on a specific skill.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGroup} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" placeholder="e.g., React Rangers" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skill">Primary Skill</Label>
              <Input id="skill" placeholder="e.g., Next.js, Firebase, UI/UX" value={skill} onChange={(e) => setSkill(e.target.value)} required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="What's the main goal of this group?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit">Create Group</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

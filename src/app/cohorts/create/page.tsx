'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore } from '@/firebase';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { collection, serverTimestamp, query, where, getDocs, addDoc, limit } from 'firebase/firestore';
import { topics, commitmentLevels, ONE_WEEK_IN_MS } from '@/lib/constants';


export default function CreateCohortPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [commitment, setCommitment] = useState('part-time');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a cohort." });
        router.push('/login');
        return;
    }
    
    const finalTopic = topic === 'Other' ? customTopic : topic;
    const finalCommitment = commitmentLevels[commitment as keyof typeof commitmentLevels];

    if (!name || !finalTopic || !commitment) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required fields." });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const oneWeekAgo = new Date(Date.now() - ONE_WEEK_IN_MS);
      // Check for existing, non-full, recent cohorts
      const existingQuery = query(
        collection(firestore, 'cohorts'),
        where('topic', '==', finalTopic),
        where('commitment', '==', finalCommitment),
        where('createdAt', '>', serverTimestamp.fromMillis(oneWeekAgo.getTime())),
        limit(1)
      );

      const existingSnapshot = await getDocs(existingQuery);
      let foundSuitable = false;
      existingSnapshot.forEach(doc => {
          const cohort = doc.data();
          if (cohort.memberIds.length < 25) {
              foundSuitable = true;
          }
      });

      if (foundSuitable) {
          toast({
              variant: "destructive",
              title: "Similar Cohort Exists",
              description: "A similar cohort that is not full was recently created. Please join that one instead!",
          });
          router.push('/cohorts');
          return;
      }

      // If no suitable cohort found, create a new one
      const cohortsRef = collection(firestore, 'cohorts');
      await addDoc(cohortsRef, {
        name: name,
        name_lowercase: name.toLowerCase(),
        topic: finalTopic,
        commitment: finalCommitment,
        githubUrl: githubUrl,
        description: description || `A new cohort for ${finalTopic}`,
        memberIds: [user.uid],
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success!", description: "Your new build cohort has been created." });
      router.push('/cohorts');
    } catch (error: any) {
        toast({ variant: "destructive", title: "Could Not Create Cohort", description: error.message || "An unexpected error occurred." });
    }

    setIsSubmitting(false);
  };

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a Build Cohort</CardTitle>
          <CardDescription>
            Start a new cohort to build a project with other developers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCohort} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Cohort Name</Label>
              <Input id="name" placeholder="My Awesome Project Cohort" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topic">Topic / Technology</Label>
               <Select onValueChange={setTopic} value={topic} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {topic === 'Other' && (
              <div className="grid gap-2">
                <Label htmlFor="customTopic">Custom Topic</Label>
                <Input id="customTopic" placeholder="Enter your custom topic" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} required />
              </div>
            )}
            
            <div className="grid gap-2">
                <Label>Time Commitment</Label>
                <RadioGroup defaultValue="part-time" onValueChange={setCommitment} value={commitment}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="part-time" id="part-time" />
                        <Label htmlFor="part-time">{commitmentLevels['part-time']}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full-time" id="full-time" />
                        <Label htmlFor="full-time">{commitmentLevels['full-time']}</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
              <Input id="githubUrl" placeholder="https://github.com/user/repo" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" placeholder="A brief description of your project." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Cohort'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

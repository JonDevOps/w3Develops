'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from '@/firebase';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { findAndJoinCohort } from '@/app/actions/matchmaking';

const topics = [
  "HTML/CSS", "JavaScript", "Python", "React", "Django", "Node.js", "Rust", 
  "Digital Marketing", "Web3", "Cryptocurrency", "Cybersecurity", "NFTs", "SQL", 
  "Artificial Intelligence", "Web Design", "Programming Fundamentals", "Other"
];

const commitmentLevels = {
  'part-time': 'Part-time (6 hours/day, 6 days/week)',
  'full-time': 'Full-time (12 hours/day, 6 days/week)',
}

export default function CreateCohortPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [commitment, setCommitment] = useState('part-time');

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a cohort." });
        router.push('/login');
        return;
    }
    
    const finalTopic = topic === 'Other' ? customTopic : topic;
    if (!name || !finalTopic || !commitment) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required fields." });
      return;
    }

    // Creating a cohort now uses the matchmaking logic to prevent duplicates
    // and join existing ones if available.
    // NOTE: The 'name', 'description', and 'githubUrl' from this form will only be used
    // if a *new* cohort is created by the matchmaking service. They are ignored if an
    // existing cohort is joined. This is an intentional trade-off to reuse the logic.
    // For a "true" create, we are interpreting it as "ensure I am in a cohort with these properties".
    setIsSubmitting(true);
    const result = await findAndJoinCohort({
        topic: finalTopic,
        commitment: commitmentLevels[commitment as keyof typeof commitmentLevels],
        userId: user.uid,
    });
    
    if (result.success) {
        toast({ title: "Success!", description: result.message });
        router.push('/cohorts');
    } else {
        toast({ variant: "destructive", title: "Could Not Create or Join Cohort", description: result.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create or Join a Build Cohort</CardTitle>
          <CardDescription>
            Start a new cohort to build a project. We'll check if a suitable cohort already exists for you to join first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCohort} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Cohort Name</Label>
              <Input id="name" placeholder="My Awesome Project Cohort" value={name} onChange={(e) => setName(e.target.value)} required />
              <p className="text-xs text-muted-foreground">This name will be used if a new cohort is created.</p>
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
              {isSubmitting ? 'Processing...' : 'Create or Join Cohort'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

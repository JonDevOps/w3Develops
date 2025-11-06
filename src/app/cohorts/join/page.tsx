'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { findAndJoinCohort } from '@/app/actions/matchmaking';
import { useUser } from '@/firebase';

const topics = [
  "HTML/CSS", "JavaScript", "Python", "React", "Django", "Node.js", "Rust", 
  "Digital Marketing", "Web3", "Cryptocurrency", "Cybersecurity", "NFTs", "SQL", 
  "Artificial Intelligence", "Web Design", "Programming Fundamentals"
];

const commitmentLevels = {
  'part-time': 'Part-time (6 hours/day, 6 days/week)',
  'full-time': 'Full-time (12 hours/day, 6 days/week)',
}

export default function JoinCohortPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [topic, setTopic] = useState('');
  const [commitment, setCommitment] = useState('part-time');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to join a cohort." });
        router.push('/login');
        return;
    }
    if (!topic || !commitment) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please select a topic and commitment level." });
      return;
    }

    setIsSubmitting(true);

    const result = await findAndJoinCohort({
        topic,
        commitment: commitmentLevels[commitment as keyof typeof commitmentLevels],
        userId: user.uid,
    });

    if (result.success) {
        toast({ title: "Success!", description: result.message });
        router.push('/cohorts');
    } else {
        toast({ variant: "destructive", title: "Something went wrong", description: result.message });
    }
    setIsSubmitting(false);
  };
  
  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Join a Build Cohort</CardTitle>
          <CardDescription>
            Find a cohort that matches your interests and availability. We'll find a match for you or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="grid gap-6">
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Finding Cohort...' : 'Find and Join Cohort'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

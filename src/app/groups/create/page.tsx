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
import { collection, serverTimestamp, addDoc, query, where, getDocs } from 'firebase/firestore';
import { topics, commitmentLevels } from '@/lib/constants';


export default function CreateGroupPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [description, setDescription] = useState('');
  const [commitment, setCommitment] = useState('part-time');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to create a group." });
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
        // Check for existing, non-full, recent groups
        const q = query(
            collection(firestore, 'studyGroups'),
            where('topic', '==', finalTopic),
            where('commitment', '==', finalCommitment)
        );
        const existingSnapshot = await getDocs(q);
        const suitableGroups = existingSnapshot.docs.filter(doc => doc.data().memberIds.length < 25);


        if (suitableGroups.length > 0) {
            toast({
                variant: "destructive",
                title: "Similar Group Exists",
                description: "A similar group that is not full was found. Please join that one instead from the explore page!",
            });
            router.push('/groups');
            return; // Stop the creation process
        }

        // If no suitable group, proceed to create
        const groupsRef = collection(firestore, 'studyGroups');
        const newGroupRef = await addDoc(groupsRef, {
            name: name,
            name_lowercase: name.toLowerCase(),
            topic: finalTopic,
            commitment: finalCommitment,
            description: description || `A new group for ${finalTopic}`,
            memberIds: [user.uid],
            createdAt: serverTimestamp(),
        });
        toast({ title: "Success!", description: "Your new study group has been created." });
        router.push(`/groups/${newGroupRef.id}`);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Could Not Create Group", description: error.message || "An unexpected error occurred." });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a Study Group</CardTitle>
          <CardDescription>
            Start a new group to collaborate with other developers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGroup} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" placeholder="e.g., React Rangers" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic of Study</Label>
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
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" placeholder="What's the main goal of this group?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

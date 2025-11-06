'use client';
import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { topics, commitmentLevels, ONE_WEEK_IN_MS } from '@/lib/constants';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, doc, arrayUnion, runTransaction } from 'firebase/firestore';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [commitment, setCommitment] = useState('part-time');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMatchmaking = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Not Authenticated" });
      return;
    }
    const finalTopic = topic === 'Other' ? customTopic : topic;
    const finalCommitment = commitmentLevels[commitment as keyof typeof commitmentLevels];

    if (!finalTopic || !finalCommitment) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }

    setIsSubmitting(true);

    try {
      const oneWeekAgo = new Date(Date.now() - ONE_WEEK_IN_MS);
      const groupsRef = collection(firestore, 'studyGroups');
      
      const q = query(
        groupsRef,
        where('topic', '==', finalTopic),
        where('commitment', '==', finalCommitment),
        where('createdAt', '>', serverTimestamp.fromMillis(oneWeekAgo.getTime())),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let suitableGroupId: string | null = null;

      // Find the first non-full group the user isn't already in
      for (const doc of querySnapshot.docs) {
        const group = doc.data();
        if (group.memberIds.length < 25 && !group.memberIds.includes(user.uid)) {
          suitableGroupId = doc.id;
          break;
        }
      }

      if (suitableGroupId) {
        // Found a suitable group, join it using a transaction
        const groupRef = doc(firestore, 'studyGroups', suitableGroupId);
        await runTransaction(firestore, async (transaction) => {
            transaction.update(groupRef, { memberIds: arrayUnion(user.uid) });
        });
        toast({ title: "Joined Existing Group!", description: "We found a matching group for you." });
        router.push(`/groups/${suitableGroupId}`);
      } else {
        // No suitable group found, create a new one
        const newGroupRef = await addDoc(groupsRef, {
            name: `${finalTopic} Study Group`,
            name_lowercase: `${finalTopic} Study Group`.toLowerCase(),
            topic: finalTopic,
            commitment: finalCommitment,
            description: `A new group for ${finalTopic} learners with a ${finalCommitment} commitment.`,
            memberIds: [user.uid],
            createdAt: serverTimestamp(),
        });
        toast({ title: "New Group Created!", description: "We couldn't find a match, so we created a new group for you." });
        router.push(`/groups/${newGroupRef.id}`);
      }
      onClose(); // Close the modal on success
    } catch (error: any) {
      toast({ variant: "destructive", title: "Something went wrong", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Study Group</DialogTitle>
          <DialogDescription>
            Select your preferences and we'll match you with a group or create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
              <Input id="customTopic" placeholder="e.g., Svelte" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} required />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleMatchmaking} disabled={isSubmitting}>
            {isSubmitting ? 'Searching...' : 'Find or Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

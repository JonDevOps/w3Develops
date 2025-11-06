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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { topics, commitmentLevels, ONE_WEEK_IN_MS } from '@/lib/constants';
import { collection, query, where, limit, getDocs, runTransaction, addDoc, serverTimestamp, arrayUnion, doc } from 'firebase/firestore';

interface JoinCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinCohortModal({ isOpen, onClose }: JoinCohortModalProps) {
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
      const cohortsRef = collection(firestore, 'cohorts');
      
      const q = query(
        cohortsRef,
        where('topic', '==', finalTopic),
        where('commitment', '==', finalCommitment),
        where('createdAt', '>', serverTimestamp.fromMillis(oneWeekAgo.getTime())),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let suitableCohortId: string | null = null;

      for (const doc of querySnapshot.docs) {
        const cohort = doc.data();
        if (cohort.memberIds.length < 25 && !cohort.memberIds.includes(user.uid)) {
          suitableCohortId = doc.id;
          break;
        }
      }
      
      if (suitableCohortId) {
        // Found a suitable cohort, join it
        const cohortRef = doc(firestore, 'cohorts', suitableCohortId);
        await runTransaction(firestore, async (transaction) => {
            transaction.update(cohortRef, { memberIds: arrayUnion(user.uid) });
        });
        toast({ title: "Joined Existing Cohort!", description: "We found a matching cohort for you." });
        router.push(`/cohorts/${suitableCohortId}`);
      } else {
        // No suitable cohort found, create a new one
        const newCohortRef = await addDoc(cohortsRef, {
            name: `${finalTopic} Cohort`,
            name_lowercase: `${finalTopic} Cohort`.toLowerCase(),
            topic: finalTopic,
            commitment: finalCommitment,
            description: `A new cohort for ${finalTopic} learners with a ${finalCommitment} commitment.`,
            memberIds: [user.uid],
            createdAt: serverTimestamp(),
        });
        toast({ title: "New Cohort Created!", description: "We couldn't find a match, so we created a new cohort for you." });
        router.push(`/cohorts/${newCohortRef.id}`);
      }
      onClose();
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
          <DialogTitle>Join a Build Cohort</DialogTitle>
          <DialogDescription>
            Select your preferences and we'll match you with a cohort or create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            {isSubmitting ? 'Searching...' : 'Find or Create Cohort'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

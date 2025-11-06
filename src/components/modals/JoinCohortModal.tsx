'use client';
import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { topics, commitmentLevels } from '@/lib/constants';
import { collection, query, where } from 'firebase/firestore';
import { Cohort } from '@/lib/types';
import JoinCohortButton from '../JoinCohortButton';
import Link from 'next/link';
import { Input } from '../ui/input';

interface JoinCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinCohortModal({ isOpen, onClose }: JoinCohortModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [commitment, setCommitment] = useState('part-time');
  const [step, setStep] = useState(1);

  const finalTopic = topic === 'Other' ? customTopic : topic;
  const finalCommitment = commitmentLevels[commitment as keyof typeof commitmentLevels];

  const matchingCohortsQuery = useMemoFirebase(() => {
    if (step !== 2 || !finalTopic || !finalCommitment || !user) return null;
    
    return query(
      collection(firestore, 'cohorts'),
      where('topic', '==', finalTopic),
      where('commitment', '==', finalCommitment)
    );
  }, [step, finalTopic, finalCommitment, firestore, user]);

  const { data: matchingCohorts, isLoading } = useCollection<Cohort>(matchingCohortsQuery);

  const handleFindCohorts = () => {
    if (!finalTopic || !finalCommitment) return;
    setStep(2);
  };
  
  const handleClose = () => {
    setStep(1);
    setTopic('');
    setCustomTopic('');
    setCommitment('part-time');
    onClose();
  }

  const availableCohorts = useMemo(() => {
    return matchingCohorts?.filter(c => c.memberIds.length < 25 && !c.memberIds.includes(user?.uid || '')) || [];
  }, [matchingCohorts, user]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Build Cohort</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Select your preferences to find matching cohorts."
              : "Here are cohorts that match your criteria. Join one or create a new one."
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic / Technology</Label>
              <Select onValueChange={setTopic} value={topic}>
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
                <Input id="customTopic" placeholder="e.g., Svelte" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Time Commitment</Label>
              <RadioGroup defaultValue="part-time" onValueChange={setCommitment} value={commitment}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="part-time" id="part-time-modal" />
                  <Label htmlFor="part-time-modal">{commitmentLevels['part-time']}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-time" id="full-time-modal" />
                  <Label htmlFor="full-time-modal">{commitmentLevels['full-time']}</Label>
                </div>
              </RadioGroup>
            </div>
            <Button onClick={handleFindCohorts} disabled={!finalTopic || !finalCommitment}>
              Find Cohorts
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading && <p>Searching for cohorts...</p>}
            {!isLoading && availableCohorts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Matching Cohorts</h4>
                {availableCohorts.map(cohort => (
                  <div key={cohort.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-semibold">{cohort.name}</p>
                      <p className="text-sm text-muted-foreground">{cohort.memberIds.length} / 25 members</p>
                    </div>
                    <JoinCohortButton cohort={cohort} />
                  </div>
                ))}
              </div>
            )}
             {!isLoading && availableCohorts.length === 0 && (
                <div className="text-center py-4 space-y-2">
                    <p className="text-muted-foreground">No matching open cohorts found.</p>
                    <Button asChild onClick={handleClose}>
                        <Link href="/cohorts/create">Create a New Cohort</Link>
                    </Button>
                </div>
            )}
            <Button variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

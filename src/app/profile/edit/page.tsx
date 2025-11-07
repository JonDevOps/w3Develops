'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, DocumentReference } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { LoadingSkeleton } from '@/components/layout/loading-skeleton';

export default function EditProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid) as DocumentReference<UserProfile>;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setSkills(userProfile.skills || []);
      setGithub(userProfile.socialLinks?.github || '');
      setLinkedin(userProfile.socialLinks?.linkedin || '');
      setTwitter(userProfile.socialLinks?.twitter || '');
    }
  }, [userProfile]);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userDocRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
      return;
    }
    
    setIsSubmitting(true);
    
    const updatedProfileData: Partial<UserProfile> = {
      bio,
      skills,
      socialLinks: {
        github: github,
        linkedin: linkedin,
        twitter: twitter,
      },
    };

    try {
      await updateDocumentNonBlocking(userDocRef, updatedProfileData);
      toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
      router.push('/account');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not update your profile. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <LoadingSkeleton />;
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>
            Keep your profile up to date to help others connect with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} disabled />
              <p className="text-xs text-muted-foreground">Usernames cannot be changed after signup.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about yourself" value={bio} onChange={(e) => setBio(e.target.value)} disabled={isSubmitting} maxLength={250}/>
            </div>

            <div className="grid gap-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-muted-foreground/20" disabled={isSubmitting}>
                      <X className="h-3 w-3"/>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                    value={currentSkill} 
                    onChange={e => setCurrentSkill(e.target.value)} 
                    placeholder="Add a skill (e.g. React)"
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSkill();}}}
                    disabled={isSubmitting}
                    maxLength={50}
                />
                <Button type="button" variant="outline" onClick={handleAddSkill} disabled={isSubmitting}>Add</Button>
              </div>
               <p className="text-xs text-muted-foreground">Press Enter or click Add to add a skill.</p>
            </div>
            
            <div className="grid gap-4">
                <h3 className="text-lg font-medium">Social Links</h3>
                 <div className="grid gap-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input id="github" placeholder="https://github.com/your-username" value={github} onChange={(e) => setGithub(e.target.value)} disabled={isSubmitting} maxLength={150}/>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/your-profile" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} disabled={isSubmitting} maxLength={150}/>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input id="twitter" placeholder="https://twitter.com/your-handle" value={twitter} onChange={(e) => setTwitter(e.target.value)} disabled={isSubmitting} maxLength={150}/>
                </div>
            </div>


            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

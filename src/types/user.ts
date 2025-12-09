import { FieldValue } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  username?: string;
  profilePictureUrl?: string;
  // Add other user profile fields here as needed
}

export interface Cohort {
  id: string;
  name: string;
  memberIds: string[];
  // Add other cohort fields here as needed
}

export interface StudyGroup {
  id: string;
  name: string;
  memberIds: string[];
  // Add other study group fields here as needed
}

export interface User {
  email: string;
  username: string;
  username_lowercase: string;
  createdAt: FieldValue;
  lastLoginAt: FieldValue;
  profilePictureUrl: string;
  bio: string;
  socialLinks: { [key: string]: string };
  skills: string[];
  followers: string[];
  following: string[];
  followInfoPrivate: boolean;
  createdStudyGroupIds: string[];
  joinedStudyGroupIds: string[];
  createdCohortIds: string[];
  joinedCohortIds: string[];
  isSubscribedToNewsletter: boolean;
}

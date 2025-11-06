import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  name_lowercase: string;
  profilePictureUrl?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  skills?: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  name_lowercase: string;
  description?: string;
  memberIds: string[];
  topic: string;
  commitment: string;
  createdAt: Timestamp;
}

export interface Cohort {
  id: string;
  name: string;
  name_lowercase: string;
  description?: string;
  memberIds: string[];
  githubUrl?: string;
  topic: string;
  commitment: string;
  createdAt: Timestamp;
}

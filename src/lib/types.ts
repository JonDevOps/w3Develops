
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  username_lowercase: string;
  profilePictureUrl?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  skills?: string[];
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  lastLogoutAt?: Timestamp;
  followers?: string[];
  following?: string[];
  followInfoPrivate?: boolean;
  isSubscribedToNewsletter?: boolean;
  createdStudyGroupIds?: string[];
  joinedStudyGroupIds?: string[];
  createdCohortIds?: string[];
  joinedCohortIds?: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  name_lowercase: string;
  creatorId: string;
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
  creatorId: string;
  description?: string;
  memberIds: string[];
  githubUrl?: string;
  topic: string;
  commitment: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
  link?: string;
}

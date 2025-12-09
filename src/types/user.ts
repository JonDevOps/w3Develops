
import { Timestamp, FieldValue } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  username: string;
  username_lowercase: string;
  createdAt: Timestamp | FieldValue;
  lastLoginAt: Timestamp | FieldValue;
  profilePictureUrl?: string;
  bio?: string;
  socialLinks?: {
    [key: string]: string;
  };
  skills?: string[];
  followers?: string[];
  following?: string[];
  followInfoPrivate?: boolean;
  createdStudyGroupIds?: string[];
  joinedStudyGroupIds?: string[];
  createdCohortIds?: string[];
  joinedCohortIds?: string[];
  isSubscribedToNewsletter?: boolean;
}

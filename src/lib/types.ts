export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  profilePictureUrl?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  skills?: string[];
  learningPace?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  skill: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  githubUrl?: string;
}

    
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

import { PlaceHolderImages } from './placeholder-images'

export type Skill = 'Frontend' | 'Backend' | 'Full Stack' | 'DevOps' | 'UI/UX'
export type Pace = 'Casual' | 'Moderate' | 'Intense'

export type UserProfile = {
  id: string;
  userId: string;
  displayName: string;
  profilePictureUrl?: string;
  socialLinks?: string[];
  primarySkill: Skill;
  learningPace: Pace;
};

export type LearningGroup = {
  id: string;
  name: string;
  primarySkill: string;
  memberIds: string[];
  groupSizeLimit: number;
  description?: string;
};


const users: Omit<UserProfile, 'userId'>[] = [
  { id: '1', displayName: 'Alice', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl || '', primarySkill: 'Frontend', learningPace: 'Moderate' },
  { id: '2', displayName: 'Bob', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageUrl || '', primarySkill: 'Backend', learningPace: 'Intense' },
  { id: '3', displayName: 'Charlie', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageUrl || '', primarySkill: 'Frontend', learningPace: 'Moderate' },
  { id: '4', displayName: 'Diana', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-4')?.imageUrl || '', primarySkill: 'Full Stack', learningPace: 'Casual' },
  { id: '5', displayName: 'Eve', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-5')?.imageUrl || '', primarySkill: 'DevOps', learningPace: 'Intense' },
  { id: '6', displayName: 'Frank', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-6')?.imageUrl || '', primarySkill: 'Frontend', learningPace: 'Moderate' },
  { id: '7', displayName: 'Grace', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-7')?.imageUrl || '', primarySkill: 'UI/UX', learningPace: 'Casual' },
  { id: '8', displayName: 'Heidi', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-8')?.imageUrl || '', primarySkill: 'Backend', learningPace: 'Intense' },
  { id: '9', displayName: 'Ivan', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-9')?.imageUrl || '', primarySkill: 'Full Stack', learningPace: 'Moderate' },
  { id: '10', displayName: 'Judy', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-10')?.imageUrl || '', primarySkill: 'Frontend', learningPace: 'Casual' },
  { id: '11', displayName: 'Mallory', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-11')?.imageUrl || '', primarySkill: 'UI/UX', learningPace: 'Casual' },
  { id: '12', displayName: 'Niaj', profilePictureUrl: PlaceHolderImages.find(p => p.id === 'avatar-12')?.imageUrl || '', primarySkill: 'Backend', learningPace: 'Intense' },
]

const groupUsersBy = (
  users: Omit<UserProfile, 'userId'>[],
  key: 'primarySkill' | 'learningPace'
): Record<string, Omit<UserProfile, 'userId'>[]> => {
  return users.reduce((acc, user) => {
    const groupKey = `${user.primarySkill}-${user.learningPace}`
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(user)
    return acc
  }, {} as Record<string, Omit<UserProfile, 'userId'>[]>)
}

const userGroups = groupUsersBy(users, 'primarySkill')

export const groups: LearningGroup[] = Object.entries(userGroups).map(
  ([key, members], index) => {
    const [skill, pace] = key.split('-') as [Skill, Pace]
    return {
      id: `group-${index + 1}`,
      name: `${skill} - ${pace} Pace`,
      description: `A group for ${skill.toLowerCase()} developers who prefer a ${pace.toLowerCase()} learning pace.`,
      primarySkill: skill,
      memberIds: members.map(m => m.id),
      groupSizeLimit: 5,
    }
  }
)

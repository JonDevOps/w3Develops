import { PlaceHolderImages } from './placeholder-images'

export type Skill = 'Frontend' | 'Backend' | 'Full Stack' | 'DevOps' | 'UI/UX'
export type Pace = 'Casual' | 'Moderate' | 'Intense'

export type User = {
  id: string
  name: string
  avatarUrl: string
  skill: Skill
  pace: Pace
}

export type Group = {
  id: string
  name: string
  description: string
  skill: Skill
  pace: Pace
  members: User[]
}

const users: User[] = [
  { id: '1', name: 'Alice', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl || '', skill: 'Frontend', pace: 'Moderate' },
  { id: '2', name: 'Bob', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageUrl || '', skill: 'Backend', pace: 'Intense' },
  { id: '3', name: 'Charlie', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageUrl || '', skill: 'Frontend', pace: 'Moderate' },
  { id: '4', name: 'Diana', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-4')?.imageUrl || '', skill: 'Full Stack', pace: 'Casual' },
  { id: '5', name: 'Eve', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-5')?.imageUrl || '', skill: 'DevOps', pace: 'Intense' },
  { id: '6', name: 'Frank', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-6')?.imageUrl || '', skill: 'Frontend', pace: 'Moderate' },
  { id: '7', name: 'Grace', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-7')?.imageUrl || '', skill: 'UI/UX', pace: 'Casual' },
  { id: '8', name: 'Heidi', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-8')?.imageUrl || '', skill: 'Backend', pace: 'Intense' },
  { id: '9', name: 'Ivan', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-9')?.imageUrl || '', skill: 'Full Stack', pace: 'Moderate' },
  { id: '10', name: 'Judy', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-10')?.imageUrl || '', skill: 'Frontend', pace: 'Casual' },
  { id: '11', name: 'Mallory', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-11')?.imageUrl || '', skill: 'UI/UX', pace: 'Casual' },
  { id: '12', name: 'Niaj', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-12')?.imageUrl || '', skill: 'Backend', pace: 'Intense' },
]

const groupUsersBy = (
  users: User[],
  key: 'skill' | 'pace'
): Record<string, User[]> => {
  return users.reduce((acc, user) => {
    const groupKey = `${user.skill}-${user.pace}`
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(user)
    return acc
  }, {} as Record<string, User[]>)
}

const userGroups = groupUsersBy(users, 'skill')

export const groups: Group[] = Object.entries(userGroups).map(
  ([key, members], index) => {
    const [skill, pace] = key.split('-') as [Skill, Pace]
    return {
      id: `group-${index + 1}`,
      name: `${skill} - ${pace} Pace`,
      description: `A group for ${skill.toLowerCase()} developers who prefer a ${pace.toLowerCase()} learning pace.`,
      skill: skill,
      pace: pace,
      members: members,
    }
  }
)

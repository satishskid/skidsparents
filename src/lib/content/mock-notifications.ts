export interface Notification {
  id: string
  type: 'milestone' | 'promotion' | 'screening' | 'habit' | 'blog'
  title: string
  body: string
  timestamp: string
  read: boolean
  color: string
  emoji: string
  actionUrl?: string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'milestone',
    title: '12-month milestone coming up!',
    body: 'Time to check: walking, first words, pincer grasp. Track now.',
    timestamp: '2 hours ago',
    read: false,
    color: 'bg-blue-500',
    emoji: '🎯',
    actionUrl: '/dashboard/milestones',
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Dr. Sharma: 20% off Nutrition Consult',
    body: 'Limited offer from Sunshine Pediatrics — 3 days left.',
    timestamp: '5 hours ago',
    read: false,
    color: 'bg-green-500',
    emoji: '🏷️',
    actionUrl: '/services',
  },
  {
    id: '3',
    type: 'screening',
    title: 'New screening results available',
    body: 'Vision & hearing screening from Delhi Public School — tap to view.',
    timestamp: '1 day ago',
    read: false,
    color: 'bg-orange-500',
    emoji: '📋',
    actionUrl: '/dashboard/reports',
  },
  {
    id: '4',
    type: 'habit',
    title: 'Habit streak: 7 days of Active Movement!',
    body: 'Amazing! Your child has been active for a full week. Keep it up!',
    timestamp: '1 day ago',
    read: true,
    color: 'bg-purple-500',
    emoji: '🔥',
  },
  {
    id: '5',
    type: 'blog',
    title: 'New article: Screen Time & Brain Development',
    body: 'What the latest research says about screens under age 5.',
    timestamp: '2 days ago',
    read: true,
    color: 'bg-teal-500',
    emoji: '📖',
    actionUrl: '/blog',
  },
  {
    id: '6',
    type: 'milestone',
    title: 'Speech milestone check',
    body: 'At 18 months, children typically say 10-25 words. How is your child doing?',
    timestamp: '3 days ago',
    read: true,
    color: 'bg-blue-500',
    emoji: '🗣️',
    actionUrl: '/dashboard/milestones',
  },
]

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  targetTime?: string; // Format: "HH:mm", e.g. "14:30"
  targetDate?: string; // Format: "YYYY-MM-DD"
  reminderEnabled: boolean;
  notificationId?: number; // Integer for Capacitor LocalNotifications
  createdAt: number;
  completedAt?: number;
  archived?: boolean;
  archivedAt?: number;
  xpReward: number; // e.g. 25
  coinReward: number; // e.g. 10
}

export type RoutineInterval = 'hourly' | 'daily' | 'weekly';

export interface Routine {
  id: string;
  title: string;
  interval: RoutineInterval;
  timeOfDay?: string; // e.g. "09:00" for daily/weekly
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly
  lastCompletedAt?: number;
  nextDueAt: number;
  completedCount: number;
  streak: number;
  reminderEnabled: boolean;
  notificationId?: number;
  xpReward: number;
  coinReward: number;
  createdAt: number;
}

export type Cadence = 'daily' | 'weekly' | 'monthly';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  cadence?: Cadence;
  cadenceStep?: number; // e.g., Day 1, Week 2, Month 1
  completed: boolean;
  completedAt?: number;
  xpReward: number; // default 50
  coinReward: number; // default 20
  resources?: string[];
}

export interface LessonPlan {
  id: string;
  title: string;
  description?: string;
  category?: string; // e.g., "Programming", "Language", "Design"
  cadence: Cadence; // 'daily' | 'weekly' | 'monthly'
  lessons: Lesson[];
  createdAt: number;
}

export interface UserProfile {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  coins: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalCompletedTasks: number;
  totalCompletedRoutines: number;
  totalCompletedLessons?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  isCustom?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  coinCost: number;
  icon: string;
  redeemedCount: number;
  isCustom?: boolean;
}

export interface UserSettings {
  dailyReviewTime: string; // Format: "HH:mm", default: "09:00"
  dailyReviewEnabled: boolean;
  dailyReviewNotificationId: number;
  autoClearCompletedOnNewDay: boolean;
  lastActiveDate: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type HistoryItemType = 'task' | 'routine' | 'lesson';
export type HistoryItemStatus = 'completed' | 'deleted';

export interface HistoryItem {
  id: string;
  originalId: string;
  itemType: HistoryItemType;
  title: string;
  status: HistoryItemStatus;
  timestamp: number;
  interval?: RoutineInterval;
  targetTime?: string;
  xpEarned?: number;
}

export type MainTab = 'tasks' | 'routines' | 'learning';
export type TaskFilter = 'all' | 'pending' | 'completed';

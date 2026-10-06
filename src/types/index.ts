export interface Task {
  id: string;
  title: string;
  completed: boolean;
  targetTime?: string; // Format: "HH:mm", e.g. "14:30"
  targetDate?: string; // Format: "YYYY-MM-DD"
  reminderEnabled: boolean;
  notificationId?: number; // Integer required by Capacitor LocalNotifications
  createdAt: number;
  completedAt?: number;
  archived?: boolean;
  archivedAt?: number;
}

export interface UserSettings {
  dailyReviewTime: string; // Format: "HH:mm", default: "09:00"
  dailyReviewEnabled: boolean;
  dailyReviewNotificationId: number; // Constant identifier (e.g. 99999)
  autoClearCompletedOnNewDay: boolean; // default: false (manual clear)
  lastActiveDate: string; // Format: "YYYY-MM-DD"
  soundEnabled: boolean;
}

export type TaskFilter = 'all' | 'pending' | 'completed';
export type ActiveTab = 'today' | 'history';

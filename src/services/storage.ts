import type { Task, Routine, UserProfile, Quest, RewardItem, UserSettings } from '../types';
import { DEFAULT_PROFILE, DEFAULT_REWARDS, gamification } from './gamification';

const TASKS_STORAGE_KEY = 'daily_todo_tasks_v2';
const ROUTINES_STORAGE_KEY = 'daily_todo_routines_v2';
const PROFILE_STORAGE_KEY = 'daily_todo_profile_v2';
const QUESTS_STORAGE_KEY = 'daily_todo_quests_v2';
const REWARDS_STORAGE_KEY = 'daily_todo_rewards_v2';
const HISTORY_STORAGE_KEY = 'daily_todo_history_v2';
const SETTINGS_STORAGE_KEY = 'daily_todo_settings_v2';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyReviewTime: '09:00',
  dailyReviewEnabled: false,
  dailyReviewNotificationId: 99999,
  autoClearCompletedOnNewDay: false,
  lastActiveDate: new Date().toISOString().split('T')[0],
  soundEnabled: true,
  vibrationEnabled: true,
};

export const storage = {
  // TASKS
  loadTasks(): Task[] {
    try {
      const data = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!data) return [];
      const parsed: Task[] = JSON.parse(data);
      return parsed.filter((t) => !t.archived);
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  // ROUTINES
  loadRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(ROUTINES_STORAGE_KEY);
      if (!data) {
        // Provide starter routines for first time
        const defaultRoutines: Routine[] = [
          {
            id: 'routine-water',
            title: 'Hydrate & Stretch',
            interval: 'hourly',
            nextDueAt: Date.now() + 3600000,
            completedCount: 0,
            streak: 0,
            reminderEnabled: false,
            xpReward: 15,
            coinReward: 5,
            createdAt: Date.now(),
          },
          {
            id: 'routine-morning',
            title: 'Morning Planning & Focus',
            interval: 'daily',
            timeOfDay: '08:30',
            nextDueAt: Date.now() + 86400000,
            completedCount: 0,
            streak: 0,
            reminderEnabled: true,
            xpReward: 35,
            coinReward: 15,
            createdAt: Date.now(),
          },
          {
            id: 'routine-review',
            title: 'Weekly Wins & Reflection',
            interval: 'weekly',
            dayOfWeek: 0, // Sunday
            timeOfDay: '18:00',
            nextDueAt: Date.now() + 7 * 86400000,
            completedCount: 0,
            streak: 0,
            reminderEnabled: true,
            xpReward: 70,
            coinReward: 30,
            createdAt: Date.now(),
          },
        ];
        this.saveRoutines(defaultRoutines);
        return defaultRoutines;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load routines', e);
      return [];
    }
  },

  saveRoutines(routines: Routine[]): void {
    try {
      localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  },

  calculateNextDueTimestamp(routine: Routine): number {
    const now = Date.now();
    if (routine.interval === 'hourly') {
      return now + 60 * 60 * 1000;
    }
    if (routine.interval === 'daily') {
      const target = new Date();
      if (routine.timeOfDay) {
        const [h, m] = routine.timeOfDay.split(':').map(Number);
        target.setHours(h, m, 0, 0);
        if (target.getTime() <= now) {
          target.setDate(target.getDate() + 1);
        }
        return target.getTime();
      }
      return now + 24 * 60 * 60 * 1000;
    }
    // Weekly
    return now + 7 * 24 * 60 * 60 * 1000;
  },

  // USER PROFILE & GAMIFICATION
  loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!data) return DEFAULT_PROFILE;
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load profile', e);
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  // QUESTS
  loadQuests(): Quest[] {
    try {
      const data = localStorage.getItem(QUESTS_STORAGE_KEY);
      if (!data) {
        const defaults = gamification.getDefaultDailyQuests();
        this.saveQuests(defaults);
        return defaults;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load quests', e);
      return gamification.getDefaultDailyQuests();
    }
  },

  saveQuests(quests: Quest[]): void {
    try {
      localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(quests));
    } catch (e) {
      console.error('Failed to save quests', e);
    }
  },

  // REWARDS
  loadRewards(): RewardItem[] {
    try {
      const data = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (!data) {
        this.saveRewards(DEFAULT_REWARDS);
        return DEFAULT_REWARDS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load rewards', e);
      return DEFAULT_REWARDS;
    }
  },

  saveRewards(rewards: RewardItem[]): void {
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
    } catch (e) {
      console.error('Failed to save rewards', e);
    }
  },

  // HISTORY
  loadHistory(): Task[] {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load history', e);
      return [];
    }
  },

  saveHistory(history: Task[]): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  },

  archiveCompletedTasks(currentTasks: Task[]): { remainingActive: Task[]; archivedCount: number } {
    const toArchive = currentTasks.filter((t) => t.completed);
    if (toArchive.length === 0) {
      return { remainingActive: currentTasks, archivedCount: 0 };
    }

    const now = Date.now();
    const newlyArchived: Task[] = toArchive.map((t) => ({
      ...t,
      archived: true,
      archivedAt: now,
    }));

    const existingHistory = this.loadHistory();
    const updatedHistory = [...newlyArchived, ...existingHistory];
    this.saveHistory(updatedHistory);

    const remainingActive = currentTasks.filter((t) => !t.completed);
    this.saveTasks(remainingActive);

    return { remainingActive, archivedCount: newlyArchived.length };
  },

  // SETTINGS
  loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  generateNotificationId(): number {
    return Math.floor(Math.random() * 2000000000) + 1;
  },

  calculateMissedDays(task: Task): number {
    if (task.completed) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let taskDate: Date;
    if (task.targetDate) {
      const [year, month, day] = task.targetDate.split('-').map(Number);
      taskDate = new Date(year, month - 1, day);
    } else {
      taskDate = new Date(task.createdAt);
      taskDate.setHours(0, 0, 0, 0);
    }

    const diffMs = today.getTime() - taskDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  checkDayRollover(
    tasks: Task[],
    settings: UserSettings,
    profile: UserProfile,
    quests: Quest[]
  ): {
    updatedTasks: Task[];
    updatedSettings: UserSettings;
    updatedProfile: UserProfile;
    updatedQuests: Quest[];
  } {
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastActiveDate === today) {
      return {
        updatedTasks: tasks,
        updatedSettings: settings,
        updatedProfile: profile,
        updatedQuests: quests,
      };
    }

    let updatedTasks = tasks;
    if (settings.autoClearCompletedOnNewDay) {
      const { remainingActive } = this.archiveCompletedTasks(tasks);
      updatedTasks = remainingActive;
    }

    const updatedProfile = gamification.updateStreak(profile);
    const updatedSettings = {
      ...settings,
      lastActiveDate: today,
    };

    // Refresh daily quests on day rollover
    const refreshedQuests = gamification.getDefaultDailyQuests();

    this.saveTasks(updatedTasks);
    this.saveSettings(updatedSettings);
    this.saveProfile(updatedProfile);
    this.saveQuests(refreshedQuests);

    return {
      updatedTasks,
      updatedSettings,
      updatedProfile,
      updatedQuests: refreshedQuests,
    };
  },
};

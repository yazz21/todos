import type { Task, UserSettings } from '../types';

const TASKS_STORAGE_KEY = 'daily_todo_tasks_v1';
const HISTORY_STORAGE_KEY = 'daily_todo_history_v1';
const SETTINGS_STORAGE_KEY = 'daily_todo_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyReviewTime: '09:00',
  dailyReviewEnabled: false,
  dailyReviewNotificationId: 99999,
  autoClearCompletedOnNewDay: false, // Default false: user clears manually
  lastActiveDate: new Date().toISOString().split('T')[0],
  soundEnabled: true,
};

export const storage = {
  loadTasks(): Task[] {
    try {
      const data = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!data) return [];
      const parsed: Task[] = JSON.parse(data);
      // Filter out any archived items just in case
      return parsed.filter((t) => !t.archived);
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  },

  loadHistory(): Task[] {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
      return [];
    }
  },

  saveHistory(history: Task[]): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
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

  loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
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
    settings: UserSettings
  ): { updatedTasks: Task[]; updatedSettings: UserSettings; rolloverOccurred: boolean } {
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastActiveDate === today) {
      return { updatedTasks: tasks, updatedSettings: settings, rolloverOccurred: false };
    }

    let updatedTasks = tasks;
    // Only auto-clear if user explicitly enabled it; otherwise keep completed tasks visible until manual clear
    if (settings.autoClearCompletedOnNewDay) {
      const { remainingActive } = this.archiveCompletedTasks(tasks);
      updatedTasks = remainingActive;
    }

    const updatedSettings = {
      ...settings,
      lastActiveDate: today,
    };

    this.saveTasks(updatedTasks);
    this.saveSettings(updatedSettings);

    return { updatedTasks, updatedSettings, rolloverOccurred: true };
  },
};

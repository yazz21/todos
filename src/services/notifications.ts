import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import type { Task } from '../types';

const CHANNEL_ID = 'daily-todo-channel';
const CHANNEL_NAME = 'Daily Tasks & Reminders';

export const notificationService = {
  isSupported(): boolean {
    return Capacitor.isNativePlatform() || 'Notification' in window;
  },

  async initChannel(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        description: 'Notifications and reminders for daily tasks',
        importance: 4, // High importance (heads-up)
        visibility: 1, // Public on lockscreen
        vibration: true,
      });
    } catch (e) {
      console.warn('Could not create notification channel:', e);
    }
  },

  async requestPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const check = await LocalNotifications.checkPermissions();
        if (check.display === 'granted') return true;

        const request = await LocalNotifications.requestPermissions();
        return request.display === 'granted';
      } else if ('Notification' in window) {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
      return false;
    } catch (e) {
      console.error('Failed to request notification permission', e);
      return false;
    }
  },

  async checkPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        return status.display === 'granted';
      } else if ('Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    } catch {
      return false;
    }
  },

  async scheduleTaskReminder(task: Task): Promise<void> {
    if (!task.reminderEnabled || !task.targetTime || !task.notificationId) return;

    try {
      await this.initChannel();

      const [hours, minutes] = task.targetTime.split(':').map(Number);
      const scheduledDate = new Date();

      if (task.targetDate) {
        const [year, month, day] = task.targetDate.split('-').map(Number);
        scheduledDate.setFullYear(year, month - 1, day);
      }

      scheduledDate.setHours(hours, minutes, 0, 0);

      // If scheduled time has already passed today and no specific future date is provided, do not schedule past alarm
      if (scheduledDate.getTime() <= Date.now()) {
        if (!task.targetDate) {
          // If no specific date was set, schedule for tomorrow at the same time
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        } else {
          return;
        }
      }

      const backoffMinutes = [0, 5, 15, 45, 120];
      const notifications = [];

      for (let i = 0; i < backoffMinutes.length; i++) {
        const triggerTime = new Date(scheduledDate.getTime() + backoffMinutes[i] * 60000);
        if (triggerTime.getTime() > Date.now()) {
          notifications.push({
            id: task.notificationId * 10 + i,
            title: i === 0 ? 'Task Reminder' : `Missed Task Reminder (${i})`,
            body: task.title,
            schedule: { at: triggerTime, allowWhileIdle: true },
            channelId: CHANNEL_ID,
            smallIcon: 'ic_launcher_round',
            extra: { taskId: task.id },
          });
        }
      }

      if (notifications.length > 0) {
        if (Capacitor.isNativePlatform()) {
          await LocalNotifications.schedule({ notifications });
        } else {
          console.log(`[Web Simulation] ${notifications.length} Reminders scheduled for task "${task.title}" starting at ${scheduledDate.toLocaleTimeString()}`);
        }
      }
    } catch (e) {
      console.error('Failed to schedule task reminder', e);
    }
  },

  async cancelTaskReminder(notificationId?: number): Promise<void> {
    if (!notificationId) return;
    try {
      if (Capacitor.isNativePlatform()) {
        const notificationsToCancel = [0, 1, 2, 3, 4].map(i => ({ id: notificationId * 10 + i }));
        await LocalNotifications.cancel({
          notifications: notificationsToCancel,
        });
      }
    } catch (e) {
      console.warn('Failed to cancel task reminder', e);
    }
  },

  async scheduleDailyReview(timeStr: string, notificationId: number): Promise<void> {
    try {
      await this.initChannel();

      const [hours, minutes] = timeStr.split(':').map(Number);
      const firstTrigger = new Date();
      firstTrigger.setHours(hours, minutes, 0, 0);

      if (firstTrigger.getTime() <= Date.now()) {
        firstTrigger.setDate(firstTrigger.getDate() + 1);
      }

      if (Capacitor.isNativePlatform()) {
        // Cancel existing first
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });

        const options: ScheduleOptions = {
          notifications: [
            {
              id: notificationId,
              title: 'Daily Review Time',
              body: "Take a moment to plan and review today's to-do list.",
              schedule: {
                at: firstTrigger,
                every: 'day',
                allowWhileIdle: true,
              },
              channelId: CHANNEL_ID,
              smallIcon: 'ic_launcher_round',
            },
          ],
        };

        await LocalNotifications.schedule(options);
      } else {
        console.log(`[Web Simulation] Daily review scheduled at ${timeStr} every day, starting ${firstTrigger.toLocaleDateString()}`);
      }
    } catch (e) {
      console.error('Failed to schedule daily review', e);
    }
  },

  async cancelDailyReview(notificationId: number): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({
          notifications: [{ id: notificationId }],
        });
      }
    } catch (e) {
      console.warn('Failed to cancel daily review', e);
    }
  },
};

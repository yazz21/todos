import React, { useState, useEffect } from 'react';
import type { Task, UserSettings, TaskFilter } from './types';
import { storage } from './services/storage';
import { notificationService } from './services/notifications';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { Settings, Calendar, CheckCircle2, History } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storage.loadSettings());
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize app, load storage, check day rollover
  useEffect(() => {
    const initialSettings = storage.loadSettings();
    const initialTasks = storage.loadTasks();

    const { updatedTasks, updatedSettings } = storage.checkDayRollover(
      initialTasks,
      initialSettings
    );

    setTasks(updatedTasks);
    setSettings(updatedSettings);

    // Initialize notification channels
    notificationService.initChannel();

    // Schedule daily review if enabled
    if (updatedSettings.dailyReviewEnabled) {
      notificationService.scheduleDailyReview(
        updatedSettings.dailyReviewTime,
        updatedSettings.dailyReviewNotificationId
      );
    }
  }, []);

  const handleAddTask = async (
    title: string,
    targetTime?: string,
    reminderEnabled?: boolean
  ) => {
    let notificationId: number | undefined;
    if (reminderEnabled) {
      notificationId = storage.generateNotificationId();
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newTask: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title,
      completed: false,
      targetTime,
      targetDate: todayStr,
      reminderEnabled: !!reminderEnabled,
      notificationId,
      createdAt: Date.now(),
    };

    if (reminderEnabled && notificationId) {
      await notificationService.scheduleTaskReminder(newTask);
    }

    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const handleToggleTask = async (id: string) => {
    const updated = tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;

        if (nextCompleted && task.notificationId) {
          notificationService.cancelTaskReminder(task.notificationId);
        } else if (!nextCompleted && task.reminderEnabled && task.notificationId) {
          notificationService.scheduleTaskReminder(task);
        }

        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : undefined,
        };
      }
      return task;
    });

    setTasks(updated);
    storage.saveTasks(updated);
  };

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete?.notificationId) {
      await notificationService.cancelTaskReminder(taskToDelete.notificationId);
    }

    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const handleClearCompleted = () => {
    const { remainingActive } = storage.archiveCompletedTasks(tasks);
    setTasks(remainingActive);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    if (newSettings.dailyReviewEnabled) {
      notificationService.scheduleDailyReview(
        newSettings.dailyReviewTime,
        newSettings.dailyReviewNotificationId
      );
    } else {
      notificationService.cancelDailyReview(newSettings.dailyReviewNotificationId);
    }

    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Filter tasks based on selected filter
  const displayedTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const percentComplete = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-full flex flex-col bg-[#050811] text-slate-100 max-w-md mx-auto relative select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#050811]/90 backdrop-blur-md border-b border-slate-900 safe-top px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                Daily To-Do
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>{todayFormatted}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Open History"
              title="Task History"
            >
              <History className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Open Settings"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Quick Filters */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-400 min-w-[48px] text-right">
              {completedCount}/{totalTasks}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            {(['all', 'pending', 'completed'] as TaskFilter[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  filter === mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <TaskList
          tasks={displayedTasks}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onClearCompleted={completedCount > 0 ? handleClearCompleted : undefined}
        />
      </main>

      {/* Floating Bottom Task Input */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 safe-bottom bg-gradient-to-t from-[#050811] via-[#050811]/90 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <TaskInput onAddTask={handleAddTask} />
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

export default App;

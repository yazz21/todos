import React, { useState, useEffect } from 'react';
import type { Task, Routine, RoutineInterval, UserProfile, Quest, RewardItem, UserSettings, MainTab, TaskFilter, LessonPlan } from './types';
import { storage } from './services/storage';
import { notificationService } from './services/notifications';
import { soundService } from './services/sound';
import { gamification } from './services/gamification';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { RoutineList } from './components/RoutineList';
import { SkillLearningList } from './components/SkillLearningList';
import { GameStatsHeader } from './components/GameStatsHeader';
import { QuestsModal } from './components/QuestsModal';
import { RewardsVaultModal } from './components/RewardsVaultModal';
import { LessonPlanImportModal } from './components/LessonPlanImportModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { Settings, History, CheckSquare, Repeat, Calendar, GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storage.loadProfile());
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storage.loadSettings());

  const [mainTab, setMainTab] = useState<MainTab>('tasks');
  const [filter, setFilter] = useState<TaskFilter>('all');

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Initialize and check day rollover
  useEffect(() => {
    const loadedSettings = storage.loadSettings();
    const loadedTasks = storage.loadTasks();
    const loadedProfile = storage.loadProfile();
    const loadedQuests = storage.loadQuests();

    const { updatedTasks, updatedSettings, updatedProfile, updatedQuests } =
      storage.checkDayRollover(loadedTasks, loadedSettings, loadedProfile, loadedQuests);

    setTasks(updatedTasks);
    setSettings(updatedSettings);
    setProfile(updatedProfile);
    setQuests(updatedQuests);
    setRoutines(storage.loadRoutines());
    setRewards(storage.loadRewards());
    setLessonPlans(storage.loadLessonPlans());

    soundService.setEnabled(updatedSettings.soundEnabled);

    // Initialize notification channels
    notificationService.initChannel();

    if (updatedSettings.dailyReviewEnabled) {
      notificationService.scheduleDailyReview(
        updatedSettings.dailyReviewTime,
        updatedSettings.dailyReviewNotificationId
      );
    }
  }, []);

  // Update quest progress helper
  const incrementQuestProgress = (type: 'tasks' | 'routines', currentQuests: Quest[]) => {
    return currentQuests.map((q) => {
      if (q.completed) return q;
      let shouldInc = false;
      if (type === 'tasks' && (q.id === 'quest-daily-3' || q.id === 'quest-daily-5')) shouldInc = true;
      if (type === 'routines' && (q.id === 'quest-routine-1' || q.id === 'quest-daily-5')) shouldInc = true;

      if (shouldInc) {
        const next = q.currentCount + 1;
        return {
          ...q,
          currentCount: next,
          completed: next >= q.targetCount,
        };
      }
      return q;
    });
  };

  // TASK ACTIONS
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
      xpReward: 25,
      coinReward: 10,
    };

    if (reminderEnabled && notificationId) {
      await notificationService.scheduleTaskReminder(newTask);
    }

    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const handleToggleTask = async (id: string) => {
    let newlyCompleted = false;
    let earnedXp = 25;
    let earnedCoins = 10;

    const updated = tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) {
          newlyCompleted = true;
          earnedXp = task.xpReward || 25;
          earnedCoins = task.coinReward || 10;
        }

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

    if (newlyCompleted) {
      // Record completed event in history
      const completedItem = tasks.find((t) => t.id === id);
      if (completedItem) {
        storage.recordHistoryEvent(completedItem.id, 'task', completedItem.title, 'completed', {
          targetTime: completedItem.targetTime,
          xpEarned: earnedXp,
        });
      }

      // Trigger dopamine feedback!
      soundService.playTaskComplete();
      gamification.triggerConfetti('small');

      // Update XP & Coins
      const { updated: newProfile, didLevelUp } = gamification.addExperience(
        profile,
        earnedXp,
        earnedCoins
      );
      newProfile.totalCompletedTasks += 1;

      if (didLevelUp) {
        soundService.playLevelUp();
        gamification.triggerConfetti('grand');
      }

      setProfile(newProfile);
      storage.saveProfile(newProfile);

      // Advance daily quests
      const updatedQ = incrementQuestProgress('tasks', quests);
      setQuests(updatedQ);
      storage.saveQuests(updatedQ);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      if (taskToDelete.notificationId) {
        await notificationService.cancelTaskReminder(taskToDelete.notificationId);
      }
      // Record soft delete event in history
      storage.recordHistoryEvent(taskToDelete.id, 'task', taskToDelete.title, 'deleted', {
        targetTime: taskToDelete.targetTime,
      });
    }

    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const handleClearCompleted = () => {
    const { remainingActive } = storage.archiveCompletedTasks(tasks);
    setTasks(remainingActive);
  };

  const handleRestoreTask = (task: Task) => {
    const updated = [task, ...tasks];
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const handleRestoreRoutine = (routine: Routine) => {
    const updated = [...routines, routine];
    setRoutines(updated);
    storage.saveRoutines(updated);
  };

  // ROUTINE ACTIONS
  const handleAddRoutine = (title: string, interval: RoutineInterval, timeOfDay?: string) => {
    const newRoutine: Routine = {
      id: 'routine-' + Date.now().toString(36),
      title,
      interval,
      timeOfDay,
      nextDueAt: Date.now() + (interval === 'hourly' ? 3600000 : 86400000),
      completedCount: 0,
      streak: 0,
      reminderEnabled: false,
      xpReward: interval === 'weekly' ? 70 : interval === 'daily' ? 35 : 15,
      coinReward: interval === 'weekly' ? 30 : interval === 'daily' ? 15 : 5,
      createdAt: Date.now(),
    };

    const updated = [...routines, newRoutine];
    setRoutines(updated);
    storage.saveRoutines(updated);
  };

  const handleCompleteRoutine = (id: string) => {
    let earnedXp = 35;
    let earnedCoins = 15;

    const struckRoutine = routines.find((r) => r.id === id);
    if (struckRoutine) {
      storage.recordHistoryEvent(struckRoutine.id, 'routine', struckRoutine.title, 'completed', {
        interval: struckRoutine.interval,
        xpEarned: struckRoutine.xpReward,
      });
    }

    const updated = routines.map((r) => {
      if (r.id === id) {
        earnedXp = r.xpReward;
        earnedCoins = r.coinReward;
        return {
          ...r,
          completedCount: r.completedCount + 1,
          streak: r.streak + 1,
          lastCompletedAt: Date.now(),
          nextDueAt: storage.calculateNextDueTimestamp(r),
        };
      }
      return r;
    });

    setRoutines(updated);
    storage.saveRoutines(updated);

    // Audio & particles
    soundService.playTaskComplete();
    gamification.triggerConfetti('small');

    // Experience & Coins
    const { updated: newProfile, didLevelUp } = gamification.addExperience(
      profile,
      earnedXp,
      earnedCoins
    );
    newProfile.totalCompletedRoutines += 1;

    if (didLevelUp) {
      soundService.playLevelUp();
      gamification.triggerConfetti('grand');
    }

    setProfile(newProfile);
    storage.saveProfile(newProfile);

    // Update quest progress
    const updatedQ = incrementQuestProgress('routines', quests);
    setQuests(updatedQ);
    storage.saveQuests(updatedQ);
  };

  const handleDeleteRoutine = (id: string) => {
    const routineToDelete = routines.find((r) => r.id === id);
    if (routineToDelete) {
      storage.recordHistoryEvent(routineToDelete.id, 'routine', routineToDelete.title, 'deleted', {
        interval: routineToDelete.interval,
      });
    }

    const updated = routines.filter((r) => r.id !== id);
    setRoutines(updated);
    storage.saveRoutines(updated);
  };

  // LESSON & LEARNING ACTIONS
  const handleToggleLesson = (planId: string, lessonId: string) => {
    let earnedXp = 50;
    let earnedCoins = 20;
    let newlyCompleted = false;

    const updatedPlans = lessonPlans.map((plan) => {
      if (plan.id === planId) {
        const updatedLessons = plan.lessons.map((lesson) => {
          if (lesson.id === lessonId) {
            const nextCompleted = !lesson.completed;
            if (nextCompleted) {
              newlyCompleted = true;
              earnedXp = lesson.xpReward || 50;
              earnedCoins = lesson.coinReward || 20;
            }
            return {
              ...lesson,
              completed: nextCompleted,
              completedAt: nextCompleted ? Date.now() : undefined,
            };
          }
          return lesson;
        });
        return { ...plan, lessons: updatedLessons };
      }
      return plan;
    });

    setLessonPlans(updatedPlans);
    storage.saveLessonPlans(updatedPlans);

    if (newlyCompleted) {
      soundService.playTaskComplete();
      gamification.triggerConfetti('small');

      const targetPlan = lessonPlans.find((p) => p.id === planId);
      const targetLesson = targetPlan?.lessons.find((l) => l.id === lessonId);
      if (targetLesson) {
        storage.recordHistoryEvent(targetLesson.id, 'lesson', targetLesson.title, 'completed', {
          xpEarned: earnedXp,
        });
      }

      const { updated: newProfile, didLevelUp } = gamification.addExperience(
        profile,
        earnedXp,
        earnedCoins
      );
      if (didLevelUp) {
        soundService.playLevelUp();
        gamification.triggerConfetti('grand');
      }
      setProfile(newProfile);
      storage.saveProfile(newProfile);
    }
  };

  const handleDeletePlan = (planId: string) => {
    const target = lessonPlans.find((p) => p.id === planId);
    if (target) {
      storage.recordHistoryEvent(target.id, 'lesson', target.title, 'deleted');
    }
    const updated = lessonPlans.filter((p) => p.id !== planId);
    setLessonPlans(updated);
    storage.saveLessonPlans(updated);
  };

  const handleImportSuccess = (newPlan: LessonPlan) => {
    soundService.playRewardCollect();
    gamification.triggerConfetti('grand');
    const updated = [newPlan, ...lessonPlans];
    setLessonPlans(updated);
  };

  // QUESTS & REWARDS
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.claimed) return;

    soundService.playRewardCollect();
    gamification.triggerConfetti('small');

    const { updated: newProfile, didLevelUp } = gamification.addExperience(
      profile,
      quest.rewardXp,
      quest.rewardCoins
    );

    if (didLevelUp) {
      soundService.playLevelUp();
      gamification.triggerConfetti('grand');
    }

    setProfile(newProfile);
    storage.saveProfile(newProfile);

    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, claimed: true } : q
    );
    setQuests(updatedQuests);
    storage.saveQuests(updatedQuests);
  };

  const handleAddCustomChallenge = (
    title: string,
    description: string,
    targetCount: number,
    rewardXp: number,
    rewardCoins: number
  ) => {
    const newQuest: Quest = {
      id: 'quest-custom-' + Date.now(),
      title,
      description,
      targetCount,
      currentCount: 0,
      rewardXp,
      rewardCoins,
      completed: false,
      claimed: false,
      isCustom: true,
    };
    const updated = [newQuest, ...quests];
    setQuests(updated);
    storage.saveQuests(updated);
  };

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward || profile.coins < reward.coinCost) return;

    soundService.playRewardCollect();
    gamification.triggerConfetti('grand');

    const newProfile = {
      ...profile,
      coins: profile.coins - reward.coinCost,
    };
    setProfile(newProfile);
    storage.saveProfile(newProfile);

    const updatedRewards = rewards.map((r) =>
      r.id === rewardId ? { ...r, redeemedCount: r.redeemedCount + 1 } : r
    );
    setRewards(updatedRewards);
    storage.saveRewards(updatedRewards);
  };

  const handleAddCustomReward = (title: string, description: string, coinCost: number) => {
    const newReward: RewardItem = {
      id: 'reward-custom-' + Date.now(),
      title,
      description,
      coinCost,
      icon: 'sparkles',
      redeemedCount: 0,
      isCustom: true,
    };
    const updated = [newReward, ...rewards];
    setRewards(updated);
    storage.saveRewards(updated);
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

    soundService.setEnabled(newSettings.soundEnabled);
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Filter tasks
  const displayedTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-full flex flex-col bg-[#050811] text-slate-100 max-w-md mx-auto relative select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#050811]/90 backdrop-blur-md border-b border-slate-900 safe-top px-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 leading-tight">
                Daily Slayer
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>{todayFormatted}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors min-h-[44px] min-w-[44px]"
              title="Archive & History"
            >
              <History className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors min-h-[44px] min-w-[44px]"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Stats HUD */}
        <GameStatsHeader
          profile={profile}
          onOpenQuests={() => setIsQuestsOpen(true)}
          onOpenRewards={() => setIsRewardsOpen(true)}
        />

        {/* Tab Navigation: Tasks vs Routines vs Learning */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setMainTab('tasks')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
              mainTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setMainTab('routines')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
              mainTab === 'routines'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Routines ({routines.length})</span>
          </button>

          <button
            onClick={() => setMainTab('learning')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
              mainTab === 'learning'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Learning ({lessonPlans.length})</span>
          </button>
        </div>

        {/* Task filters if in tasks tab */}
        {mainTab === 'tasks' && totalTasks > 0 && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 font-semibold">
              {completedCount}/{totalTasks} Completed
            </span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              {(['all', 'pending', 'completed'] as TaskFilter[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-2 py-0.5 rounded-lg capitalize font-bold transition-colors ${
                    filter === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {mainTab === 'tasks' ? (
          <TaskList
            tasks={displayedTasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onClearCompleted={completedCount > 0 ? handleClearCompleted : undefined}
          />
        ) : mainTab === 'routines' ? (
          <RoutineList
            routines={routines}
            onCompleteRoutine={handleCompleteRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onAddRoutine={handleAddRoutine}
          />
        ) : (
          <SkillLearningList
            plans={lessonPlans}
            onToggleLesson={handleToggleLesson}
            onDeletePlan={handleDeletePlan}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Task Input (active only when in Tasks tab) */}
      {mainTab === 'tasks' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 safe-bottom bg-gradient-to-t from-[#050811] via-[#050811]/90 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <TaskInput onAddTask={handleAddTask} />
          </div>
        </div>
      )}

      {/* Modals */}
      <LessonPlanImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <QuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        quests={quests}
        onClaimQuest={handleClaimQuest}
        onAddCustomChallenge={handleAddCustomChallenge}
      />

      <RewardsVaultModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        userCoins={profile.coins}
        rewards={rewards}
        onRedeemReward={handleRedeemReward}
        onAddCustomReward={handleAddCustomReward}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestoreTask={handleRestoreTask}
        onRestoreRoutine={handleRestoreRoutine}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
};

export default App;

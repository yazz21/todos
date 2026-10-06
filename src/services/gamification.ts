import confetti from 'canvas-confetti';
import type { UserProfile, Quest, RewardItem } from '../types';

export const DEFAULT_PROFILE: UserProfile = {
  level: 1,
  currentXp: 0,
  nextLevelXp: 100,
  coins: 50, // Starting bonus
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalCompletedTasks: 0,
  totalCompletedRoutines: 0,
};

export const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'reward-1',
    title: '30 Min Guilt-Free Gaming',
    description: 'Play your favorite video game without any guilt',
    coinCost: 50,
    icon: 'gamepad',
    redeemedCount: 0,
  },
  {
    id: 'reward-2',
    title: 'Favorite Coffee / Smoothie',
    description: 'Grab a premium specialty drink from your favorite café',
    coinCost: 40,
    icon: 'coffee',
    redeemedCount: 0,
  },
  {
    id: 'reward-3',
    title: 'Movie / Episode Night',
    description: 'Kick back and watch a movie or Netflix episode',
    coinCost: 60,
    icon: 'tv',
    redeemedCount: 0,
  },
  {
    id: 'reward-4',
    title: '1 Hour Creative Time',
    description: 'Work on any fun hobby or passion project',
    coinCost: 45,
    icon: 'sparkles',
    redeemedCount: 0,
  },
];

export const gamification = {
  calculateNextLevelXp(level: number): number {
    return Math.round(100 * Math.pow(1.35, level - 1));
  },

  addExperience(
    profile: UserProfile,
    xpToAdd: number,
    coinsToAdd: number
  ): { updated: UserProfile; didLevelUp: boolean } {
    let currentXp = profile.currentXp + xpToAdd;
    let level = profile.level;
    let nextLevelXp = profile.nextLevelXp;
    let didLevelUp = false;

    while (currentXp >= nextLevelXp) {
      currentXp -= nextLevelXp;
      level += 1;
      nextLevelXp = this.calculateNextLevelXp(level);
      didLevelUp = true;
    }

    const updated: UserProfile = {
      ...profile,
      level,
      currentXp,
      nextLevelXp,
      coins: profile.coins + coinsToAdd,
    };

    return { updated, didLevelUp };
  },

  updateStreak(profile: UserProfile): UserProfile {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate === today) {
      return profile;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = profile.streakDays;

    if (profile.lastActiveDate === yesterday) {
      newStreak += 1;
    } else {
      // Missed at least 1 full day
      newStreak = 1;
    }

    return {
      ...profile,
      streakDays: newStreak,
      lastActiveDate: today,
    };
  },

  getDefaultDailyQuests(): Quest[] {
    return [
      {
        id: 'quest-daily-3',
        title: 'Task Conqueror',
        description: 'Complete 3 daily to-do items',
        targetCount: 3,
        currentCount: 0,
        rewardXp: 50,
        rewardCoins: 25,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest-routine-1',
        title: 'Routine Master',
        description: 'Complete at least 1 recurring routine today',
        targetCount: 1,
        currentCount: 0,
        rewardXp: 40,
        rewardCoins: 20,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest-daily-5',
        title: 'Unstoppable Momentum',
        description: 'Complete 5 total tasks or routines in a single day',
        targetCount: 5,
        currentCount: 0,
        rewardXp: 80,
        rewardCoins: 45,
        completed: false,
        claimed: false,
      },
    ];
  },

  // Fire dopamine particle confetti
  triggerConfetti(intensity: 'small' | 'grand' = 'small') {
    try {
      if (intensity === 'small') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981'],
          disableForReducedMotion: true,
        });
      } else {
        // Grand level up / milestone celebration
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#A855F7', '#22D3EE', '#FBBF24', '#34D399', '#EC4899'],
        });
      }
    } catch (e) {
      console.warn('Confetti trigger failed', e);
    }
  },
};

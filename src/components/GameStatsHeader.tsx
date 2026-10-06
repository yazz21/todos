import React from 'react';
import type { UserProfile } from '../types';
import { Flame, Coins, Zap, Trophy } from 'lucide-react';

interface GameStatsHeaderProps {
  profile: UserProfile;
  onOpenQuests: () => void;
  onOpenRewards: () => void;
}

export const GameStatsHeader: React.FC<GameStatsHeaderProps> = ({
  profile,
  onOpenQuests,
  onOpenRewards,
}) => {
  const xpPercent = Math.min(
    100,
    Math.round((profile.currentXp / profile.nextLevelXp) * 100)
  );

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-3.5 shadow-2xl backdrop-blur-xl space-y-3 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Level badge, Coins, and Fire Streak */}
      <div className="flex items-center justify-between gap-2">
        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
                  {profile.level}
                </span>
              </div>
            </div>
            <Zap className="w-3.5 h-3.5 text-cyan-400 absolute -top-1 -right-1 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider uppercase text-slate-200">
                Level {profile.level}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Novice Slayer
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {profile.currentXp} / {profile.nextLevelXp} XP
            </span>
          </div>
        </div>

        {/* Right HUD Badges: Streak & Coins */}
        <div className="flex items-center gap-2">
          {/* Fire Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-300 shadow-sm shadow-orange-500/10">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-xs font-bold">{profile.streakDays}d</span>
          </div>

          {/* Coins / Rewards Vault trigger */}
          <button
            onClick={onOpenRewards}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30 text-amber-300 hover:border-amber-400/60 transition-all active:scale-95 shadow-sm shadow-amber-500/10"
            title="Open Rewards Vault"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black">{profile.coins}</span>
          </button>

          {/* Quests trigger */}
          <button
            onClick={onOpenQuests}
            className="w-8 h-8 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:border-purple-400/60 transition-all flex items-center justify-center active:scale-95 shadow-sm"
            title="Quests & Challenges"
          >
            <Trophy className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* XP Bar */}
      <div className="space-y-1">
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 shadow-sm shadow-purple-500/50"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

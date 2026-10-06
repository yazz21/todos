import React, { useState } from 'react';
import type { Quest } from '../types';
import { Trophy, CheckCircle2, Plus, X, Zap, Coins, Sparkles } from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
  onAddCustomChallenge: (title: string, description: string, targetCount: number, rewardXp: number, rewardCoins: number) => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  onClaimQuest,
  onAddCustomChallenge,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCount, setTargetCount] = useState(3);
  const [rewardXp, setRewardXp] = useState(50);
  const [rewardCoins, setRewardCoins] = useState(25);

  if (!isOpen) return null;

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCustomChallenge(title.trim(), description.trim() || 'Custom personal challenge', targetCount, rewardXp, rewardCoins);
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-[85vh] sm:h-[80vh] flex flex-col bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Quests & Challenges</h3>
              <p className="text-xs text-slate-400">Complete challenges to earn XP and Coins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action subheader */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Quests ({quests.length})
          </span>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Challenge
          </button>
        </div>

        {/* Quests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {quests.map((quest) => {
            const isFinished = quest.currentCount >= quest.targetCount;
            const progressPercent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                className="p-4 bg-slate-800/40 border border-slate-800/80 rounded-2xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{quest.title}</h4>
                      {quest.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{quest.description}</p>
                  </div>

                  {/* Rewards preview */}
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span className="flex items-center gap-0.5 text-purple-300">
                      <Zap className="w-3 h-3 text-purple-400" /> +{quest.rewardXp}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-300">
                      <Coins className="w-3 h-3 text-amber-400" /> +{quest.rewardCoins}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Progress</span>
                    <span>{quest.currentCount} / {quest.targetCount}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Claim button */}
                {isFinished && (
                  <div className="pt-1">
                    {quest.claimed ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Claimed
                      </div>
                    ) : (
                      <button
                        onClick={() => onClaimQuest(quest.id)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 active:scale-98 animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Claim Rewards! (+{quest.rewardXp} XP, +{quest.rewardCoins} Coins)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Challenge Modal */}
        {isAdding && (
          <div className="absolute inset-0 z-20 bg-slate-900/95 p-5 rounded-t-3xl sm:rounded-3xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  Create Custom Challenge
                </h4>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="custom-challenge-form" onSubmit={handleSubmitCustom} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Challenge Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 5 Workouts this week, Read 50 pages..."
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Target Repetitions / Count</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">XP Reward</label>
                    <input
                      type="number"
                      min="10"
                      value={rewardXp}
                      onChange={(e) => setRewardXp(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Coin Reward</label>
                    <input
                      type="number"
                      min="5"
                      value={rewardCoins}
                      onChange={(e) => setRewardCoins(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="custom-challenge-form"
                disabled={!title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-600/30 disabled:opacity-40"
              >
                Create Challenge
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

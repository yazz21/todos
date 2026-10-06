import React, { useState } from 'react';
import type { RewardItem } from '../types';
import { Coins, Plus, X, Gift, Gamepad2, Coffee, Tv } from 'lucide-react';

interface RewardsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  rewards: RewardItem[];
  onRedeemReward: (rewardId: string) => void;
  onAddCustomReward: (title: string, description: string, coinCost: number) => void;
}

export const RewardsVaultModal: React.FC<RewardsVaultModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  rewards,
  onRedeemReward,
  onAddCustomReward,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(50);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCustomReward(title.trim(), description.trim() || 'Custom reward unlock', cost);
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'gamepad':
        return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'tv':
        return <Tv className="w-5 h-5 text-cyan-400" />;
      default:
        return <Gift className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-[85vh] sm:h-[80vh] flex flex-col bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Rewards Vault</h3>
              <p className="text-xs text-slate-400">Treat yourself using earned gold coins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coin balance & Add custom reward row */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-black">{userCoins} Coins Available</span>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Reward
          </button>
        </div>

        {/* Rewards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {rewards.map((reward) => {
            const canAfford = userCoins >= reward.coinCost;

            return (
              <div
                key={reward.id}
                className="p-4 bg-slate-800/40 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex-shrink-0">
                    {getRewardIcon(reward.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{reward.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{reward.description}</p>
                    {reward.redeemedCount > 0 && (
                      <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                        Claimed {reward.redeemedCount} {reward.redeemedCount === 1 ? 'time' : 'times'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Redeem button */}
                <button
                  onClick={() => onRedeemReward(reward.id)}
                  disabled={!canAfford}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 min-w-[76px] ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-0.5 text-[11px]">
                    <Coins className="w-3 h-3" /> {reward.coinCost}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {canAfford ? 'Redeem' : 'Need More'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Add custom reward sub-panel */}
        {isAdding && (
          <div className="absolute inset-0 z-20 bg-slate-900/95 p-5 rounded-t-3xl sm:rounded-3xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  Add Custom Reward
                </h4>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="custom-reward-form" onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Reward Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sushi Dinner, Buy new book, 2h free time..."
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Coin Price</label>
                  <input
                    type="number"
                    min="10"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
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
                form="custom-reward-form"
                disabled={!title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 disabled:opacity-40"
              >
                Save Reward
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

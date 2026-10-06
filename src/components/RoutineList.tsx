import React, { useState } from 'react';
import type { Routine, RoutineInterval } from '../types';
import { Repeat, Plus, Trash2, CheckCircle2, Clock, Flame, X } from 'lucide-react';

interface RoutineListProps {
  routines: Routine[];
  onCompleteRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
  onAddRoutine: (title: string, interval: RoutineInterval, timeOfDay?: string) => void;
}

export const RoutineList: React.FC<RoutineListProps> = ({
  routines,
  onCompleteRoutine,
  onDeleteRoutine,
  onAddRoutine,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInterval, setNewInterval] = useState<RoutineInterval>('daily');
  const [newTime, setNewTime] = useState('09:00');

  const filteredRoutines = routines.filter((r) => {
    if (filter === 'hourly') return r.interval === 'hourly';
    if (filter === 'daily') return r.interval === 'daily';
    if (filter === 'weekly') return r.interval === 'weekly';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddRoutine(newTitle.trim(), newInterval, newInterval !== 'hourly' ? newTime : undefined);
    setNewTitle('');
    setIsAdding(false);
  };

  const formatDueStatus = (nextDueAt: number) => {
    const diff = nextDueAt - Date.now();
    if (diff <= 0) return { ready: true, text: 'Ready to strike!' };

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return { ready: false, text: `Due in ${minutes}m` };

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return { ready: false, text: `Due in ${hours}h` };

    const days = Math.floor(hours / 24);
    return { ready: false, text: `Due in ${days}d` };
  };

  return (
    <div className="w-full space-y-4 pb-28">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2">
        {/* Interval Filters */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs">
          {['all', 'hourly', 'daily', 'weekly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                filter === tab
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Routine
        </button>
      </div>

      {/* Routine Cards */}
      {filteredRoutines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
            <Repeat className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No routines in this interval</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Create repeating habits like drinking water hourly, journaling daily, or weekly reviews.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoutines.map((routine) => {
            const dueStatus = formatDueStatus(routine.nextDueAt);

            return (
              <div
                key={routine.id}
                className="group p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/30 rounded-2xl transition-all shadow-md space-y-3 relative overflow-hidden"
              >
                {/* Glow bar */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500" />

                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {routine.interval}
                      </span>
                      {routine.streak > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                          <Flame className="w-3 h-3" /> {routine.streak} streak
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{routine.title}</h4>
                    {routine.timeOfDay && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Target: {routine.timeOfDay}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteRoutine(routine.id)}
                    className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom action & XP reward trigger */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 pl-1">
                  <span
                    className={`text-xs font-semibold ${
                      dueStatus.ready ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                    }`}
                  >
                    {dueStatus.text}
                  </span>

                  <button
                    onClick={() => onCompleteRoutine(routine.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-black shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Strike (+{routine.xpReward} XP)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Routine Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl safe-bottom space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-cyan-400" />
                New Recurring Routine
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Routine Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Drink Water, Meditate, Code Practice..."
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Interval Frequency</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['hourly', 'daily', 'weekly'] as RoutineInterval[]).map((int) => (
                    <button
                      key={int}
                      type="button"
                      onClick={() => setNewInterval(int)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        newInterval === int
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {int}
                    </button>
                  ))}
                </div>
              </div>

              {newInterval !== 'hourly' && (
                <div>
                  <label className="text-xs font-medium text-slate-400">Preferred Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 disabled:opacity-40"
                >
                  Create Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

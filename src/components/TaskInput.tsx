import React, { useState } from 'react';
import { Plus, Clock, Bell, BellOff } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (title: string, targetTime?: string, reminderEnabled?: boolean) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAddTask(
      cleanTitle,
      targetTime ? targetTime : undefined,
      reminderEnabled && !!targetTime
    );

    setTitle('');
    setTargetTime('');
    setReminderEnabled(false);
    setShowTimePicker(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetTime(val);
    if (val && !reminderEnabled) {
      setReminderEnabled(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="relative flex items-center bg-slate-900/95 border border-slate-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl transition-all focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-500/20">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task (+25 XP)..."
          className="flex-1 bg-transparent px-3 py-2 text-base text-slate-100 placeholder-slate-500 focus:outline-none min-h-[48px]"
        />

        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={() => setShowTimePicker(!showTimePicker)}
            title="Set Reminder Time"
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors min-h-[44px] min-w-[44px] ${
              targetTime
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {showTimePicker && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-slate-900/90 border border-slate-800/90 rounded-xl text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-semibold">Reminder Time:</span>
            <input
              type="time"
              value={targetTime}
              onChange={handleTimeChange}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 min-h-[36px]"
            />
          </div>

          {targetTime && (
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                reminderEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {reminderEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  Alarm Active
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-500" />
                  No Alarm
                </>
              )}
            </button>
          )}
        </div>
      )}
    </form>
  );
};

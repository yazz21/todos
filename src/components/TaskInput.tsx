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
      <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-lg backdrop-blur-md transition-all focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent px-3 py-2 text-base text-slate-100 placeholder-slate-500 focus:outline-none min-h-[48px]"
        />

        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={() => setShowTimePicker(!showTimePicker)}
            title="Set Reminder Time"
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors min-h-[44px] min-w-[44px] ${
              targetTime
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 min-h-[44px] min-w-[44px]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {showTimePicker && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">Target Time:</span>
            <input
              type="time"
              value={targetTime}
              onChange={handleTimeChange}
              className="bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 min-h-[36px]"
            />
          </div>

          {targetTime && (
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                reminderEnabled
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {reminderEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
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

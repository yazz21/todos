import React from 'react';
import type { Task } from '../types';
import { storage } from '../services/storage';
import { Check, Trash2, Clock, Bell, ListTodo, AlertTriangle, Archive } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
          <ListTodo className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No tasks for today</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Add your to-dos below. Set a target time for alarms or let them roll over with missed days tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-28">
      {/* Pending Tasks Section */}
      <div className="space-y-2">
        {pendingTasks.map((task) => {
          const missedDays = storage.calculateMissedDays(task);

          return (
            <div
              key={task.id}
              className={`group flex items-center justify-between gap-3 p-3.5 bg-slate-900/80 hover:bg-slate-900 border rounded-2xl transition-all shadow-sm active:scale-[0.99] ${
                missedDays > 0 ? 'border-amber-500/30' : 'border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task.id)}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-700 hover:border-indigo-500 bg-slate-800/40 hover:bg-indigo-500/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]"
                aria-label={`Mark "${task.title}" complete`}
              >
                <span className="w-5 h-5 rounded-lg border border-slate-600 group-hover:border-indigo-400 flex items-center justify-center">
                  {/* Empty checkbox */}
                </span>
              </button>

              {/* Task Title & Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 break-words leading-snug">
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {task.targetTime && (
                    <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.targetTime}</span>
                      {task.reminderEnabled && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.2 rounded-full border border-indigo-500/20">
                          <Bell className="w-2.5 h-2.5" /> Alarm
                        </span>
                      )}
                    </div>
                  )}

                  {/* Missed days counter */}
                  {missedDays > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      {missedDays === 1 ? 'Missed 1 day' : `Missed ${missedDays} days`}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => onDeleteTask(task.id)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]"
                aria-label={`Delete "${task.title}"`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed ({completedTasks.length})
            </h4>
            {onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors min-h-[36px]"
              >
                <Archive className="w-3.5 h-3.5" />
                Clear to History
              </button>
            )}
          </div>

          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-900 rounded-2xl transition-all opacity-75"
              >
                {/* Completed Checkbox */}
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]"
                  aria-label={`Uncheck "${task.title}"`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Strikethrough Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-400 line-through break-words leading-snug">
                    {task.title}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]"
                  aria-label={`Delete "${task.title}"`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

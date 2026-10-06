import React, { useState, useEffect } from 'react';
import type { HistoryItem, Task, Routine } from '../types';
import { storage } from '../services/storage';
import {
  X,
  History,
  Search,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  Repeat,
  CheckSquare,
  AlertOctagon,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreTask?: (task: Task) => void;
  onRestoreRoutine?: (routine: Routine) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreTask,
  onRestoreRoutine,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all'); // 'all' | 'completed' | 'deleted' | 'task' | 'routine'

  useEffect(() => {
    if (isOpen) {
      setHistoryItems(storage.loadHistoryItems());
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStrictDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Strictly delete this item permanently from history?')) {
      storage.deleteHistoryItemStrict(id);
      setHistoryItems(storage.loadHistoryItems());
    }
  };

  const handleStrictClearAll = () => {
    if (window.confirm('Strictly wipe all history items permanently? This cannot be undone.')) {
      storage.clearHistoryItemsStrict();
      setHistoryItems([]);
    }
  };

  const handleRestore = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.itemType === 'task' && onRestoreTask) {
      const restoredTask: Task = {
        id: item.originalId || Date.now().toString(36),
        title: item.title,
        completed: false,
        targetTime: item.targetTime,
        targetDate: new Date().toISOString().split('T')[0],
        reminderEnabled: false,
        createdAt: Date.now(),
        xpReward: 25,
        coinReward: 10,
      };
      onRestoreTask(restoredTask);
    } else if (item.itemType === 'routine' && onRestoreRoutine) {
      const restoredRoutine: Routine = {
        id: item.originalId || 'routine-' + Date.now().toString(36),
        title: item.title,
        interval: item.interval || 'daily',
        nextDueAt: Date.now() + 86400000,
        completedCount: 0,
        streak: 0,
        reminderEnabled: false,
        xpReward: item.interval === 'weekly' ? 70 : item.interval === 'daily' ? 35 : 15,
        coinReward: item.interval === 'weekly' ? 30 : item.interval === 'daily' ? 15 : 5,
        createdAt: Date.now(),
      };
      onRestoreRoutine(restoredRoutine);
    }

    // Remove from history after restoring
    storage.deleteHistoryItemStrict(item.id);
    setHistoryItems(storage.loadHistoryItems());
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `daily-todo-history-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'completed') return item.status === 'completed';
    if (filterType === 'deleted') return item.status === 'deleted';
    if (filterType === 'task') return item.itemType === 'task';
    if (filterType === 'routine') return item.itemType === 'routine';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-[88vh] sm:h-[82vh] flex flex-col bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Audit & Soft Delete History</h3>
              <p className="text-xs text-slate-400">
                {historyItems.length} records preserved with day & time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search, Filter Pills & Export Controls */}
        <div className="p-4 space-y-2.5 border-b border-slate-800/60 bg-slate-900/60">
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm focus-within:border-indigo-500">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none w-full text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {['all', 'completed', 'deleted', 'task', 'routine'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-all whitespace-nowrap ${
                  filterType === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Top Actions: Export JSON & Strict Clear */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleExportJSON}
              disabled={historyItems.length === 0}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>

            {historyItems.length > 0 && (
              <button
                onClick={handleStrictClearAll}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Strict Clear All
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No records found</p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                All completed and soft-deleted tasks or routines will be safely logged here for future reference.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isCompleted = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800/80 rounded-2xl space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Completed
                            </>
                          ) : (
                            <>
                              <AlertOctagon className="w-3 h-3 text-rose-400" />
                              Soft Deleted
                            </>
                          )}
                        </span>

                        {/* Item Type Badge */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {item.itemType === 'routine' ? (
                            <>
                              <Repeat className="w-2.5 h-2.5 text-cyan-400" />
                              Routine {item.interval && `(${item.interval})`}
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-2.5 h-2.5 text-indigo-400" />
                              Task
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 break-words">
                        {item.title}
                      </h4>
                    </div>

                    {/* Strict Delete & Restore Controls */}
                    <div className="flex items-center gap-1">
                      {/* Restore button if deleted */}
                      {item.status === 'deleted' && (
                        <button
                          onClick={(e) => handleRestore(item, e)}
                          className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2 py-1 rounded-lg transition-colors"
                          title="Restore to active view"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      )}

                      {/* Strict permanent delete */}
                      <button
                        onClick={(e) => handleStrictDelete(item.id, e)}
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Strictly remove from history permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Day & Time Timestamp */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-800/60">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDateTime(item.timestamp)}</span>
                    {item.targetTime && (
                      <span className="flex items-center gap-0.5 text-slate-400 ml-1">
                        • <Clock className="w-3 h-3" /> {item.targetTime}
                      </span>
                    )}
                    {item.xpEarned && (
                      <span className="text-purple-400 font-bold ml-auto text-[10px]">
                        +{item.xpEarned} XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { storage } from '../services/storage';
import { X, History, Search, Trash2, Download, Calendar, CheckCircle2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHistory(storage.loadHistory());
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredHistory = history.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to permanently clear your task history?')) {
      storage.saveHistory([]);
      setHistory([]);
    }
  };

  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `daily-todo-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-[85vh] sm:h-[80vh] flex flex-col bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Task History</h3>
              <p className="text-xs text-slate-400">
                {history.length} {history.length === 1 ? 'task' : 'tasks'} archived for reference
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

        {/* Search Bar & Actions */}
        <div className="p-4 space-y-3 border-b border-slate-800/60 bg-slate-900/50">
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm focus-within:border-indigo-500">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical tasks..."
              className="bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleExportHistory}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Historical Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">No archived tasks found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Completed tasks cleared from your daily list will appear here
              </p>
            </div>
          ) : (
            filteredHistory.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1"
              >
                <p className="text-sm font-medium text-slate-200">{task.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>Completed: {formatDate(task.completedAt || task.archivedAt || task.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

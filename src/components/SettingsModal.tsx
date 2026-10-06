import React, { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import { notificationService } from '../services/notifications';
import { X, Bell, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [dailyReviewTime, setDailyReviewTime] = useState(settings.dailyReviewTime);
  const [dailyReviewEnabled, setDailyReviewEnabled] = useState(settings.dailyReviewEnabled);
  const [autoClear, setAutoClear] = useState(settings.autoClearCompletedOnNewDay);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDailyReviewTime(settings.dailyReviewTime);
      setDailyReviewEnabled(settings.dailyReviewEnabled);
      setAutoClear(settings.autoClearCompletedOnNewDay);
      checkNotificationStatus();
    }
  }, [isOpen, settings]);

  const checkNotificationStatus = async () => {
    const granted = await notificationService.checkPermission();
    setPermissionGranted(granted);
  };

  const handleRequestPermission = async () => {
    setCheckingPermission(true);
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);
    setCheckingPermission(false);
  };

  const handleSave = () => {
    const updated: UserSettings = {
      ...settings,
      dailyReviewTime,
      dailyReviewEnabled,
      autoClearCompletedOnNewDay: autoClear,
    };
    onSaveSettings(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl safe-bottom space-y-6 animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission status card */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {permissionGranted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {permissionGranted ? 'Notifications Allowed' : 'Notifications Disabled'}
              </p>
              <p className="text-xs text-slate-400">
                {permissionGranted
                  ? 'Ready for alarms & reviews'
                  : 'Enable to receive scheduled alarms'}
              </p>
            </div>
          </div>

          {!permissionGranted && (
            <button
              onClick={handleRequestPermission}
              disabled={checkingPermission}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex-shrink-0"
            >
              {checkingPermission ? 'Checking...' : 'Enable'}
            </button>
          )}
        </div>

        {/* Daily Review Reminder Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Daily Planning Review
              </label>
              <p className="text-xs text-slate-400">
                Get a reminder every morning to plan your tasks
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyReviewEnabled}
                onChange={(e) => setDailyReviewEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {dailyReviewEnabled && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 animate-in fade-in duration-150">
              <span className="text-xs font-medium text-slate-300">Reminder Time:</span>
              <input
                type="time"
                value={dailyReviewTime}
                onChange={(e) => setDailyReviewTime(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Daily Rollover Behavior */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="space-y-0.5 max-w-[75%]">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Auto-clear on New Day
            </label>
            <p className="text-xs text-slate-400">
              Automatically remove completed tasks when the day changes
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoClear}
              onChange={(e) => setAutoClear(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-sm font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

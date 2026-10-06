import React, { useState, useRef } from 'react';
import type { LessonPlan } from '../types';
import { storage } from '../services/storage';
import { X, Upload, CheckCircle2, AlertCircle, Download, BookOpen, Sparkles } from 'lucide-react';

interface LessonPlanImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (plan: LessonPlan) => void;
}

export const LessonPlanImportModal: React.FC<LessonPlanImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewPlan, setPreviewPlan] = useState<Partial<LessonPlan> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const validateAndPreview = (text: string) => {
    setError(null);
    setPreviewPlan(null);
    if (!text.trim()) return;

    try {
      const parsed = JSON.parse(text);
      if (!parsed.title) {
        setError('Missing required "title" field in lesson plan.');
        return;
      }
      if (!Array.isArray(parsed.lessons) || parsed.lessons.length === 0) {
        setError('Missing "lessons" array or it contains no lessons.');
        return;
      }
      setPreviewPlan(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      validateAndPreview(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!jsonText.trim()) return;
    const result = storage.importLessonPlanFromJSON(jsonText);
    if (result.success && result.plan) {
      onImportSuccess(result.plan);
      onClose();
    } else {
      setError(result.error || 'Failed to import lesson plan');
    }
  };

  const handleDownloadTemplate = () => {
    const template = {
      title: 'Full-Stack AI Application Development',
      category: 'Software Engineering',
      cadence: 'daily',
      description: 'Hands-on curriculum to build modern AI web apps from scratch.',
      lessons: [
        {
          title: 'Day 1: TypeScript 5.8 & Advanced Type Systems',
          description: 'Master discriminated unions, type narrowing, and strict module resolution.',
          cadenceStep: 1,
          xpReward: 50,
          coinReward: 20,
          resources: ['https://www.typescriptlang.org/docs/handbook/2/types-from-types.html'],
        },
        {
          title: 'Day 2: React 19 Actions & Optimistic State',
          description: 'Implement form actions, useOptimistic, and high-performance patterns.',
          cadenceStep: 2,
          xpReward: 50,
          coinReward: 20,
          resources: ['https://react.dev/reference/react/useOptimistic'],
        },
        {
          title: 'Day 3: Embeddings & Vector Similarity Search',
          description: 'Understand vector spaces, cosine distance, and in-memory indexing.',
          cadenceStep: 3,
          xpReward: 50,
          coinReward: 20,
        },
      ],
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'lesson_plan_template.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg h-[90vh] sm:h-auto max-h-[90vh] flex flex-col bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom animate-in slide-in-from-bottom-6 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">Import Lesson Plan</h3>
              <p className="text-xs text-slate-400">Upload a JSON curriculum file or paste JSON code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Template Download Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-200">Need the JSON template format?</p>
              <p className="text-[11px] text-slate-400">Download our sample schema with daily/weekly structure</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Schema
            </button>
          </div>

          {/* File Upload Drop Area */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-900/60 hover:bg-slate-800/40 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-200">
                {fileName ? fileName : 'Click to upload .json file'}
              </p>
              <p className="text-[11px] text-slate-500">Supports structured curricula, courses, and roadmaps</p>
            </button>
          </div>

          {/* Direct JSON Text Area */}
          <div>
            <label className="text-xs font-bold text-slate-400 flex items-center justify-between mb-1">
              <span>Or Paste JSON Directly:</span>
              {previewPlan && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid format ({previewPlan.lessons?.length} lessons)
                </span>
              )}
            </label>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                validateAndPreview(e.target.value);
              }}
              placeholder='{\n  "title": "Machine Learning in 30 Days",\n  "cadence": "daily",\n  "lessons": [...]\n}'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Validation Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Card */}
          {previewPlan && !error && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {previewPlan.cadence || 'daily'}
                </span>
                {previewPlan.category && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {previewPlan.category}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-100">{previewPlan.title}</h4>
              {previewPlan.description && (
                <p className="text-xs text-slate-400">{previewPlan.description}</p>
              )}
              <p className="text-[11px] text-amber-300 font-semibold pt-1">
                ⭐ {previewPlan.lessons?.length} milestones / lessons ready to track
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!previewPlan || !!error}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Import Lesson Plan
          </button>
        </div>

      </div>
    </div>
  );
};

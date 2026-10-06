import React, { useState } from 'react';
import type { LessonPlan } from '../types';
import {
  GraduationCap,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  Target,
} from 'lucide-react';

interface SkillLearningListProps {
  plans: LessonPlan[];
  onToggleLesson: (planId: string, lessonId: string) => void;
  onDeletePlan: (planId: string) => void;
  onOpenImport: () => void;
}

export const SkillLearningList: React.FC<SkillLearningListProps> = ({
  plans,
  onToggleLesson,
  onDeletePlan,
  onOpenImport,
}) => {
  const [filterCadence, setFilterCadence] = useState<string>('all');
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (planId: string) => {
    setExpandedPlanIds((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const filteredPlans = plans.filter((p) => {
    if (filterCadence === 'all') return true;
    return p.cadence === filterCadence;
  });

  return (
    <div className="w-full space-y-4 pb-28">
      {/* Action Row: Cadence Filter & Import Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs">
          {['all', 'daily', 'weekly', 'monthly'].map((cad) => (
            <button
              key={cad}
              onClick={() => setFilterCadence(cad)}
              className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-all ${
                filterCadence === cad
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cad}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Import Plan
        </button>
      </div>

      {/* Lesson Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No Learning Curricula</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Import a custom JSON lesson plan to track skills daily, weekly, or monthly with structured milestones.
          </p>
          <button
            onClick={onOpenImport}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all"
          >
            Upload JSON Lesson Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const isExpanded = expandedPlanIds[plan.id] !== false; // expanded by default
            const totalLessons = plan.lessons.length;
            const completedCount = plan.lessons.filter((l) => l.completed).length;
            const progressPercent =
              totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            return (
              <div
                key={plan.id}
                className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                {/* Course Card Header */}
                <div
                  onClick={() => toggleExpand(plan.id)}
                  className="p-4 cursor-pointer hover:bg-slate-850/60 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {plan.cadence} Cadence
                        </span>
                        {plan.category && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {plan.category}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-100">{plan.title}</h4>
                      {plan.description && (
                        <p className="text-xs text-slate-400">{plan.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete lesson plan "${plan.title}"?`)) {
                            onDeletePlan(plan.id);
                          }
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-slate-400 p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-amber-400" />
                        {completedCount} / {totalLessons} Lessons Done
                      </span>
                      <span className="text-amber-400 font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lessons Milestones List */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-3 space-y-2 bg-slate-950/40">
                    {plan.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`group p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          lesson.completed
                            ? 'bg-slate-950/70 border-slate-900 opacity-80'
                            : 'bg-slate-900/70 border-slate-800/80 hover:border-amber-500/40'
                        }`}
                      >
                        {/* Checkbox Trigger */}
                        <button
                          onClick={() => onToggleLesson(plan.id, lesson.id)}
                          className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all flex-shrink-0 min-h-[44px] min-w-[44px] active:scale-90 ${
                            lesson.completed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'border border-slate-700 bg-slate-800/50 hover:border-amber-400 hover:bg-amber-500/10'
                          }`}
                          aria-label={`Mark "${lesson.title}" complete`}
                        >
                          {lesson.completed ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="w-4 h-4 rounded-md border border-slate-600 group-hover:border-amber-400" />
                          )}
                        </button>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p
                            className={`text-sm font-semibold break-words ${
                              lesson.completed
                                ? 'text-slate-400 line-through'
                                : 'text-slate-200'
                            }`}
                          >
                            {lesson.title}
                          </p>
                          {lesson.description && (
                            <p className="text-xs text-slate-400">{lesson.description}</p>
                          )}

                          {/* Reward & Resources */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              <Zap className="w-2.5 h-2.5 text-amber-400" /> +{lesson.xpReward} XP
                            </span>
                            {lesson.resources && lesson.resources.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                <BookOpen className="w-3 h-3 text-slate-400" />
                                {lesson.resources.length}{' '}
                                {lesson.resources.length === 1 ? 'Resource' : 'Resources'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

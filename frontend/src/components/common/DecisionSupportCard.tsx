import React from 'react';
import { Lightbulb, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface DecisionSupportFactor {
  label: string;
  value: string;
}

export interface DecisionSupportCardProps {
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  factors: DecisionSupportFactor[];
  recommendedAction: string;
  reasoning: string;
  onApplyAction?: () => void;
}

export const DecisionSupportCard: React.FC<DecisionSupportCardProps> = ({
  title,
  category,
  priority,
  factors,
  recommendedAction,
  reasoning,
  onApplyAction,
}) => {
  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-agri-50/20 rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-agri-100 text-agri-800 rounded-lg shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-agri-800">{category}</span>
        </div>
        <StatusBadge status={`${priority} Priority`} size="sm" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{title}</h3>

      {/* Decision Factors Chain */}
      <div className="bg-white/80 rounded-xl p-4 border border-slate-200/70 mb-4 backdrop-blur-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
          Inputs & Environmental Signals Evaluated:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {factors.map((factor, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">{factor.label}</span>
              <span className="block text-xs font-bold text-slate-800 mt-0.5">{factor.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="bg-emerald-900 text-emerald-50 rounded-xl p-4 shadow-sm relative overflow-hidden mb-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              Recommended System Action
            </span>
            <p className="text-sm font-extrabold tracking-wide text-white mt-0.5">{recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Explainable AI Reasoning */}
      <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-amber-50/70 rounded-xl p-3 border border-amber-200/60">
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p><strong className="text-amber-950 font-semibold">AI Rationale:</strong> {reasoning}</p>
      </div>

      {onApplyAction && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onApplyAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Execute Advisory Action
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

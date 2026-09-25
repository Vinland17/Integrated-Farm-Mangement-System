import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  change?: number; // percentage change e.g. +4.2%
  trendPeriod?: string;
  badgeText?: string;
  accentColor?: 'green' | 'blue' | 'amber' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  change,
  trendPeriod = 'vs last month',
  badgeText,
  accentColor = 'green',
}) => {
  const isPositive = change !== undefined && change >= 0;

  const bgGradient = {
    green: 'from-agri-500/10 to-emerald-500/5 text-agri-700',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-700',
    blue: 'from-sky-500/10 to-indigo-500/5 text-sky-700',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-700',
  }[accentColor];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor === 'green' ? 'from-agri-500 to-emerald-400' : 'from-sky-500 to-indigo-400'}`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${bgGradient} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center font-semibold rounded-md px-1.5 py-0.5 ${
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-slate-400">{trendPeriod}</span>
          </div>
        ) : badgeText ? (
          <span className="inline-block bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
            {badgeText}
          </span>
        ) : (
          <span className="text-slate-400">{subtitle || 'Updated live'}</span>
        )}
      </div>
    </div>
  );
};

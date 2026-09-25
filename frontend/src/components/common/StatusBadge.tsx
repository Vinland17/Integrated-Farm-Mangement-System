import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['healthy', 'active', 'in stock', 'available', 'grade a', 'completed', 'high', 'success'].some(s => normalized.includes(s))) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['warning', 'low stock', 'needs attention', 'medium', 'moderate', 'working', 'grade b', 'preparation', 'fallow'].some(s => normalized.includes(s))) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['critical', 'out of stock', 'critical risk', 'high priority', 'severe', 'on leave', 'inactive', 'grade c', 'danger'].some(s => normalized.includes(s))) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (['info', 'low', 'under maintenance', 'germination', 'planting'].some(s => normalized.includes(s))) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200/80';
  }

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {status}
    </span>
  );
};

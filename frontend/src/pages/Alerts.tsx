import React, { useState } from 'react';
import { Bell, CheckCircle2, CloudSun, Scan, Boxes, Droplets, Wheat, ShieldAlert, Filter } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_ALERTS, recommendationService } from '../services/recommendationService';
import { Alert, AlertCategory } from '../types';
import { useToast } from '../hooks/useToast';

export const Alerts: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const handleMarkRead = async (id: string) => {
    await recommendationService.markAlertRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    showToast('Alert Dismissed', 'Alert marked as read.', 'info');
  };

  const getCategoryIcon = (cat: AlertCategory) => {
    switch (cat) {
      case 'Weather': return <CloudSun className="w-5 h-5 text-amber-600" />;
      case 'Disease': return <Scan className="w-5 h-5 text-rose-600" />;
      case 'Inventory': return <Boxes className="w-5 h-5 text-sky-600" />;
      case 'Irrigation': return <Droplets className="w-5 h-5 text-teal-600" />;
      case 'Harvest': return <Wheat className="w-5 h-5 text-emerald-600" />;
      default: return <ShieldAlert className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !alert.isRead;
    if (activeFilter === 'High Priority') return alert.priority === 'High';
    return alert.category === activeFilter;
  });

  const filterOptions = ['All', 'Unread', 'High Priority', 'Weather', 'Disease', 'Inventory', 'Harvest'];

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="System Alerts & Advisory Feed"
        subtitle="Real-time warning notifications from weather, computer vision, and inventory telemetry."
        icon={<Bell className="w-6 h-6" />}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setActiveFilter(opt)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === opt
                ? 'bg-agri-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              !alert.isRead ? 'border-agri-300 shadow-sm bg-agri-50/10' : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                {getCategoryIcon(alert.category)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-slate-900">{alert.title}</h3>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="Unread" />
                  )}
                  <StatusBadge status={`${alert.priority} Priority`} size="sm" />
                </div>
                <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                <span className="text-[10px] text-slate-400 font-semibold block mt-2">{alert.timestamp}</span>
              </div>
            </div>

            {!alert.isRead && (
              <button
                onClick={() => handleMarkRead(alert.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../common/SearchBar';
import { MOCK_ALERTS } from '../../services/recommendationService';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Deriving title & breadcrumbs
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/farms': return 'Farm Operations Management';
      case '/fields': return 'Field Sector Mapping';
      case '/crops': return 'Crop Inventory & Growth Stages';
      case '/soil': return 'Soil Health & NPK Analytics';
      case '/weather': return 'Agri Weather & Environmental Advisory';
      case '/inventory': return 'Farm Resource & Supply Inventory';
      case '/workers': return 'Workforce & Task Assignments';
      case '/finance': return 'Financial Ledger & ROI Tracker';
      case '/harvest': return 'Harvest & Yield Performance';
      case '/ai-recommendations': return 'AI Recommendation Engine';
      case '/disease-detection': return 'Plant Disease Vision Classifier';
      case '/alerts': return 'System Alerts & Advisory Feed';
      case '/reports': return 'Agricultural Analytics Reports';
      default: return 'Farm Management System';
    }
  };

  const currentTitle = getPageTitle(location.pathname);
  const unreadAlerts = MOCK_ALERTS.filter((a) => !a.isRead);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link to="/dashboard" className="hover:text-agri-700 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-semibold">{currentTitle.split(' ')[0]}</span>
          </nav>
          <h2 className="text-base lg:text-lg font-bold text-slate-900 leading-tight hidden sm:block">
            {currentTitle}
          </h2>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:block flex-1 max-w-xs">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Right: Notifications & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100 rounded-xl relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                <span className="text-xs font-semibold px-2 py-0.5 bg-agri-50 text-agri-700 rounded-full">
                  {unreadAlerts.length} Unread
                </span>
              </div>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {MOCK_ALERTS.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>{alert.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{alert.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{alert.description}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/alerts"
                onClick={() => setShowNotifications(false)}
                className="block text-center text-xs font-semibold text-agri-700 hover:text-agri-800 pt-3 mt-2 border-t border-slate-100"
              >
                View all alerts & advisories →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-agri-500/30 shadow-2xs"
          />
          <div className="hidden sm:block leading-tight text-left">
            <span className="block text-xs font-bold text-slate-900">{user?.name || 'Farm Manager'}</span>
            <span className="block text-[10px] text-slate-500 font-medium">{user?.role || 'Farm Manager'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tractor,
  Map,
  Sprout,
  FlaskConical,
  CloudSun,
  Boxes,
  Users,
  DollarSign,
  Wheat,
  Sparkles,
  Scan,
  Bell,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Farm Management',
      items: [
        { label: 'Farms', path: '/farms', icon: <Tractor className="w-5 h-5" /> },
        { label: 'Fields', path: '/fields', icon: <Map className="w-5 h-5" /> },
        { label: 'Crops', path: '/crops', icon: <Sprout className="w-5 h-5" /> },
        { label: 'Soil', path: '/soil', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Weather', path: '/weather', icon: <CloudSun className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Inventory', path: '/inventory', icon: <Boxes className="w-5 h-5" /> },
        { label: 'Workers', path: '/workers', icon: <Users className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Finance & Production',
      items: [
        { label: 'Finance', path: '/finance', icon: <DollarSign className="w-5 h-5" /> },
        { label: 'Harvest', path: '/harvest', icon: <Wheat className="w-5 h-5" /> },
      ],
    },
    {
      title: 'AI & Intelligence',
      items: [
        { label: 'AI Recommendations', path: '/ai-recommendations', icon: <Sparkles className="w-5 h-5" />, badge: 'AI' },
        { label: 'Disease Detection', path: '/disease-detection', icon: <Scan className="w-5 h-5" /> },
        { label: 'Alerts', path: '/alerts', icon: <Bell className="w-5 h-5" />, badge: '2' },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { label: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-gradient-to-br from-agri-500 to-emerald-600 rounded-xl text-white shadow-md shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-white text-base tracking-tight block">PRJ_533</span>
                <span className="text-[10px] text-agri-400 font-bold uppercase tracking-wider block">Smart Agri DSS</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          {sections.map((sec, idx) => (
            <div key={idx}>
              {!collapsed && (
                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {sec.title}
                </p>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-agri-700/90 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={`${isActive ? 'text-agri-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}

                      {item.badge && !collapsed && (
                        <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-agri-500/20 text-agri-300 border border-agri-500/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name || 'User Avatar'}
                  className="w-9 h-9 rounded-full object-cover border border-agri-500/40 shrink-0"
                />
                <div className="truncate leading-tight">
                  <span className="block text-xs font-bold text-white truncate">{user?.name || 'Farm Manager'}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-agri-400 font-semibold">
                    <ShieldCheck className="w-3 h-3 inline" /> {user?.role || 'Farm Manager'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex justify-center p-2.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

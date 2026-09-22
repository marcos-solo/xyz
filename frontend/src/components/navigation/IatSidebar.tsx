import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Award,
  CreditCard,
  Building,
  GraduationCap,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IatLogo } from '../common/IatLogo';

export interface IatSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenSearch?: () => void;
}

export const IatSidebar: React.FC<IatSidebarProps> = ({
  mobileOpen,
  setMobileOpen,
  onOpenSearch,
}) => {
  const { user, isGuest, setGuestPerspective } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      name: 'Search',
      icon: Search,
      action: onOpenSearch,
      isAction: true,
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Course Catalog',
      path: '/catalog',
      icon: BookOpen,
    },
    {
      name: 'Timetable',
      path: '/timetable',
      icon: Calendar,
    },
    {
      name: 'Assessments',
      path: '/assessments',
      icon: FileText,
    },
    {
      name: 'Credentials',
      path: '/credentials',
      icon: Award,
    },
    {
      name: 'Subscriptions',
      path: '/subscriptions',
      icon: CreditCard,
    },
    {
      name: 'Organizations',
      path: '/organizations',
      icon: Building,
    },
    {
      name: 'Programs',
      path: '/programs',
      icon: GraduationCap,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* IAT Student Portal Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-56 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 lg:hidden">
          <IatLogo size="sm" />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {isGuest && (
            <div className="mb-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-900 mb-1">
                👁️ Guest Testing
              </p>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setGuestPerspective('admin');
                }}
                className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>⚙️</span>
                <span>Switch to Admin View</span>
              </button>
            </div>
          )}
          {navItems.map((item, idx) => {
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    item.action?.();
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>{item.name}</span>
                </button>
              );
            }

            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path!));

            return (
              <NavLink
                key={idx}
                to={item.path!}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#73111b] text-white shadow-md shadow-[#73111b]/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer learner badge */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="h-7 w-7 rounded-full bg-[#73111b] text-white flex items-center justify-center text-xs font-bold shrink-0 uppercase">
              {user?.first_name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-[#73111b] truncate font-semibold flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                <span>IAT Student Portal</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Aliases for compatibility
export const GoogleSkillsSidebar = IatSidebar;
export type GoogleSkillsSidebarProps = IatSidebarProps;

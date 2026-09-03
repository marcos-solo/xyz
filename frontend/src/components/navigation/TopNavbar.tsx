import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  Building,
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Quick Search Button (Cmd+K) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 transition-all w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search students, courses...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Branch badge */}
          {user?.branch && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <Building className="h-3.5 w-3.5 text-[#73111b]" />
              <span>{user.branch.name}</span>
            </div>
          )}

          {/* Role badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#881337] font-semibold">
            <Shield className="h-3 w-3 text-[#73111b]" />
            <span>{user?.roles?.[0] || 'User'}</span>
          </div>

          {/* Notification icon */}
          <button
            onClick={() => window.location.href = '/announcements'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative"
            title="Announcements"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#73111b]" />
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition"
            >
              <span className="hidden sm:inline text-xs font-bold text-slate-700">
                {user?.first_name}
              </span>
              <div className="h-8 w-8 rounded-full bg-[#73111b] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </div>
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        window.location.href = '/settings';
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

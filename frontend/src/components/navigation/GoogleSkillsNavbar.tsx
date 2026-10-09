import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IatLogo } from '../common/IatLogo';
import {
  Menu,
  Search,
  HelpCircle,
  Globe,
  LogOut,
  User,
  BookOpen,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationCenterDropdown } from './NotificationCenterDropdown';

interface GoogleSkillsNavbarProps {
  onOpenMobileSidebar: () => void;
}

export const GoogleSkillsNavbar: React.FC<GoogleSkillsNavbarProps> = ({
  onOpenMobileSidebar,
}) => {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-7">
        {/* Left Section: Mobile toggle & IAT Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition lg:hidden"
            title="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <a href="/dashboard" className="flex items-center gap-2 group">
            <IatLogo size="sm" />
          </a>
        </div>

        {/* Center Section: Google Skills Structure Pill Search Bar */}
        <div className="flex-1 max-w-xl mx-3 sm:mx-8 hidden md:block">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#73111b]/40 text-slate-600 transition-all text-xs shadow-2xs group"
          >
            <span className="text-slate-500 group-hover:text-slate-700 truncate">
              What do you want to learn today?
            </span>
            <Search className="h-4 w-4 text-slate-400 group-hover:text-[#73111b] shrink-0 ml-2" />
          </button>
        </div>

        {/* Right Section: Gamification & Profile in IAT theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Help button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="hidden sm:flex p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Help & Support"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Region / Language */}
          <div
            className="hidden sm:flex p-2 rounded-full text-slate-500 hover:bg-slate-100 transition cursor-default"
            title="Region: Kenya (EN)"
          >
            <Globe className="h-4 w-4" />
          </div>

          {/* Interactive Portal Notification Center */}
          <NotificationCenterDropdown theme="dark-red" />

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#73111b]/30 transition"
              title="Account Menu"
            >
              <div className="h-8 w-8 rounded-full bg-[#73111b] flex items-center justify-center text-white font-bold text-xs shadow-xs uppercase">
                {user?.first_name?.charAt(0) || 'S'}
              </div>
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.full_name || 'Student'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-[#fff1f2] text-[10px] font-bold text-[#73111b] border border-[#fecdd3]">
                      Student ID: {user?.student_number || 'IAT Student'}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <a
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                      <span>My Learning Hub</span>
                    </a>
                    <a
                      href="/credentials"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Award className="h-3.5 w-3.5 text-slate-500" />
                      <span>Badges & Certificates</span>
                    </a>
                    <a
                      href="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Account Settings</span>
                    </a>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
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

      {/* Quick Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Student Learning Help & Resources</h3>
            <p className="text-xs text-slate-500 mt-1">
              Find answers to platform features, timetable sessions, and course navigation.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <a
                href="#courses"
                onClick={() => setHelpOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-50/60 transition text-slate-700 hover:text-[#73111b] font-semibold"
              >
                <span>Navigating curriculum modules and video lessons</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <a
                href="#streaks"
                onClick={() => setHelpOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-50/60 transition text-slate-700 hover:text-[#73111b] font-semibold"
              >
                <span>Daily study streak and completing lessons</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <a
                href="#certs"
                onClick={() => setHelpOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-50/60 transition text-slate-700 hover:text-[#73111b] font-semibold"
              >
                <span>Course completion certificates and verification</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

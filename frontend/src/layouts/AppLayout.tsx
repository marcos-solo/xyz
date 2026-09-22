import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopNavbar } from '../components/navigation/TopNavbar';
import { IatSidebar } from '../components/navigation/IatSidebar';
import { GoogleSkillsNavbar } from '../components/navigation/GoogleSkillsNavbar';
import { GlobalSearchModal } from '../components/navigation/GlobalSearchModal';

export const AppLayout: React.FC = () => {
  const { user, isGuest, guestPerspective, setGuestPerspective } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const isStudent = (user?.roles?.includes('Student') ?? false) && !isGuest;
  const isLearnRoute = location.pathname.startsWith('/learn');

  // Use official IAT Student Portal experience for students, dedicated learning view, or guest in student perspective
  const isStudentPortalView = isStudent || isLearnRoute || (isGuest && guestPerspective === 'student');

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-900 flex flex-col">
      {/* Guest Mode Indicator Banner */}
      {isGuest && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-800 via-violet-800 to-purple-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-white/20 font-black text-[10px] uppercase tracking-wider text-violet-100 border border-white/15">
              👁️ Guest Testing Account
            </span>
            <span className="text-violet-100/90 font-normal">
              Full read-only access. You can view all users, records, and the student learning experience.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-violet-200/90 font-bold uppercase tracking-wider">View Mode:</span>
            <div className="inline-flex rounded-lg bg-black/30 p-0.5 border border-white/15">
              <button
                type="button"
                onClick={() => setGuestPerspective('admin')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  guestPerspective === 'admin'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-violet-200 hover:text-white hover:bg-white/10'
                }`}
              >
                Admin / All Users
              </button>
              <button
                type="button"
                onClick={() => setGuestPerspective('student')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  guestPerspective === 'student'
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-violet-200 hover:text-white hover:bg-white/10'
                }`}
              >
                Student Portal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        {isStudentPortalView ? (
          <IatSidebar
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            onOpenSearch={() => setSearchModalOpen(true)}
          />
        ) : (
          <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
        )}

        {/* Main Container */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            isStudentPortalView ? 'lg:pl-56' : 'lg:pl-64'
          }`}
        >
          {isStudentPortalView ? (
            <GoogleSkillsNavbar
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              points={10405}
              streak={3}
            />
          ) : (
            <TopNavbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          )}

          <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};

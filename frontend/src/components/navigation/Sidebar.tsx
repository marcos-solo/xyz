import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IatLogo } from '../common/IatLogo';
import {
  LayoutDashboard,
  Building2,
  GitFork,
  Briefcase,
  Users,
  GraduationCap,
  BookOpen,
  FolderKanban,
  CalendarDays,
  FileCheck2,
  Award,
  WalletCards,
  BarChart3,
  Bell,
  History,
  Settings,
  ShieldCheck,
  ChevronRight,
  BookMarked,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, hasPermission } = useAuth();

  const isGuest = user?.roles?.includes('Guest') ?? false;
  const isStudent = (user?.roles?.includes('Student') ?? false) && !isGuest;
  const isAdmissionsOfficer = user?.roles?.includes('Admissions Officer');

  const navigationGroups = [
    {
      title: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          show: !isAdmissionsOfficer,
        },
      ],
    },
    ...(isStudent
      ? [
          {
            title: 'My Learning',
            items: [
              { name: 'My Courses', path: '/my-courses', icon: BookOpen, show: true },
              { name: 'Class Timetable', path: '/timetable', icon: CalendarDays, show: true },
              { name: 'Assessments & Quizzes', path: '/my-assessments', icon: FileCheck2, show: true },
              { name: 'My Certificates', path: '/my-certificates', icon: Award, show: true },
            ],
          },
        ]
      : [
          {
            title: 'Organization',
            items: [
              { name: 'Branches', path: '/branches', icon: GitFork, show: hasPermission('branches.view') },
              { name: 'Departments', path: '/departments', icon: Building2, show: hasPermission('departments.view') },
              { name: 'Positions', path: '/positions', icon: Briefcase, show: hasPermission('positions.manage') },
            ],
          },
          {
            title: 'People',
            items: [
              { name: 'Students', path: '/students', icon: GraduationCap, show: hasPermission('students.view') },
              { name: 'Staff Directory', path: '/staff', icon: Users, show: hasPermission('staff.view') },
              { name: 'User Management', path: '/users', icon: ShieldCheck, show: hasPermission('users.view') },
              { name: 'Roles & Permissions', path: '/roles', icon: ShieldCheck, show: hasPermission('roles.view') },
            ],
          },
          {
            title: 'Academics & Intakes',
            items: [
              { name: 'Courses & Curriculum', path: '/courses', icon: BookMarked, show: hasPermission('courses.view') },
              { name: 'Batches / Intakes', path: '/batches', icon: FolderKanban, show: hasPermission('batches.view') },
              { name: 'Enrollments', path: '/enrollments', icon: GraduationCap, show: hasPermission('enrollments.view') },
              { name: 'Finance & Clearance', path: '/finance', icon: WalletCards, show: hasPermission('finance.view') },
            ],
          },
          {
            title: 'Operations',
            items: [
              { name: 'Class Timetable', path: '/classes', icon: CalendarDays, show: hasPermission('classes.view') },
              { name: 'Assessments & Gradebook', path: '/assessments', icon: FileCheck2, show: hasPermission('assessments.view') },
              { name: 'Certificates', path: '/certificates', icon: Award, show: hasPermission('certificates.view') },
            ],
          },
          {
            title: 'System & Reports',
            items: [
              { name: 'Reports Center', path: '/reports', icon: BarChart3, show: hasPermission('reports.view') },
              { name: 'Announcements', path: '/announcements', icon: Bell, show: true },
              { name: 'Audit Trail', path: '/audit-logs', icon: History, show: hasPermission('audit_logs.view') },
              { name: 'Settings', path: '/settings', icon: Settings, show: hasPermission('settings.view') },
            ],
          },
          ...(isGuest
            ? [
                {
                  title: 'Student Portal (Preview)',
                  items: [
                    { name: 'Course Catalog', path: '/catalog', icon: BookOpen, show: true },
                    { name: 'Learning Paths', path: '/paths', icon: GraduationCap, show: true },
                    { name: 'My Enrolled Courses', path: '/my-courses', icon: BookMarked, show: true },
                    { name: 'Class Timetable', path: '/timetable', icon: CalendarDays, show: true },
                    { name: 'Assessments', path: '/my-assessments', icon: FileCheck2, show: true },
                    { name: 'Credentials & Certs', path: '/credentials', icon: Award, show: true },
                  ],
                },
              ]
            : []),
        ]),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with IAT Logo */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <IatLogo size="sm" />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {navigationGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </p>
                {visibleItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={idx}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#73111b] text-white shadow-md shadow-[#73111b]/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-40" />
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#73111b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.first_name?.charAt(0)}
            {user?.last_name?.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
              {user?.roles?.[0] || 'User'} • {user?.branch?.code || 'HQ'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

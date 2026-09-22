import React from 'react';
import { Users, UserCheck, GraduationCap, CalendarPlus, ArrowUpRight } from 'lucide-react';
import type { StudentStats } from '../../../types/models';

interface StudentStatsCardsProps {
  stats: StudentStats | null;
  loading?: boolean;
  activeStatusFilter: string;
  onFilterByStatus: (status: string) => void;
}

export const StudentStatsCards: React.FC<StudentStatsCardsProps> = ({
  stats,
  loading = false,
  activeStatusFilter,
  onFilterByStatus,
}) => {
  const cards = [
    {
      id: 'all',
      statusValue: '',
      title: 'Total Students',
      count: stats?.total ?? 0,
      description: 'Institutional headcount across campuses',
      icon: Users,
      accentColor: 'text-[#73111b]',
      badgeBg: 'bg-[#fff1f2] text-[#73111b] border-[#fecdd3]',
      iconBg: 'bg-[#fff1f2] text-[#73111b]',
      hoverBorder: 'hover:border-[#73111b]/30',
      activeRing: activeStatusFilter === '' ? 'ring-2 ring-[#73111b] bg-rose-50/20' : '',
    },
    {
      id: 'active',
      statusValue: 'active',
      title: 'Active Learners',
      count: stats?.active ?? 0,
      description: 'Currently attending active cohorts',
      icon: UserCheck,
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      activeRing: activeStatusFilter === 'active' ? 'ring-2 ring-emerald-600 bg-emerald-50/20' : '',
    },
    {
      id: 'completed',
      statusValue: 'completed',
      title: 'Graduated / Alumni',
      count: stats?.completed ?? 0,
      description: 'Completed certification curriculum',
      icon: GraduationCap,
      accentColor: 'text-indigo-700',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      hoverBorder: 'hover:border-indigo-300',
      activeRing: activeStatusFilter === 'completed' ? 'ring-2 ring-indigo-600 bg-indigo-50/20' : '',
    },
    {
      id: 'new_admissions',
      statusValue: 'new_this_month',
      title: 'New Admissions',
      count: stats?.new_this_month ?? 0,
      description: 'Enrolled within current calendar month',
      icon: CalendarPlus,
      accentColor: 'text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600',
      hoverBorder: 'hover:border-amber-300',
      activeRing: activeStatusFilter === 'new_this_month' ? 'ring-2 ring-amber-600 bg-amber-50/20' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = card.statusValue === activeStatusFilter;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              if (card.statusValue === 'new_this_month') {
                onFilterByStatus(isActive ? '' : 'new_this_month');
              } else {
                onFilterByStatus(isActive ? '' : card.statusValue);
              }
            }}
            className={`group relative text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all duration-200 hover:shadow-md ${card.hoverBorder} ${card.activeRing}`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg} transition group-hover:scale-105`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeBg}`}>
                {isActive ? 'Filtered' : 'Filter'}
                <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? (
                    <span className="inline-block h-7 w-12 animate-pulse bg-slate-200 rounded-md" />
                  ) : (
                    card.count.toLocaleString()
                  )}
                </span>
                <span className="text-[11px] font-medium text-slate-400">students</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-1">
                {card.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

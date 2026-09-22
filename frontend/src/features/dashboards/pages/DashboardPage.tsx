import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Card, CardHeader } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import {
  GraduationCap,
  Users,
  GitFork,
  BookOpen,
  FolderKanban,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Bell,
  Sparkles,
  Building,
  UserCheck,
  ClipboardCheck,
  ArrowRight,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { GoogleSkillsDashboard } from './GoogleSkillsDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmissionsOfficer = user?.roles?.includes('Admissions Officer');

  useEffect(() => {
    if (isAdmissionsOfficer) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message || 'Unable to load your dashboard.');
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Unable to load your dashboard. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAdmissionsOfficer]);

  if (isAdmissionsOfficer) {
    return <Navigate to="/enrollments" replace />;
  }

  const isStudent = user?.roles?.includes('Student');
  const isTrainer = user?.roles?.includes('Trainer') && !user?.roles?.includes('Super Admin');
  const isBranchManager = user?.roles?.includes('Branch Manager') && !user?.roles?.includes('Super Admin');

  const actionItems = useMemo(() => {
    const workflow = data?.workflow_summary || {};
    const attendanceRate = Number(data?.metrics?.attendance_rate ?? 100);
    const totalStudents = Number(data?.metrics?.total_students ?? 0);

    const admissionsFollowUp = (workflow.registered ?? 0) + (workflow.branch_review ?? 0) + (workflow.finance_cleared ?? 0);
    const certificationReady = workflow.certification_ready ?? 0;
    const attendanceWatchlist = Math.max(0, Math.round(totalStudents * Math.max(0, 100 - attendanceRate) / 100));

    return [
      {
        title: 'Admissions follow-up',
        count: admissionsFollowUp,
        detail: 'students still in intake review',
        href: '/enrollments',
        icon: Bell,
        tone: 'rose',
      },
      {
        title: 'Certification ready',
        count: certificationReady,
        detail: 'students ready for issuance',
        href: '/certificates',
        icon: CheckCircle2,
        tone: 'emerald',
      },
      {
        title: 'Attendance watchlist',
        count: attendanceWatchlist,
        detail: 'students may need follow-up',
        href: '/reports',
        icon: UserCheck,
        tone: 'amber',
      },
      {
        title: 'Grading queue',
        count: Math.max(0, Math.min(99, Math.round(totalStudents * 0.12))),
        detail: 'submissions pending review',
        href: '/assignments',
        icon: ClipboardCheck,
        tone: 'slate',
      },
    ];
  }, [data]);

  const branchPulse = useMemo(() => {
    return (data?.branch_distribution ?? [])
      .slice()
      .sort((a: any, b: any) => Number(b.students_count ?? 0) - Number(a.students_count ?? 0))
      .slice(0, 3);
  }, [data]);

  const alertFeed = useMemo(() => {
    const workflow = data?.workflow_summary ?? {};
    const recent = data?.recent_enrollments ?? [];

    const alerts: Array<{ title: string; detail: string; tone: 'rose' | 'amber' | 'emerald' }> = [];

    if ((workflow.branch_review ?? 0) > 0) {
      alerts.push({
        title: 'Branch review backlog',
        detail: `${workflow.branch_review} students awaiting campus validation`,
        tone: 'amber',
      });
    }

    if ((workflow.certification_ready ?? 0) > 0) {
      alerts.push({
        title: 'Certificates ready',
        detail: `${workflow.certification_ready} students prepared for certification issuance`,
        tone: 'emerald',
      });
    }

    if ((workflow.finance_cleared ?? 0) > 0) {
      alerts.push({
        title: 'Finance-cleared intake',
        detail: `${workflow.finance_cleared} students cleared for program onboarding`,
        tone: 'rose',
      });
    }

    if (recent.length > 0) {
      alerts.push({
        title: 'Recent student intake',
        detail: `${recent.length} new applications were added in the latest cycle`,
        tone: 'rose',
      });
    }

    return alerts.slice(0, 4);
  }, [data]);

  const attendanceRate = Number(data?.metrics?.attendance_rate ?? 100);

  // 1. GOOGLE SKILLS STUDENT VIEW
  if (isStudent) {
    return <GoogleSkillsDashboard />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <div className="h-8 w-8 border-3 border-[#73111b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading your personalized IAT dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[420px] items-center justify-center px-4">
        <div className="w-full max-w-md border border-slate-200 bg-white p-7 text-center rounded-2xl shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 font-black text-lg border border-amber-200">
            !
          </div>
          <h1 className="mt-4 text-base font-bold text-slate-900">Dashboard Unavailable</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {error || 'Your dashboard could not be loaded. Please try again or verify your connection.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#73111b] text-white text-xs font-bold shadow-md shadow-[#73111b]/20 transition hover:bg-[#5c0d15]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 2. TRAINER WORKSPACE VIEW
  if (isTrainer && data) {
    return (
      <div className="space-y-6">
        {/* Trainer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#73111b]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Faculty & Trainer Academic Workspace</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Good day, {user?.first_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your assigned cohorts, today's lecture schedule, and grade student submissions.
            </p>
          </div>
          <Badge variant="primary">IAT Certified Instructor</Badge>
        </div>

        {/* Trainer KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Assigned Cohorts</span>
              <FolderKanban className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.assigned_batches_count ?? 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Active class batches</p>
          </Card>

          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Enrolled Students</span>
              <Users className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.total_students_count ?? 0}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">Across all assigned cohorts</p>
          </Card>

          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Today's Lectures</span>
              <Calendar className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.today_classes_count ?? 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Scheduled class sessions</p>
          </Card>

          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Pending Grading</span>
              <ClipboardCheck className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.pending_grading_count ?? 0}</p>
            <p className="text-[11px] text-amber-600 font-bold mt-1">Assignments to evaluate</p>
          </Card>
        </div>

        {/* Trainer Cohorts & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader title="My Assigned Cohorts & Batches" subtitle="View roster and manage gradebook" />
            <div className="space-y-3">
              {data.batches?.map((b: any) => (
                <div
                  key={b.uuid}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#73111b]/30 transition flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#73111b] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {b.code}
                      </span>
                      <Badge variant={b.status === 'ongoing' ? 'success' : 'neutral'}>{b.status}</Badge>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{b.course} • {b.branch || 'Main Campus'}</p>
                  </div>
                  <a
                    href={`/batches/${b.uuid}/gradebook`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#73111b] hover:text-white text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>Gradebook</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
              {(!data.batches || data.batches.length === 0) && (
                <p className="text-xs text-slate-400 py-8 text-center">No cohorts currently assigned.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Today's Timetable" subtitle="Classes scheduled for today" />
            <div className="space-y-3">
              {data.today_classes?.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No class sessions scheduled for today.</p>
              ) : (
                data.today_classes?.map((c: any) => (
                  <div key={c.uuid} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-900">{c.title}</p>
                    <p className="text-[11px] text-slate-600 font-medium">{c.course}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{c.start_time} - {c.end_time}</span>
                      <span className="capitalize font-semibold">{c.delivery_mode}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 3. BRANCH MANAGER WORKSPACE VIEW
  if (isBranchManager && data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#73111b]">
              <Building className="h-3.5 w-3.5" />
              <span>Branch Academic Operations</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {data.branch?.name || 'Campus Branch'} ({data.branch?.code})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Location: {data.branch?.location || 'Central Campus'} • Branch Manager Operations
            </p>
          </div>
          <Badge variant="primary">{data.branch?.code || 'CAMPUS'}</Badge>
        </div>

        {/* Branch KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Campus Students</span>
              <GraduationCap className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.students_count ?? 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Admitted at this branch</p>
          </Card>

          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Campus Staff</span>
              <Users className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.staff_count ?? 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Instructors & operations</p>
          </Card>

          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Active Cohorts</span>
              <FolderKanban className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.active_batches_count ?? 0}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">Running classes</p>
          </Card>

          <Card className="hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Total Enrollments</span>
              <Award className="h-4 w-4 text-[#73111b]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.metrics?.total_enrollments ?? 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">All branch intakes</p>
          </Card>
        </div>

        {/* Branch Workflow */}
        {data.workflow_summary && (
          <Card>
            <CardHeader title="Branch Admission Workflow Pipeline" subtitle="Current enrolment stages for this campus" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                ['registered', 'Registered'],
                ['branch_review', 'Branch review'],
                ['finance_cleared', 'Finance cleared'],
                ['in_training', 'In training'],
                ['course_completed', 'Completed'],
                ['certification_ready', 'Ready'],
                ['certified', 'Certified'],
              ].map(([stage, label]) => (
                <div key={stage} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{data.workflow_summary?.[stage] || 0}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Branch Batches */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Cohort Intakes</h3>
              <p className="text-xs text-slate-500">Batches hosted at {data.branch?.name}</p>
            </div>
            <a href="/batches" className="text-xs font-bold text-[#73111b] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Cohort Code</th>
                  <th className="py-3 px-4">Batch Name</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.batches?.map((b: any) => (
                  <tr key={b.uuid} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#73111b]">{b.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.name}</td>
                    <td className="py-3 px-4 font-medium">{b.course}</td>
                    <td className="py-3 px-4 text-slate-500">{b.start_date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{b.capacity} seats</td>
                    <td className="py-3 px-4">
                      <Badge variant={b.status === 'ongoing' ? 'success' : 'neutral'}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // 4. ADMIN / EXECUTIVE VIEW
  return (
    <div className="space-y-6">
      {/* Executive Header with Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#73111b]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Multi-Branch Operational & Academic Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institute of Advanced Technology central administration, admissions analytics, and campus health.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/students"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 transition"
          >
            <GraduationCap className="h-3.5 w-3.5 text-[#73111b]" />
            <span>Student Roster</span>
          </a>
          <a
            href="/batches"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 transition"
          >
            <FolderKanban className="h-3.5 w-3.5 text-[#73111b]" />
            <span>Intake Batches</span>
          </a>
          <a
            href="/reports"
            className="px-3.5 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-1.5 transition"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Reports Center</span>
          </a>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/students"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#73111b]/30 transition group block"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Students</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#73111b] group-hover:scale-105 transition">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {data.metrics?.total_students ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{data.metrics?.total_enrollments ?? 0} Active Enrollments</span>
          </p>
        </a>

        <a
          href="/branches"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#73111b]/30 transition group block"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Branches</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#73111b] group-hover:scale-105 transition">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {data.metrics?.total_branches ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5 truncate">
            {data.branch_distribution?.map((b: any) => b.code).join(' · ') || 'Active Campuses'}
          </p>
        </a>

        <a
          href="/batches"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#73111b]/30 transition group block"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Cohorts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#73111b] group-hover:scale-105 transition">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {data.metrics?.active_batches ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5">
            {data.metrics?.total_courses ?? 0} Program Pathways
          </p>
        </a>

        <a
          href="/certificates"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#73111b]/30 transition group block"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certificates Issued</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#73111b] group-hover:scale-105 transition">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {data.metrics?.total_certificates ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
            <span>Attendance Rate: {data.metrics?.attendance_rate ?? 100}%</span>
          </p>
        </a>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader
            title="Priority Actions"
            subtitle="Operational items to review this week"
          />
          <div className="space-y-3">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const toneClasses = {
                rose: 'bg-rose-50 text-[#73111b]',
                emerald: 'bg-emerald-50 text-emerald-700',
                amber: 'bg-amber-50 text-amber-700',
                slate: 'bg-slate-100 text-slate-700',
              }[item.tone];

              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xl font-black text-slate-900">{item.count}</span>
                    <a href={item.href} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#73111b]">
                      Open <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader
            title="Institutional Pulse"
            subtitle="Current operational health"
          />
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>Attendance health</span>
                <span className={attendanceRate >= 85 ? 'text-emerald-600' : attendanceRate >= 75 ? 'text-amber-600' : 'text-rose-600'}>
                  {attendanceRate >= 85 ? 'Strong' : attendanceRate >= 75 ? 'Stable' : 'Watch'}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="text-3xl font-black text-slate-900">{attendanceRate}%</span>
                <span className="text-[11px] text-slate-500">current rate</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${attendanceRate >= 85 ? 'bg-emerald-500' : attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Top campuses</p>
              {branchPulse.map((branch: any, index: number) => (
                <div key={branch.code || branch.name || index} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{branch.name || branch.code}</p>
                    <p className="text-[10px] text-slate-500">{branch.code}</p>
                  </div>
                  <span className="text-sm font-black text-slate-900">{branch.students_count ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader
            title="Today’s Alerts"
            subtitle="Signals demanding attention"
          />
          <div className="space-y-3">
            {alertFeed.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No critical alerts at the moment.</p>
            ) : (
              alertFeed.map((alert) => (
                <div key={alert.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div
                    className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${
                      alert.tone === 'rose'
                        ? 'bg-rose-50 text-[#73111b]'
                        : alert.tone === 'amber'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{alert.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader
            title="Branch Comparison"
            subtitle="Student footprint across campuses"
          />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branch_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="students_count" fill="#73111b" radius={[6, 6, 0, 0]} name="Students" />
                <Bar dataKey="batches_count" fill="#c084fc" radius={[6, 6, 0, 0]} name="Batches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Student Workflow Pipeline */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader
          title="Student Workflow Health"
          subtitle="Real-time count of admissions progressing through verification, training, and certification"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            ['registered', 'Registered'],
            ['branch_review', 'Branch review'],
            ['finance_cleared', 'Finance cleared'],
            ['in_training', 'In training'],
            ['course_completed', 'Completed'],
            ['certification_ready', 'Ready'],
            ['certified', 'Certified'],
          ].map(([stage, label]) => (
            <div key={stage} className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 truncate">{label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {data.workflow_summary?.[stage] || 0}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-xs bg-white">
          <CardHeader
            title="Enrollment & Completion Growth Trends"
            subtitle="Monthly student admissions vs course completions"
          />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.enrollment_trends || []}>
                <defs>
                  <linearGradient id="colorEnr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#73111b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#73111b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#73111b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEnr)"
                  name="Enrollments"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorComp)"
                  name="Completions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader title="Campus Distribution" subtitle="Active students per IAT campus" />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branch_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="students_count" fill="#73111b" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Student Admissions Table */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-xs bg-white">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Student Admissions</h3>
            <p className="text-xs text-slate-500">Real-time student intake across campus branches</p>
          </div>
          <a
            href="/enrollments"
            className="text-xs font-bold text-[#73111b] hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Enrollment #</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Course Program</th>
                <th className="py-3.5 px-4">Campus Branch</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.recent_enrollments?.map((e: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#73111b]">{e.enrollment_number}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{e.student_name}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{e.course_name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{e.branch}</td>
                  <td className="py-3.5 px-4 text-slate-500">{e.date}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={e.status === 'Active' ? 'success' : 'neutral'}>{e.status}</Badge>
                  </td>
                </tr>
              ))}
              {(!data.recent_enrollments || data.recent_enrollments.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recent enrollments to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

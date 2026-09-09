import React, { useEffect, useState } from 'react';
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

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-slate-400">
        Loading personalized IAT dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[420px] items-center justify-center px-4">
        <div className="w-full max-w-md border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">!</div>
          <h1 className="mt-4 text-base font-semibold text-slate-900">Dashboard unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error || 'Your dashboard could not be loaded.'}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-5 border border-[#0f766e] px-4 py-2 text-xs font-bold text-[#0f766e] transition hover:bg-[#0f766e] hover:text-white">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isStudent = user?.roles?.includes('Student');
  const isTrainer = user?.roles?.includes('Trainer') && !user?.roles?.includes('Super Admin');

  // 1. STUDENT VIEW
  if (isStudent && data) {
    return (
      <div className="space-y-5">
        <section className="relative overflow-hidden border border-slate-200 bg-white px-5 py-6 sm:px-8 sm:py-7 shadow-sm">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#0f766e]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f766e]">Student workspace</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Good to see you, {user?.first_name}.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Keep your learning on track, review your next milestone, and stay ready for your upcoming class.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">{data.student?.student_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active enrolments</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{data.workflow?.length || 0} programme{data.workflow?.length === 1 ? '' : 's'}</p>
              </div>
              <a href="/my-courses" className="inline-flex items-center gap-2 border border-[#0f766e] px-3.5 py-2 text-xs font-bold text-[#0f766e] transition hover:bg-[#0f766e] hover:text-white">
                Open my courses <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {data.notifications?.length > 0 && (
          <section className="border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm sm:px-6">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Recent updates</p>
                {data.notifications.map((notification: any) => (
                  <div key={notification.id}>
                    <p className="text-sm font-bold text-emerald-950">{notification.title}</p>
                    <p className="text-xs leading-5 text-emerald-900">{notification.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader title="Course Learning Progress" subtitle="Derived from completed curriculum modules and lessons" />
              <div className="space-y-4">
                {data.progress?.map((prog: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900">{prog.course_name}</span>
                      <span className="text-sm font-bold text-[#73111b]">{prog.progress_percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-[#73111b] to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${prog.progress_percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{prog.completed_lessons} of {prog.total_lessons} Lessons Completed</span>
                      <span>{prog.completed_modules} of {prog.total_modules} Modules Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader title="Admission to Certification" subtitle="Your enrollment approvals and academic journey" />
              <div className="space-y-3">
                {data.workflow?.map((item: any, index: number) => {
                  const stages = ['registered', 'branch_review', 'finance_cleared', 'in_training', 'course_completed', 'certification_ready', 'certified'];
                  const labels: Record<string, string> = { registered: 'Registered', branch_review: 'Branch review', finance_cleared: 'Finance cleared', in_training: 'In training', course_completed: 'Course completed', certification_ready: 'Ready for certification', certified: 'Certified' };
                  const current = stages.indexOf(item.stage);
                  return (
                    <div key={item.enrollment_number} className="rounded-xl border border-slate-200 p-3.5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div><p className="text-xs font-bold text-slate-900">{item.course_name}</p><p className="text-[11px] text-slate-500">{item.enrollment_number}</p></div>
                        <Badge variant={item.stage === 'certified' ? 'success' : 'primary'}>{labels[item.stage]}</Badge>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {stages.map((stage, stageIndex) => (
                          <div key={stage} title={labels[stage]} className={`h-2 rounded-full ${stageIndex <= current ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Next: {current < stages.length - 1 ? labels[stages[current + 1]] : 'Complete'}</div>
                      {data.enrollments?.find((enrollment: any) => enrollment.enrollment_number === item.enrollment_number) && (() => {
                        const enrollment = data.enrollments.find((candidate: any) => candidate.enrollment_number === item.enrollment_number);
                        return (
                          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px]">
                            <div><span className="block text-slate-400">Time remaining</span><strong className="text-slate-700">{enrollment.days_remaining === null ? 'No deadline set' : `${enrollment.days_remaining} days`}</strong></div>
                            <div><span className="block text-slate-400">Next action</span><strong className="text-slate-700">{enrollment.next_action}</strong></div>
                            <div><span className="block text-slate-400">Lessons remaining</span><strong className="text-slate-700">{enrollment.lessons_remaining}</strong></div>
                            <div><span className="block text-slate-400">Course ends</span><strong className="text-slate-700">{enrollment.end_date || 'To be scheduled'}</strong></div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
                {(!data.workflow || data.workflow.length === 0) && <p className="py-4 text-center text-xs text-slate-400">No enrollment workflow is available yet.</p>}
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader title="Upcoming Class Timetable" subtitle="Live classes and physical lab sessions" />
              <div className="space-y-3">
                {data.upcoming_classes?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No upcoming class sessions scheduled.</p>
                ) : (
                  data.upcoming_classes?.map((cls: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#73111b]">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{cls.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {cls.date} • {cls.start_time} - {cls.end_time} • {cls.delivery_mode} ({cls.location || 'Online'})
                          </p>
                        </div>
                      </div>
                      {cls.meeting_url && (
                        <a
                          href={cls.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold shadow-xs"
                        >
                          Join Class
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader title="Quizzes & CATs" subtitle="Upcoming assessments" />
              <div className="space-y-3">
                {data.assessments?.map((ass: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <Badge variant={ass.type === 'Quiz' ? 'primary' : 'warning'}>{ass.type}</Badge>
                      <span className="text-[11px] font-bold text-slate-600">{ass.total_marks} Marks</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-2">{ass.title}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Time Limit: {ass.time_limit || 'Untimed'} mins</span>
                      <a
                        href="/my-assessments"
                        className="text-[#73111b] hover:underline font-bold inline-flex items-center gap-1"
                      >
                        Start <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN / EXECUTIVE VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500">Institute of Advanced Technology multi-branch operational KPIs and performance analytics.</p>
        </div>
        <Badge variant="primary">Institute of Advanced Technology</Badge>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Students</span>
            <GraduationCap className="h-4 w-4 text-[#73111b]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics?.total_students}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +18.4% from last cohort
          </p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Campus Branches</span>
            <GitFork className="h-4 w-4 text-[#73111b]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics?.total_branches}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Nairobi, Embu, Meru, Mombasa</p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Active Cohorts</span>
            <FolderKanban className="h-4 w-4 text-[#73111b]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics?.active_batches}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">{data.metrics?.total_enrollments} Active Enrollments</p>
        </Card>

        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Issued Certificates</span>
            <Award className="h-4 w-4 text-[#73111b]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics?.total_certificates}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Attendance Rate: {data.metrics?.attendance_rate}%</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Student Workflow Health" subtitle="Current position from registration through certification" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[['registered', 'Registered'], ['branch_review', 'Branch review'], ['finance_cleared', 'Finance cleared'], ['in_training', 'In training'], ['course_completed', 'Completed'], ['certification_ready', 'Ready'], ['certified', 'Certified']].map(([stage, label]) => (
            <div key={stage} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{data.workflow_summary?.[stage] || 0}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Enrollment & Completion Growth Trends" subtitle="Monthly student admissions vs course completions" />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.enrollment_trends}>
                <defs>
                  <linearGradient id="colorEnr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#73111b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#73111b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="enrollments" stroke="#73111b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnr)" name="Enrollments" />
                <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComp)" name="Completions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Campus Distribution" subtitle="Active students per IAT campus" />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branch_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="students_count" fill="#73111b" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Student Admissions</h3>
            <p className="text-xs text-slate-500">Real-time student intake across campus branches</p>
          </div>
          <a href="/enrollments" className="text-xs font-bold text-[#73111b] hover:underline inline-flex items-center gap-1">
            View All <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Enrollment #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Campus Branch</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.recent_enrollments?.map((e: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-[#73111b] font-mono">{e.enrollment_number}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{e.student_name}</td>
                  <td className="py-3 px-4 font-medium">{e.course_name}</td>
                  <td className="py-3 px-4 text-slate-600">{e.branch}</td>
                  <td className="py-3 px-4 text-slate-500">{e.date}</td>
                  <td className="py-3 px-4">
                    <Badge variant={e.status === 'Active' ? 'success' : 'neutral'}>{e.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

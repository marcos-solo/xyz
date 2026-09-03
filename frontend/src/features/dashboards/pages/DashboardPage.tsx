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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
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

  const isStudent = user?.roles?.includes('Student');
  const isTrainer = user?.roles?.includes('Trainer') && !user?.roles?.includes('Super Admin');

  // 1. STUDENT VIEW
  if (isStudent && data) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#73111b] via-[#881337] to-[#9f1239] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#73111b]/15">
          <Badge variant="maroon">Student Portal</Badge>
          <h1 className="text-xl sm:text-2xl font-bold mt-2">
            Welcome back, {user?.first_name}! 🎓
          </h1>
          <p className="text-xs text-rose-100 mt-1 max-w-lg">
            Student ID: <span className="font-bold underline">{data.student?.student_number}</span> • Track your course curriculum progress, upcoming class sessions, and practical assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
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

            <Card>
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

          <div className="space-y-6">
            <Card>
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

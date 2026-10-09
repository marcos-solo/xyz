import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  Clock,
  ArrowRight,
  Flame,
  Maximize2,
  X,
  Sparkles,
  Calendar,
  Award,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Compass,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  Bell,
  FileText,
  Trophy,
  Mail,
  Clock3,
  UserRound,
} from 'lucide-react';

interface ActivityItem {
  uuid: string;
  code: string;
  title: string;
  short_description?: string;
  type: 'Path' | 'Course';
  learning_path?: {
    uuid: string;
    name: string;
    code?: string;
  } | null;
  is_featured: boolean;
  duration_text: string;
  progress_percentage: number;
  modules_count?: number;
  first_lesson_uuid?: string;
}

interface LearningPathItem {
  uuid: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: number;
  duration_unit: string;
  courses_count: number;
  progress_percentage: number;
  courses: {
    uuid: string;
    code: string;
    name: string;
    level: string;
    duration: string;
    first_lesson_uuid?: string;
  }[];
}

interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  progress_percentage: number;
  badge_color: string;
}

interface CourseTimelineStep {
  type: string;
  title: string;
  coverage: string | null;
  start_date: string;
  end_date: string;
  is_estimate: boolean;
  status: 'past' | 'current' | 'upcoming';
}

interface StudentEnrollment {
  uuid: string;
  batch_name: string;
  course_name: string;
  status: string;
  workflow_stage: string;
  start_date: string | null;
  end_date: string | null;
  progress_percentage: number;
  trainers?: { uuid: string; name: string; email?: string; phone?: string; role?: string }[];
  course_timeline: CourseTimelineStep[];
}

const formatScheduleDate = (value?: string | null) => {
  if (!value) return 'Date pending';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export const GoogleSkillsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [communityUrl, setCommunityUrl] = useState('');
  const [academicSupportEmail, setAcademicSupportEmail] = useState('');
  const [queryResponseTime, setQueryResponseTime] = useState('Within 2 business days');
  const [activeTab, setActiveTab] = useState<'activities' | 'paths' | 'academic'>('activities');
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [portalNotifications, setPortalNotifications] = useState<any[]>([]);

  // Cohort Quality Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackPeriod, setFeedbackPeriod] = useState<'beginning' | 'middle' | 'exit'>('beginning');
  const [feedbackUnitCode, setFeedbackUnitCode] = useState('CL');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Course Delivery');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setDashboardData(res.data.data);
          setPortalNotifications(res.data.data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    api.get('/organization')
      .then((response) => {
        const organization = response.data.data;
        setCommunityUrl(organization?.settings?.learning_community_url || '');
        setAcademicSupportEmail(organization?.settings?.academic_support_email || organization?.email || '');
        setQueryResponseTime(organization?.settings?.query_response_time || 'Within 2 business days');
      })
      .catch((err) => console.error('Failed to load community link:', err));
  }, []);

  const dismissNotification = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setPortalNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleSubmitCohortFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const enrolledBatch = dashboardData?.batches?.[0];
    try {
      setSubmittingFeedback(true);
      await api.post('/feedbacks', {
        batch_id: enrolledBatch?.id,
        batch_uuid: enrolledBatch?.uuid,
        period: feedbackPeriod,
        unit_code: feedbackUnitCode,
        rating: feedbackRating,
        category: feedbackCategory,
        comments: feedbackComments,
        metrics: {
          period: feedbackPeriod,
          unit: feedbackUnitCode,
          student: user?.full_name,
        },
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setFeedbackSuccess(false);
        setFeedbackComments('');
      }, 1800);
    } catch (err) {
      console.error('Failed to submit cohort feedback:', err);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setFeedbackSuccess(false);
      }, 1800);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <div className="h-8 w-8 border-3 border-[#73111b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">
          Loading your learning workspace...
        </span>
      </div>
    );
  }

  const gamification = dashboardData?.gamification || {
    points: 0,
    current_streak: 0,
    streak_days: [],
    achievements: [],
  };

  // Real IAT courses from dashboard API
  const activities: ActivityItem[] = dashboardData?.activities || [];
  const learningPaths: LearningPathItem[] = dashboardData?.learning_paths || [];
  const enrollments: StudentEnrollment[] = dashboardData?.enrollments || [];
  const latestEnrollment = [...enrollments].sort((first, second) =>
    (second.start_date || '').localeCompare(first.start_date || ''),
  );
  const coursePlanEnrollment =
    latestEnrollment.find((enrollment) => enrollment.workflow_stage === 'in_training') ||
    latestEnrollment.find((enrollment) => ['registered', 'branch_review', 'finance_cleared'].includes(enrollment.workflow_stage)) ||
    latestEnrollment.find((enrollment) => enrollment.status === 'Active') ||
    latestEnrollment[0];

  const handleLaunchActivity = (activity: ActivityItem) => {
    navigate(`/learn/${activity.uuid}`);
  };

  return (
    <div className="space-y-6">
      {/* Official In-Portal Notifications Banner */}
      {portalNotifications.length > 0 && (
        <div className="space-y-3">
          {portalNotifications.slice(0, 2).map((n) => (
            <div
              key={n.id}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#fff1f2] via-rose-50 to-white border border-[#fecdd3] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-[#73111b] text-white flex items-center justify-center shrink-0 shadow-xs">
                  {n.type === 'enrollment_approved' ? (
                    <GraduationCap className="h-5 w-5" />
                  ) : n.type === 'feedback_window_open' ? (
                    <Calendar className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#73111b] border border-[#fecdd3]">
                      Official Notice
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                    {n.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {n.type === 'feedback_window_open' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackPeriod(n.data?.period || 'beginning');
                      setFeedbackModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
                  >
                    Give Feedback
                  </button>
                )}
                {n.type === 'enrollment_approved' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('academic')}
                    className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
                  >
                    View Timetable
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismissNotification(n.id)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-rose-100/50 transition"
                  title="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Welcome Card (Google Skills layout in IAT Theme) */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xs p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#73111b]" />

        {/* Left: Geometric Academic Artwork in IAT palette */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-2xs" fill="none">
              <circle cx="80" cy="80" r="72" fill="#fff1f2" />
              <ellipse cx="80" cy="72" rx="44" ry="34" fill="#73111b" />
              <circle cx="80" cy="72" r="16" fill="#ffffff" />
              <circle cx="80" cy="72" r="8" fill="#5c0d15" />
              <path d="M40 120 L80 148 L120 120 Z" fill="#f59e0b" />
              <circle cx="118" cy="48" r="12" fill="#10b981" />
              <circle cx="42" cy="52" r="7" fill="#73111b" />
            </svg>
          </div>

          <div className="max-w-xl">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              Start now to set your priorities and progress toward your goals with a clear, structured plan.
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Keep your training on track, review practical lab lessons, and maintain your daily learning streak.
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/catalog')}
            className="px-6 py-2.5 rounded-full bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold shadow-md shadow-[#73111b]/20 transition active:scale-95"
          >
            Explore catalog
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-[#73111b]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">My course plan</h2>
              <p className="text-[11px] text-slate-500">Course progress against your intake dates, from onboarding to mock exam.</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">Coverage windows are planned across the batch period.</p>
        </div>

        {coursePlanEnrollment ? (() => {
          const enrollment = coursePlanEnrollment;
          const progress = Math.min(100, Math.max(0, enrollment.progress_percentage || 0));
          const timeline = enrollment.course_timeline || [];
          const currentStepIndex = Math.max(0, timeline.findIndex((step) => step.status === 'current'));
          const progressStepIndex = timeline.length > 0
            ? Math.min(timeline.length - 1, Math.floor((progress / 100) * timeline.length))
            : -1;

          return (
            <details key={enrollment.uuid} open className="group border-b border-slate-100 last:border-b-0">
              <summary className="flex cursor-pointer list-none flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">{enrollment.course_name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {enrollment.batch_name} · {formatScheduleDate(enrollment.start_date)} – {formatScheduleDate(enrollment.end_date)}
                  </p>
                </div>
                <div className="flex w-full items-center gap-3 sm:w-64">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#73111b] transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="w-10 text-right font-mono text-[11px] font-bold text-[#73111b]">{Math.round(progress)}%</span>
                </div>
              </summary>

              {timeline.length > 0 ? (
                <div className="px-5 pb-5 pt-2">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Your route to the mock exam</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">Each step is a scheduled stage in your intake.</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-[#73111b]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#73111b]" />
                      {Math.round(progress)}% along the course
                    </span>
                  </div>

                  <ol className="grid grid-cols-2 items-end gap-x-2 gap-y-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {timeline.map((step, stepIndex) => {
                      const isPast = step.status === 'past';
                      const isCurrent = step.status === 'current';
                      const isProgressMarker = stepIndex === progressStepIndex;
                      const stairHeight = 52 + ((stepIndex % 3) * 22);

                      return (
                        <li key={`${step.type}-${stepIndex}`} className="relative min-w-0 pt-5" style={{ minHeight: `${stairHeight + 188}px` }}>
                          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
                            <div className="relative z-10 mb-2 flex min-h-24 w-full flex-col justify-end px-1 text-center">
                              {isProgressMarker && (
                                <span className="mx-auto mb-1 rounded-full bg-[#73111b] px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                                  You are here
                                </span>
                              )}
                              <p className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-800 sm:text-[11px]">{step.title}</p>
                              <p className="mt-1 text-[9px] leading-tight text-slate-500">
                                {formatScheduleDate(step.start_date)}
                                {step.end_date !== step.start_date ? ` – ${formatScheduleDate(step.end_date)}` : ''}
                              </p>
                              {step.coverage && <p className="mt-1 line-clamp-2 text-[9px] leading-tight text-slate-400">{step.coverage}</p>}
                              {step.type === 'mock_exam' && step.is_estimate && <span className="mt-1 text-[8px] font-bold text-amber-700">Date to confirm</span>}
                            </div>
                            <div
                              className={`relative flex w-full items-start justify-center border-x border-t px-2 pt-2 ${
                                isPast
                                  ? 'border-emerald-700 bg-emerald-600 text-white'
                                  : isCurrent
                                    ? 'border-[#73111b] bg-[#73111b] text-white shadow-[0_0_0_3px_rgba(115,17,27,0.12)]'
                                    : 'border-slate-300 bg-slate-100 text-slate-500'
                              }`}
                              style={{ height: `${stairHeight}px` }}
                            >
                              {isCurrent ? (
                                <span className="absolute -top-3 h-3 w-3 rotate-45 border-l-2 border-t-2 border-[#73111b] bg-white" />
                              ) : null}
                              <span className="text-[9px] font-black tabular-nums">{String(stepIndex + 1).padStart(2, '0')}</span>
                              {isPast && <CheckCircle2 className="ml-1 h-3 w-3" />}
                              {isCurrent && <span className="ml-1 text-[8px] font-bold uppercase">Current</span>}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    <li className="relative flex min-h-60 flex-col items-center justify-end pb-2">
                      <div className="mb-2 text-center">
                        <p className="text-[10px] font-black uppercase text-amber-700">Goal</p>
                        <p className="text-[10px] font-bold text-slate-800">Qualification</p>
                      </div>
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${progress >= 100 ? 'border-amber-500 bg-amber-100 text-amber-600' : 'border-amber-200 bg-amber-50 text-amber-500'}`}>
                        <Trophy className="h-8 w-8" />
                      </div>
                      <div className={`mt-2 h-12 w-full border-x border-t ${progress >= 100 ? 'border-amber-600 bg-amber-500' : 'border-amber-300 bg-amber-100'}`} />
                    </li>
                  </ol>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> Completed stage</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#73111b]" /> Current stage {timeline[currentStepIndex]?.title ? `· ${timeline[currentStepIndex].title}` : ''}</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> Upcoming stage</span>
                  </div>
                </div>
              ) : (
                <p className="px-5 pb-5 text-xs text-slate-500">Course dates or curriculum coverage have not been published for this intake yet.</p>
              )}
            </details>
          );
        })() : (
          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Your course plan will appear here after you join an intake.</p>
            <button type="button" onClick={() => navigate('/catalog')} className="self-start text-xs font-bold text-[#73111b] hover:underline sm:self-auto">
              Browse courses
            </button>
          </div>
        )}
      </section>

      {coursePlanEnrollment && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-2xs" aria-labelledby="student-support-title">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-[#73111b]" />
              <div>
                <h2 id="student-support-title" className="text-sm font-bold text-slate-900">Who to contact</h2>
                <p className="text-[11px] text-slate-500">Choose the right route for your course question.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <Clock3 className="h-3.5 w-3.5 text-[#73111b]" />
              Expected reply: {queryResponseTime}
            </span>
          </div>
          <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <p className="text-xs font-bold text-slate-800">Lecture questions</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Ask about a lecture, lesson notes, or something explained in class in that module’s private discussion. Your assigned trainer can see it.</p>
              <div className="mt-3 space-y-2">
                {coursePlanEnrollment.trainers?.length ? coursePlanEnrollment.trainers.map((trainer) => (
                  <div key={trainer.uuid} className="flex min-w-0 items-center gap-2 text-xs">
                    <UserRound className="h-4 w-4 shrink-0 text-[#73111b]" />
                    <span className="truncate font-semibold text-slate-700">{trainer.name}{trainer.role ? ` · ${trainer.role}` : ''}</span>
                    {trainer.email && <a className="ml-auto inline-flex shrink-0 items-center gap-1 font-bold text-[#73111b] hover:underline" href={`mailto:${trainer.email}`}><Mail className="h-3.5 w-3.5" />Email</a>}
                    {!trainer.email && trainer.phone && <a className="ml-auto shrink-0 font-bold text-[#73111b] hover:underline" href={`tel:${trainer.phone}`}>Call</a>}
                  </div>
                )) : <p className="text-[11px] text-slate-500">Open a lesson and use its Module discussion to reach your trainer.</p>}
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-slate-800">Syllabus & exam preparation</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">For syllabus coverage, exam technique, revision planning, or mock-exam preparation, contact Academic Support.</p>
              {academicSupportEmail ? (
                <a href={`mailto:${academicSupportEmail}`} className="mt-3 inline-flex max-w-full items-center gap-2 text-xs font-bold text-[#73111b] hover:underline">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{academicSupportEmail}</span>
                </a>
              ) : <p className="mt-3 text-[11px] font-semibold text-slate-600">Contact your assigned trainer through the module discussion.</p>}
            </div>
          </div>
        </section>
      )}

      {communityUrl && (
        <a
          href={communityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
        >
          <MessageSquare className="h-4 w-4" />
          Online learning community
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}

      {/* 2. Main Content & Right Gamification Column (Google Skills Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column (8 cols): Tabs & Activity Cards */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tabs navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`pb-2.5 text-sm font-semibold transition-all relative ${
                  activeTab === 'activities'
                    ? 'text-[#73111b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#73111b]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Activities
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paths')}
                className={`pb-2.5 text-sm font-semibold transition-all relative ${
                  activeTab === 'paths'
                    ? 'text-[#73111b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#73111b]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Paths
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={`pb-2.5 text-sm font-semibold transition-all relative ${
                  activeTab === 'academic'
                    ? 'text-[#73111b] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#73111b]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Timetable & Intakes
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {activeTab === 'paths'
                ? `${learningPaths.length} academic tracks`
                : `${activities.length} enrolled courses`}
            </span>
          </div>

          {/* Activities / Paths / Academic Grid */}
          {activeTab === 'paths' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningPaths.map((path) => (
                <div
                  key={path.uuid}
                  className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-[#73111b]/30 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                        <Compass className="h-3 w-3" />
                        Academic Track
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {path.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#73111b] transition">
                      {path.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {path.description || 'Structured academic track covering sequential curriculum requirements.'}
                    </p>

                    {/* Path Progress Bar */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700">Track Mastery</span>
                        <span className="font-mono font-bold text-[#73111b]">{Math.round(path.progress_percentage)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#73111b] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, path.progress_percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Sequence Courses */}
                    <div className="mt-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Courses in this Track ({path.courses.length})
                      </p>
                      <div className="space-y-1.5">
                        {path.courses.map((c) => (
                          <div
                            key={c.uuid}
                            onClick={() => navigate(`/learn/${c.uuid}`)}
                            className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white border border-slate-200/80 hover:border-[#73111b]/40 hover:bg-[#fff1f2]/30 cursor-pointer transition"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-[#73111b] text-[11px] shrink-0">{c.code}</span>
                              <span className="font-medium text-slate-800 truncate text-[11px]">{c.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{c.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Launch button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{path.duration} {path.duration_unit} total</span>
                    </div>

                    {path.courses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => navigate(`/learn/${path.courses[0].uuid}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#fff1f2] hover:bg-[#73111b] text-[#73111b] hover:text-white border border-[#fecdd3] text-xs font-bold transition shadow-2xs"
                      >
                        <span>Open Path</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {learningPaths.length === 0 && (
                <div className="col-span-2 py-16 text-center text-xs text-slate-400">
                  No learning paths assigned yet.
                </div>
              )}
            </div>
          ) : activeTab === 'activities' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((act) => (
                <div
                  key={act.uuid}
                  className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-[#73111b]/30 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {act.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                      {act.learning_path && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                          <Compass className="h-3 w-3" />
                          {act.learning_path.name}
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {act.code}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#73111b] transition">
                      {act.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {act.short_description || 'Comprehensive professional curriculum and practical lessons.'}
                    </p>
                  </div>

                  {/* Footer row: Duration & Circle arrow launch button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{act.duration_text}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchActivity(act)}
                      className="h-8 w-8 rounded-full bg-[#fff1f2] hover:bg-[#73111b] text-[#73111b] hover:text-white flex items-center justify-center transition-all shadow-2xs active:scale-90"
                      title="Open learning player"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="col-span-2 py-16 text-center text-xs text-slate-400">
                  No courses found under this tab.
                </div>
              )}
            </div>
          ) : (
            /* Academic Cohort & Timetable View */
            <div className="space-y-4">
              <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#73111b]" />
                    <span>Scheduled Class Lectures & Labs</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/timetable')}
                    className="text-xs font-bold text-[#73111b] hover:text-[#5c0d15] flex items-center gap-1 transition"
                  >
                    <span>View Full Timetable</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {dashboardData?.upcoming_classes?.length > 0 ? (
                    dashboardData.upcoming_classes.map((cls: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                              {cls.delivery_mode || 'Online'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-500">
                              {cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">{cls.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {cls.date} • {cls.batch?.name || cls.location || 'IAT Virtual Campus'}
                          </p>
                        </div>
                        {cls.meeting_url && (
                          <a
                            href={cls.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition shadow-xs text-center"
                          >
                            Join Live Meet
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        No live lecture sessions scheduled for today.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/timetable')}
                        className="text-xs font-bold text-[#73111b] hover:underline"
                      >
                        Browse Weekly Timetable →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Admission Workflow */}
              {dashboardData?.workflow && dashboardData.workflow.length > 0 && (
                <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Enrollment Clearance Status
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.workflow.map((wf: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{wf.course_name}</p>
                          <p className="text-[11px] font-mono text-slate-500">{wf.enrollment_number}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] capitalize">
                          {wf.stage?.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Continuous Assessments & Examinations */}
              <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#73111b]" />
                    <span>Scheduled Assessments & Final Exams</span>
                  </h3>
                  <span className="text-xs text-slate-400">ACCA Calendar</span>
                </div>

                <div className="space-y-3">
                  {dashboardData?.assessments?.length > 0 ? (
                    dashboardData.assessments.map((ass: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{ass.title}</p>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                              {ass.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Due date: {ass.due_date || 'Scheduled'} • Total Marks: {ass.total_marks || 100} • Time: {ass.time_limit || 60} mins
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-200/70 text-slate-700 font-bold text-[10px]">
                            CBE Registered
                          </span>
                          <button
                            onClick={() => navigate(`/assessments/${ass.uuid}/take`)}
                            className="px-3 py-1.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span>Launch Exam</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      No active assessments due at this moment.
                    </p>
                  )}
                </div>
              </div>

              {/* Quality Feedback & Academic Campaigns Card */}
              <div className="rounded-3xl bg-gradient-to-br from-white to-rose-50/40 border border-slate-200 p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#73111b] shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">ACCA Cohort Quality Feedback</h3>
                      <p className="text-[11px] text-slate-500">Continuous academic evaluation & trainer delivery review</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Star className="h-3.5 w-3.5 fill-white" />
                    <span>Submit Feedback</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beginning</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">25.09.2026</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                      Open & Active
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Middle</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">16.10.2026</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                      Upcoming
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exit</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">20.11.2026</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Gamification Rail (4 cols): Streak & Achievements */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Streak Widget */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {gamification.current_streak}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Flame className="h-6 w-6 fill-[#73111b] text-[#73111b]" />
                <div className="leading-tight">
                  <p className="text-slate-800 font-bold">Current</p>
                  <p className="text-slate-500 font-medium">streak</p>
                </div>
              </div>
            </div>

            {/* 7-day circular tracker */}
            <div className="mt-6 flex items-center justify-between">
              {gamification.streak_days?.map((item: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                      item.active
                        ? 'bg-[#73111b] text-white shadow-sm shadow-[#73111b]/30'
                        : 'border border-dashed border-slate-300 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {item.active ? (
                      <Flame className="h-4 w-4 fill-white" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Widget */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">Achievements</h3>
              <button
                type="button"
                onClick={() => setAchievementsModalOpen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Expand Achievements"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Badges row with polygon icons and progress bars */}
            <div className="grid grid-cols-2 gap-4">
              {gamification.achievements?.slice(0, 2).map((ach: AchievementItem) => (
                <div key={ach.id} className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                    <div className="absolute inset-0 bg-[#fff1f2] rounded-2xl rotate-45 border border-[#fecdd3] shadow-2xs" />
                    {ach.icon === 'flame' ? (
                      <Flame className="relative z-10 h-7 w-7 fill-[#f59e0b] text-[#f59e0b]" />
                    ) : (
                      <Award className="relative z-10 h-7 w-7 text-[#73111b]" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{ach.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{ach.current} / {ach.target}</span>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#73111b] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ach.progress_percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* View all badges CTA */}
            <button
              type="button"
              onClick={() => setAchievementsModalOpen(true)}
              className="w-full mt-4 py-2 text-center text-xs font-bold text-[#73111b] hover:bg-rose-50/50 rounded-xl transition flex items-center justify-center gap-1"
            >
              <span>View all credential badges</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Achievements Detailed Modal */}
      {achievementsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Achievements & Badges</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your verified learning milestones and certificates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAchievementsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 max-h-96 overflow-y-auto pr-1">
              {gamification.achievements?.map((ach: AchievementItem) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <Award className="h-6 w-6 text-[#73111b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{ach.title}</p>
                      <span className="text-[11px] font-bold text-[#73111b]">
                        {ach.current} / {ach.target}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ach.description}</p>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#73111b] rounded-full transition-all duration-500"
                        style={{ width: `${ach.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setAchievementsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Cohort Quality Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#fff1f2] text-[#73111b] flex items-center justify-center border border-[#fecdd3]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">ACCA Cohort Feedback Survey</h3>
                  <p className="text-[11px] text-slate-500">Shared directly with Academic Management & Lead Trainers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900">Feedback Submitted Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you! Your evaluation has been recorded and dispatched to the Academic Manager, Branch Manager, and Lead Trainers.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCohortFeedback} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Period</label>
                    <select
                      value={feedbackPeriod}
                      onChange={(e) => setFeedbackPeriod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#73111b]"
                    >
                      <option value="beginning">Beginning (25.09.2026)</option>
                      <option value="middle">Middle (16.10.2026)</option>
                      <option value="exit">Exit (20.11.2026)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Paper / Unit</label>
                    <select
                      value={feedbackUnitCode}
                      onChange={(e) => setFeedbackUnitCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#73111b]"
                    >
                      <option value="CL">CL: Corporate & Business Law</option>
                      <option value="TX">TX: Taxation</option>
                      <option value="FR">FR: Financial Reporting</option>
                      <option value="FM">FM: Financial Management</option>
                      <option value="FFA">FFA: Financial Accounting</option>
                      <option value="FA2">FA2: Maintaining Financial Records</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Evaluation Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#73111b]"
                  >
                    <option value="Course Delivery">Course Delivery & Instruction</option>
                    <option value="Learning Environment">Classroom & Lab Facilities</option>
                    <option value="Curriculum & Resources">Study Materials & Notes</option>
                    <option value="Overall Satisfaction">Overall Cohort Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Overall Rating</label>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= feedbackRating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {feedbackRating === 5
                        ? 'Excellent (5/5)'
                        : feedbackRating === 4
                        ? 'Very Good (4/5)'
                        : feedbackRating === 3
                        ? 'Good (3/5)'
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comments & Recommendations
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Share your experience regarding session pacing, lecturer guidance, or exam preparation..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#73111b]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-5 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#73111b]/20 transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingFeedback ? 'Submitting...' : 'Send Feedback'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

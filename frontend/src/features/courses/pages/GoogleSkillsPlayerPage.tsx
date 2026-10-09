import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import {
  Home,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Terminal,
  X,
  Star,
  Send,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Mail,
  Phone,
  Clock3,
} from 'lucide-react';

interface TranscriptCue {
  time: string;
  seconds: number;
  text: string;
}

interface LessonItem {
  id: number;
  uuid: string;
  module_uuid?: string;
  title: string;
  description?: string;
  content_type: string;
  video_url?: string;
  file_path?: string;
  duration?: number;
  transcript?: TranscriptCue[];
  content?: string;
  resources?: {
    id: number;
    uuid: string;
    title: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
  }[];
}

interface ModuleItem {
  id: number;
  uuid: string;
  title: string;
  order?: number;
  unit_id?: number | null;
  lessons: LessonItem[];
}

interface ModuleComment {
  uuid: string;
  body: string;
  created_at: string;
  author: { uuid: string; first_name: string; last_name: string };
  student: { uuid: string; first_name: string; last_name: string };
}

interface LearningModuleItem extends ModuleItem {
  unit_title?: string;
}

interface CourseData {
  id: number;
  uuid: string;
  code: string;
  name: string;
  category?: { name: string };
  modules: ModuleItem[];
  units?: { id: number; title: string; order?: number; modules: ModuleItem[] }[];
  learning_progress?: {
    percentage: number;
    completed_lesson_uuids: string[];
  };
  batches?: {
    id?: number;
    uuid: string;
    name: string;
    trainers?: { uuid: string; first_name: string; last_name: string; email?: string; phone?: string; pivot?: { role_type?: string } }[];
  }[];
}

const getLearningModules = (course: CourseData): LearningModuleItem[] => {
  const unitModules = [...(course.units || [])]
    .sort((first, second) => (first.order || 0) - (second.order || 0))
    .flatMap((unit) => [...(unit.modules || [])]
      .sort((first, second) => (first.order || 0) - (second.order || 0))
      .map((module) => ({ ...module, unit_title: unit.title })));
  const standaloneModules = [...(course.modules || [])]
    .filter((module) => !module.unit_id)
    .sort((first, second) => (first.order || 0) - (second.order || 0));

  return [...unitModules, ...standaloneModules];
};

const getModuleIndex = (modules: LearningModuleItem[], lesson?: LessonItem): number =>
  modules.findIndex((module) => module.uuid === lesson?.module_uuid);

export const GoogleSkillsPlayerPage: React.FC = () => {
  const { courseUuid, lessonUuid } = useParams<{ courseUuid: string; lessonUuid?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.roles?.includes('Student') ?? false;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Video playback & transcript sync state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Modals & Drawers
  const [contentsDrawerOpen, setContentsDrawerOpen] = useState(false);
  const [labConsoleOpen, setLabConsoleOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [moduleComments, setModuleComments] = useState<ModuleComment[]>([]);
  const [moduleStudents, setModuleStudents] = useState<{ uuid: string; first_name: string; last_name: string }[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentStudentUuid, setCommentStudentUuid] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [academicSupportEmail, setAcademicSupportEmail] = useState('');
  const [queryResponseTime, setQueryResponseTime] = useState('Within 2 business days');

  useEffect(() => {
    api.get('/organization')
      .then((response) => {
        const organization = response.data.data;
        setAcademicSupportEmail(organization?.settings?.academic_support_email || organization?.email || '');
        setQueryResponseTime(organization?.settings?.query_response_time || 'Within 2 business days');
      })
      .catch((err) => console.error('Failed to load student support details:', err));
  }, []);

  const handleFeedbackSubmit = async () => {
    const targetBatch = course?.batches?.[0];
    try {
      setSubmittingFeedback(true);
      await api.post('/feedbacks', {
        batch_id: (targetBatch as any)?.id,
        batch_uuid: targetBatch?.uuid,
        period: 'lesson',
        unit_code: course?.code || 'ACCA',
        rating: feedbackRating,
        category: 'Lesson Experience',
        comments: feedbackText || `Student reviewed lesson: ${currentLesson?.title || 'Lesson'}`,
        metrics: {
          lesson_title: currentLesson?.title,
          lesson_uuid: currentLesson?.uuid,
          course_name: course?.name,
        },
      });
      setFeedbackSent(true);
    } catch (err) {
      console.error('Failed to submit feedback', err);
      setFeedbackSent(true);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getFileUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return path;
    return `/${path}`;
  };

  // Shell state for simulated Lab Console
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Welcome to IAT Practical Lab Environment (Interactive Terminal).',
    'Type "status", "ping 192.168.1.1", or "help" to test commands.',
  ]);

  // Load Course and Initial Lesson
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${courseUuid}`);
        if (res.data.success) {
          const cData: CourseData = res.data.data;
          setCourse(cData);
          const done = new Set<string>(cData.learning_progress?.completed_lesson_uuids || []);
          setCompletedLessons(done);
          const modules = getLearningModules(cData);
          const allLessons = modules.flatMap((module) => (module.lessons || []).map((lesson) => ({
            ...lesson,
            module_uuid: module.uuid,
          })));
          const firstIncomplete = allLessons.find((lesson) => !done.has(lesson.uuid));
          const requestedLesson = allLessons.find((lesson) => lesson.uuid === lessonUuid);
          const activeModuleIndex = firstIncomplete
            ? getModuleIndex(modules, firstIncomplete)
            : modules.length;
          const requestedModuleIndex = requestedLesson
            ? getModuleIndex(modules, requestedLesson)
            : -1;
          const requestedIsAvailable = requestedLesson && (
            !isStudent || !firstIncomplete || requestedModuleIndex <= activeModuleIndex
          );
          const targetLesson = requestedIsAvailable
            ? requestedLesson
            : firstIncomplete || allLessons[allLessons.length - 1];

          setCurrentLesson(targetLesson || null);
          if (lessonUuid && targetLesson && targetLesson.uuid !== lessonUuid) {
            navigate(`/learn/${courseUuid}/${targetLesson.uuid}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to load course details for player:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseUuid) fetchCourseData();
  }, [courseUuid, lessonUuid, isStudent, navigate]);

  useEffect(() => {
    const moduleUuid = currentLesson?.module_uuid;
    const batch = course?.batches?.[0];
    if (!moduleUuid || !batch) return;

    setCommentsLoading(true);
    api.get(`/modules/${moduleUuid}/comments`, { params: { batch_uuid: batch.uuid } })
      .then((response) => {
        const data = response.data.data;
        setModuleComments(data.comments || []);
        setModuleStudents(data.students || []);
        if (isStudent) setCommentStudentUuid(user?.uuid || '');
      })
      .catch((err) => console.error('Failed to load module comments:', err))
      .finally(() => setCommentsLoading(false));
  }, [currentLesson?.module_uuid, course?.batches, isStudent, user?.uuid]);

  const handleModuleCommentSubmit = async () => {
    const moduleUuid = currentLesson?.module_uuid;
    const batch = course?.batches?.[0];
    if (!moduleUuid || !batch || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const response = await api.post(`/modules/${moduleUuid}/comments`, {
        batch_uuid: batch.uuid,
        student_uuid: isStudent ? undefined : commentStudentUuid,
        body: commentText.trim(),
      });
      setModuleComments((current) => [...current, response.data.data]);
      setCommentText('');
    } catch (err: any) {
      console.error('Failed to post module comment:', err);
      window.alert(err.response?.data?.message || 'Failed to post module comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Video control handlers
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Structured transcript cues for the active lesson
  const transcriptList: TranscriptCue[] = currentLesson?.transcript?.length
    ? currentLesson.transcript
    : [
        { time: '00:00', seconds: 0, text: `Welcome to ${currentLesson?.title || 'this lesson'}.` },
        { time: '00:05', seconds: 5, text: 'In this session, we study core technical foundations and practical lab implementations.' },
        { time: '00:15', seconds: 15, text: 'Make sure to follow each step carefully and take structured notes.' },
        { time: '00:25', seconds: 25, text: 'Review the key concepts and verify your answers before advancing.' },
      ];

  // Find active transcript index
  const activeTranscriptIndex = transcriptList.reduce((acc, cue, idx) => {
    if (currentTime >= cue.seconds) return idx;
    return acc;
  }, 0);

  // Lesson traversal: previous & next
  const learningModules = course ? getLearningModules(course) : [];
  const flatLessons: LessonItem[] = learningModules.flatMap((module) => (module.lessons || []).map((lesson) => ({
    ...lesson,
    module_uuid: module.uuid,
  })));
  const currentIndex = flatLessons.findIndex((l) => l.uuid === currentLesson?.uuid);
  const previousLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const firstIncompleteLesson = flatLessons.find((lesson) => !completedLessons.has(lesson.uuid));
  const activeModuleIndex = firstIncompleteLesson
    ? getModuleIndex(learningModules, firstIncompleteLesson)
    : learningModules.length;
  const isLessonAvailable = (lesson: LessonItem, progress = completedLessons): boolean => {
    if (!isStudent) return true;
    const firstIncomplete = flatLessons.find((candidate) => !progress.has(candidate.uuid));
    return !firstIncomplete || getModuleIndex(learningModules, lesson) <= getModuleIndex(learningModules, firstIncomplete);
  };

  const navigateToLesson = (lesson: LessonItem, progress = completedLessons) => {
    if (!isLessonAvailable(lesson, progress)) return;
    setCurrentLesson(lesson);
    setCurrentTime(0);
    setIsPlaying(false);
    setContentsDrawerOpen(false);
    navigate(`/learn/${courseUuid}/${lesson.uuid}`);
  };

  // Mark lesson completed
  const handleMarkCompleted = async () => {
    if (!currentLesson || completing) return;
    const batchUuid = course?.batches?.[0]?.uuid;
    setCompleting(true);

    try {
      if (batchUuid) {
        await api.post(`/lessons/${currentLesson.uuid}/progress`, {
          batch_uuid: batchUuid,
          status: 'completed',
        });
      }

      const updatedProgress = new Set(completedLessons).add(currentLesson.uuid);
      setCompletedLessons(updatedProgress);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#73111b', '#991b1b', '#f59e0b', '#10b981'],
      });

      // Auto-advance if next lesson exists
      if (nextLesson && isLessonAvailable(nextLesson, updatedProgress)) {
        window.setTimeout(() => {
          navigateToLesson(nextLesson, updatedProgress);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to mark lesson completed:', err);
    } finally {
      setCompleting(false);
    }
  };

  // Handle simulated terminal commands
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    const newOutput = [...terminalHistory, `student@iat-lab:~ $ ${cmd}`];

    if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (cmd.startsWith('ping')) {
      newOutput.push('64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.24 ms');
      newOutput.push('64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.18 ms');
    } else if (cmd === 'status') {
      newOutput.push('Lab virtual interfaces: eth0 UP 192.168.1.100/24. Routing active.');
    } else if (cmd === 'help') {
      newOutput.push('Supported commands: ping <ip>, status, clear, help');
    } else {
      newOutput.push(`Command executed successfully in virtual lab.`);
    }

    setTerminalHistory(newOutput);
    setTerminalInput('');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <div className="h-8 w-8 border-3 border-[#73111b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">
          Loading learning experience...
        </span>
      </div>
    );
  }

  const isCurrentCompleted = currentLesson ? completedLessons.has(currentLesson.uuid) : false;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Top Context & Breadcrumbs Header (Screenshot 2 structure in IAT theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link
            to="/dashboard"
            className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-900 transition flex items-center"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="font-medium text-slate-600 truncate max-w-[200px]">
            {course.category?.name || 'Academic Course'}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="font-medium text-slate-700 truncate max-w-[240px]">
            {course.name}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-slate-900 truncate max-w-[260px]">
            {currentLesson?.title || 'Lesson Overview'}
          </span>
        </div>

        {/* Right action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-600 mr-1">
            <span>Apply your skills in practical lab</span>
          </div>

          <button
            type="button"
            onClick={() => setLabConsoleOpen(true)}
            className="px-4 py-2 rounded-full bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Get started</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Send feedback</span>
          </button>
        </div>
      </div>

      {/* 2. Contents Dropdown / Selector Bar (Screenshot 2 structure) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setContentsDrawerOpen(!contentsDrawerOpen)}
          className="w-full sm:w-80 flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-[#73111b] text-xs font-semibold text-slate-800 shadow-2xs transition"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500 font-medium">Contents:</span>
            <span className="truncate font-bold text-slate-900">{currentLesson?.title || 'Select a lesson'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
        </button>

        {/* Dropdown Menu for curriculum lessons */}
        {contentsDrawerOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setContentsDrawerOpen(false)}
            />
            <div className="absolute top-12 left-0 w-full sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-40 max-h-96 overflow-y-auto animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Curriculum Modules</span>
                <span className="text-[11px] font-semibold text-[#73111b]">
                  {completedLessons.size} of {flatLessons.length} Completed
                </span>
              </div>

              <div className="py-2 space-y-3">
                {learningModules.map((module, mIdx) => (
                  <div key={module.uuid || mIdx} className="space-y-1">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {[module.unit_title, module.title].filter(Boolean).join(' / ')}
                      {isStudent && mIdx > activeModuleIndex && <span className="ml-2 normal-case text-slate-400">Locked</span>}
                    </p>
                    {module.lessons?.map((les) => {
                      const isDone = completedLessons.has(les.uuid);
                      const isCurrent = les.uuid === currentLesson?.uuid;
                      return (
                        <button
                          key={les.uuid}
                          type="button"
                          disabled={!isLessonAvailable({ ...les, module_uuid: module.uuid })}
                          onClick={() => navigateToLesson({ ...les, module_uuid: module.uuid })}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            isCurrent
                              ? 'bg-[#fff1f2] text-[#73111b] font-bold border border-[#fecdd3]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>
                          {les.duration && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {les.duration}m
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Dual-Pane Stage: Video Player / PDF Syllabus Reader (Left) + Timed Transcript / Study Resources (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Player / Syllabus Stage (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {currentLesson?.content_type === 'pdf' || currentLesson?.file_path ? (
            /* PDF Syllabus Stage */
            <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl relative min-h-[580px] flex flex-col">
              {/* Header overlay */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="h-6 w-6 rounded-full bg-[#73111b] flex items-center justify-center font-bold text-xs text-white shrink-0">
                    ACCA
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">
                      {currentLesson.title}
                    </p>
                    <p className="text-[10px] text-slate-400">Official ACCA Syllabus & Study Guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getFileUrl(currentLesson.file_path)}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                    title="Download Syllabus PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <a
                    href={getFileUrl(currentLesson.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition shadow-xs"
                    title="Open Fullscreen PDF"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Full Screen</span>
                  </a>
                </div>
              </div>

              {/* PDF embed */}
              <div className="flex-1 bg-slate-950 relative min-h-[520px]">
                <iframe
                  src={`${getFileUrl(currentLesson.file_path)}#toolbar=1&navpanes=0`}
                  title={currentLesson.title}
                  className="w-full h-full min-h-[520px] border-0"
                />
              </div>
            </div>
          ) : (
            /* Video Player Stage */
            <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-900 shadow-xl relative aspect-video flex items-center justify-center group">
              {/* Header overlay badge */}
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white select-none">
                <div className="h-6 w-6 rounded-full bg-[#73111b] flex items-center justify-center">
                  <span className="font-bold text-xs text-white">IAT</span>
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {currentLesson?.title || 'Lesson Overview'}
                  </p>
                  <p className="text-[10px] text-slate-400">{course.name}</p>
                </div>
              </div>

              {/* Video element */}
              <video
                ref={videoRef}
                src={
                  currentLesson?.video_url ||
                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                }
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-contain cursor-pointer"
                onClick={handleTogglePlay}
              />

              {/* Big center play icon if paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-[#73111b]/90 hover:bg-[#73111b] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 z-20"
                  title="Play video"
                >
                  <Play className="h-8 w-8 fill-white ml-1" />
                </button>
              )}

              {/* Video Control Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-20 space-y-2 opacity-90 group-hover:opacity-100 transition-opacity">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#73111b]"
                />

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="hover:text-rose-300 transition"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek(0)}
                      className="hover:text-rose-300 transition"
                      title="Restart"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    <span className="text-[11px] font-mono text-slate-300">
                      {formatSeconds(currentTime)} / {formatSeconds(duration || 60)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Speed toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const speeds = [1, 1.25, 1.5, 2];
                        const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                        setPlaybackSpeed(nextSpeed);
                        if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
                      }}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold"
                    >
                      {playbackSpeed}x
                    </button>

                    {/* Volume mute toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!videoRef.current) return;
                        const nextMuted = !isMuted;
                        videoRef.current.muted = nextMuted;
                        setIsMuted(nextMuted);
                      }}
                      className="hover:text-rose-300 transition"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>

                    {/* Fullscreen */}
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current?.requestFullscreen) {
                          videoRef.current.requestFullscreen();
                        }
                      }}
                      className="hover:text-rose-300 transition"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lesson description summary */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">{currentLesson?.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
              {currentLesson?.description ||
                'In this lesson, you will master the foundational concepts, key terminology, and practical applications according to the official ACCA syllabus guide.'}
            </p>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Need help with this course?</h2>
                <p className="mt-1 text-[11px] text-slate-500">Expected reply: {queryResponseTime}</p>
              </div>
              <Clock3 className="h-4 w-4 text-[#73111b]" />
            </div>
            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold text-slate-800">Lecture or lesson-content questions</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Post below in Module discussion. Your assigned trainer can see and reply to your question.</p>
                <div className="mt-2 space-y-1.5">
                  {course.batches?.[0]?.trainers?.map((trainer) => (
                    <div key={trainer.uuid} className="flex min-w-0 items-center gap-2 text-[11px]">
                      <span className="min-w-0 truncate font-semibold text-slate-700">{trainer.first_name} {trainer.last_name}{trainer.pivot?.role_type ? ` · ${trainer.pivot.role_type}` : ''}</span>
                      {trainer.email && <a href={`mailto:${trainer.email}`} title={`Email ${trainer.first_name} ${trainer.last_name}`} className="ml-auto inline-flex shrink-0 items-center gap-1 font-bold text-[#73111b] hover:underline"><Mail className="h-3.5 w-3.5" />Email</a>}
                      {!trainer.email && trainer.phone && <a href={`tel:${trainer.phone}`} title={`Call ${trainer.first_name} ${trainer.last_name}`} className="ml-auto inline-flex shrink-0 items-center gap-1 font-bold text-[#73111b] hover:underline"><Phone className="h-3.5 w-3.5" />Call</a>}
                    </div>
                  ))}
                  {!course.batches?.[0]?.trainers?.length && <p className="text-[11px] text-slate-500">Use the module discussion below to reach your course trainer.</p>}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800">Syllabus or exam-preparation questions</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Contact Academic Support about syllabus coverage, exam technique, revision, or mock exams.</p>
                {academicSupportEmail && <a href={`mailto:${academicSupportEmail}`} className="mt-2 inline-flex max-w-full items-center gap-1.5 text-[11px] font-bold text-[#73111b] hover:underline"><Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{academicSupportEmail}</span></a>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="h-4 w-4 text-[#73111b]" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Module discussion</h2>
                <p className="text-[11px] text-slate-500">Comments are shared with the assigned trainer and this student.</p>
              </div>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto py-3">
              {commentsLoading ? <p className="text-xs text-slate-400">Loading comments...</p> : moduleComments.length ? moduleComments.map((comment) => (
                <article key={comment.uuid} className="border-l-2 border-slate-200 pl-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      {comment.author.first_name} {comment.author.last_name}
                      {comment.author.uuid !== comment.student.uuid && <span className="ml-1.5 font-medium text-[#73111b]">Trainer</span>}
                    </p>
                    <time className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleString()}</time>
                  </div>
                  {comment.author.uuid !== comment.student.uuid && !isStudent && (
                    <p className="mt-0.5 text-[10px] text-slate-500">To {comment.student.first_name} {comment.student.last_name}</p>
                  )}
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{comment.body}</p>
                </article>
              )) : <p className="text-xs text-slate-400">No comments on this module yet.</p>}
            </div>
            {!isStudent && moduleStudents.length > 0 && (
              <label className="mb-2 block text-[11px] font-semibold text-slate-600">
                Student
                <select value={commentStudentUuid} onChange={(event) => setCommentStudentUuid(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800">
                  <option value="">Choose a student</option>
                  {moduleStudents.map((student) => <option key={student.uuid} value={student.uuid}>{student.first_name} {student.last_name}</option>)}
                </select>
              </label>
            )}
            <div className="flex items-end gap-2 border-t border-slate-100 pt-3">
              <textarea rows={2} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={isStudent ? 'Leave a comment for your trainer...' : 'Write a comment for the selected student...'} className="min-h-16 flex-1 resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-[#73111b] focus:outline-none" />
              <button type="button" onClick={handleModuleCommentSubmit} disabled={commentSubmitting || !commentText.trim() || (!isStudent && !commentStudentUuid)} aria-label="Post module comment" title="Post comment" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#73111b] text-white transition hover:bg-[#5c0d15] disabled:cursor-not-allowed disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Timed Transcript (Video) or Syllabus Resources (PDF) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[580px]">
          {currentLesson?.content_type === 'pdf' || currentLesson?.file_path ? (
            /* PDF Syllabus Info & Resources */
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#73111b]" />
                  <span>Syllabus & Study Resources</span>
                </h3>
                <span className="text-[10px] text-[#73111b] font-bold bg-[#fff1f2] border border-[#fecdd3] px-2 py-0.5 rounded-full">
                  Official ACCA
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Attached official documents */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Official Documents
                  </p>
                  <div className="space-y-2">
                    {currentLesson?.file_path && (
                      <a
                        href={getFileUrl(currentLesson.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-100 hover:border-[#73111b]/40 hover:bg-rose-50 transition group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 pr-2">
                          <FileText className="h-4 w-4 text-[#73111b] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-[#73111b] transition truncate">
                              Official Syllabus & Study Guide
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">ACCA Global PDF Document</p>
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-[#73111b] shrink-0" />
                      </a>
                    )}

                    {currentLesson?.resources?.map((res) => (
                      <a
                        key={res.uuid || res.id}
                        href={getFileUrl(res.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#73111b]/40 hover:bg-slate-100/70 transition group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 pr-2">
                          <FileText className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-[#73111b] transition truncate">
                              {res.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Companion Study Resource</p>
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-slate-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* CBE Exam Specs Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">ACCA Exam Specifications</p>
                  <div className="space-y-1.5 text-slate-600 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exam Mode:</span>
                      <span className="font-semibold text-slate-800">Computer-Based Exam (CBE)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passing Mark:</span>
                      <span className="font-semibold text-emerald-700">50% Pass Threshold</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accreditation:</span>
                      <span className="font-semibold text-slate-800">ACCA Global UK</span>
                    </div>
                  </div>
                </div>

                {/* Study Notes summary */}
                {currentLesson?.content && (
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Guided Notes</p>
                    <div className="text-[11px] leading-relaxed whitespace-pre-line text-slate-600">
                      {currentLesson.content}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Video Transcript View */
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Transcript
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Click timestamp to jump
                </span>
              </div>

              {/* Transcript Scrollable Cue List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
                {transcriptList.map((cue, idx) => {
                  const isActive = idx === activeTranscriptIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSeek(cue.seconds)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition text-xs leading-relaxed ${
                        isActive
                          ? 'bg-[#fff1f2] text-[#73111b] font-medium border-l-3 border-[#73111b]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] font-bold shrink-0 pt-0.5 ${
                          isActive ? 'text-[#73111b]' : 'text-[#881337]'
                        }`}
                      >
                        {cue.time}
                      </span>
                      <p className="flex-1">{cue.text}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Bottom Lesson Navigation Bar (Screenshot 2 structure) */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4">
        {/* Previous button */}
        <div>
          {previousLesson ? (
            <button
              type="button"
              onClick={() => navigateToLesson(previousLesson)}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-300 text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
          )}
        </div>

        {/* Center: Completion status */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Lesson {currentIndex + 1} of {flatLessons.length}</span>
          <span>•</span>
          <span className="text-[#73111b] font-bold">
            {Math.round((completedLessons.size / Math.max(1, flatLessons.length)) * 100)}% Course Completed
          </span>
        </div>

        {/* Right buttons: Mark as completed & Next */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkCompleted}
            disabled={completing || isCurrentCompleted}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              isCurrentCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isCurrentCompleted ? 'Completed ✓' : completing ? 'Marking...' : 'Mark as completed →'}</span>
          </button>

          {nextLesson ? (
            <button
              type="button"
              onClick={() => navigateToLesson(nextLesson)}
              disabled={!isLessonAvailable(nextLesson)}
              title={!isLessonAvailable(nextLesson) ? 'Complete the current module to unlock the next module.' : undefined}
              className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Finish</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Virtual Lab Console Simulation Modal */}
      {labConsoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 flex flex-col h-[560px]">
            {/* Terminal Header */}
            <div className="h-12 bg-slate-900 px-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-300 ml-2">
                  IAT Virtual Practical Lab (Interactive Shell)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLabConsoleOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-emerald-400 space-y-1">
              {terminalHistory.map((line, i) => (
                <div key={i} className="leading-relaxed">
                  {line}
                </div>
              ))}
            </div>

            {/* Command Input */}
            <form onSubmit={handleTerminalSubmit} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400 shrink-0">
                student@iat-lab:~ $
              </span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="type command (e.g. status, ping 192.168.1.1, help)..."
                className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-[#73111b] text-white text-xs font-bold"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Send Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Lesson Feedback</h3>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackSent ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-900">Thank you for your feedback!</p>
                <p className="text-xs text-slate-500">
                  Your feedback helps us continuously improve the lesson delivery.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackOpen(false);
                    setFeedbackSent(false);
                  }}
                  className="mt-3 px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    How was this lesson?
                  </label>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Any suggestions or comments?
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you liked or what could be improved..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#73111b]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingFeedback}
                    onClick={handleFeedbackSubmit}
                    className="px-5 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingFeedback ? 'Submitting...' : 'Submit'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

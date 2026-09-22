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
} from 'lucide-react';

interface TranscriptCue {
  time: string;
  seconds: number;
  text: string;
}

interface LessonItem {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  content_type: string;
  video_url?: string;
  duration?: number;
  transcript?: TranscriptCue[];
  content?: string;
}

interface ModuleItem {
  id: number;
  uuid: string;
  title: string;
  lessons: LessonItem[];
}

interface CourseData {
  id: number;
  uuid: string;
  code: string;
  name: string;
  category?: { name: string };
  modules: ModuleItem[];
  units?: { id: number; title: string; modules: ModuleItem[] }[];
  learning_progress?: {
    percentage: number;
    completed_lesson_uuids: string[];
  };
  batches?: { uuid: string; name: string }[];
}

export const GoogleSkillsPlayerPage: React.FC = () => {
  const { courseUuid, lessonUuid } = useParams<{ courseUuid: string; lessonUuid?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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

          // Collect all lessons
          const allLessons: LessonItem[] = [
            ...(cData.modules?.flatMap((m) => m.lessons || []) || []),
            ...(cData.units?.flatMap((u) => u.modules?.flatMap((m) => m.lessons || []) || []) || []),
          ];

          // Determine current lesson
          let targetLesson: LessonItem | undefined;
          if (lessonUuid) {
            targetLesson = allLessons.find((l) => l.uuid === lessonUuid);
          }
          if (!targetLesson && allLessons.length > 0) {
            targetLesson = allLessons[0];
          }

          setCurrentLesson(targetLesson || null);

          // Set completed lessons
          const done = new Set<string>(cData.learning_progress?.completed_lesson_uuids || []);
          setCompletedLessons(done);
        }
      } catch (err) {
        console.error('Failed to load course details for player:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseUuid) fetchCourseData();
  }, [courseUuid, lessonUuid]);

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
  const flatLessons: LessonItem[] = [
    ...(course?.modules?.flatMap((m) => m.lessons || []) || []),
    ...(course?.units?.flatMap((u) => u.modules?.flatMap((m) => m.lessons || []) || []) || []),
  ];
  const currentIndex = flatLessons.findIndex((l) => l.uuid === currentLesson?.uuid);
  const previousLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const navigateToLesson = (lesson: LessonItem) => {
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

      setCompletedLessons((prev) => new Set(prev).add(currentLesson.uuid));

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#73111b', '#991b1b', '#f59e0b', '#10b981'],
      });

      // Auto-advance if next lesson exists
      if (nextLesson) {
        window.setTimeout(() => {
          navigateToLesson(nextLesson);
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
                {course.modules?.map((module, mIdx) => (
                  <div key={module.uuid || mIdx} className="space-y-1">
                    <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {module.title}
                    </p>
                    {module.lessons?.map((les) => {
                      const isDone = completedLessons.has(les.uuid);
                      const isCurrent = les.uuid === currentLesson?.uuid;
                      return (
                        <button
                          key={les.uuid}
                          type="button"
                          onClick={() => navigateToLesson(les)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${
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

      {/* 3. Dual-Pane Stage: Video Player (Left) + Timed Transcript (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Video Player Stage (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
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

          {/* Lesson description summary */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">{currentLesson?.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
              {currentLesson?.description ||
                'In this lesson, you will master the foundational architectural concepts, key terminology, and hands-on operational best practices.'}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Timed Transcript (4 cols) (Screenshot 2 structure in IAT theme) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[520px]">
          {/* Transcript Header */}
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
                  {/* Clickable timestamp link */}
                  <span
                    className={`font-mono text-[11px] font-bold shrink-0 pt-0.5 ${
                      isActive ? 'text-[#73111b]' : 'text-[#881337]'
                    }`}
                  >
                    {cue.time}
                  </span>

                  {/* Transcript text */}
                  <p className="flex-1">{cue.text}</p>
                </div>
              );
            })}
          </div>
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
              className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
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

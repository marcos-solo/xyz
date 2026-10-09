import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  Plus,
  Clock,
  Users,
  Video,
  MapPin,
  Calendar,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Filter,
  Printer,
  Search,
  Sparkles,
  Trash2,
  Edit3,
  Repeat,
  Layers,
  CalendarDays,
  X,
  Radio,
  Check,
  Building,
  School,
  FileSpreadsheet,
} from 'lucide-react';
import type { CourseBatch, Branch } from '../../../types/models';

interface SessionItem {
  id: number;
  uuid: string;
  title: string;
  topic?: string;
  date: string;
  start_time: string;
  end_time: string;
  delivery_mode: string;
  location?: string;
  meeting_url?: string;
  status: string;
  notes?: string;
  batch?: {
    id: number;
    uuid: string;
    name: string;
    code: string;
    course?: {
      name: string;
      code: string;
    };
    branch?: {
      name: string;
    };
  };
  trainer?: {
    id: number;
    full_name: string;
    email: string;
  };
  attendance_session?: {
    id: number;
    status: string;
    records?: any[];
  };
}

const ACCA_PAPERS = [
  // Foundation Level
  { code: 'FA1', name: 'Recording Financial Transactions', level: 'Foundation Level', slot: 'morning' },
  { code: 'MA1', name: 'Management Information', level: 'Foundation Level', slot: 'morning' },
  { code: 'FA2', name: 'Maintaining Financial Records', level: 'Foundation Level', slot: 'morning' },
  { code: 'MA2', name: 'Managing Costs and Finance', level: 'Foundation Level', slot: 'morning' },
  { code: 'FBT', name: 'Business & Technology', level: 'Foundation Level', slot: 'morning' },
  { code: 'FMA', name: 'Management Accounting', level: 'Foundation Level', slot: 'morning' },
  { code: 'FFA', name: 'Financial Accounting', level: 'Foundation Level', slot: 'morning' },
  // Fundamental - Applied Knowledge
  { code: 'BT', name: 'Business & Technology', level: 'Applied Knowledge', slot: 'early_morning' },
  { code: 'MA', name: 'Management Accounting', level: 'Applied Knowledge', slot: 'early_morning' },
  { code: 'FA', name: 'Financial Accounting', level: 'Applied Knowledge', slot: 'early_morning' },
  // Fundamental - Applied Skills
  { code: 'CL', name: 'Corporate and Business Law', level: 'Applied Skills', slot: 'evening' },
  { code: 'PM', name: 'Performance Management', level: 'Applied Skills', slot: 'evening' },
  { code: 'TX', name: 'Taxation', level: 'Applied Skills', slot: 'evening' },
  { code: 'FR', name: 'Financial Reporting', level: 'Applied Skills', slot: 'evening' },
  { code: 'AA', name: 'Audit & Assurance', level: 'Applied Skills', slot: 'evening' },
  { code: 'FM', name: 'Financial Management', level: 'Applied Skills', slot: 'evening' },
  // Strategic Professional
  { code: 'SBR', name: 'Strategic Business Reporting', level: 'Strategic Professional', slot: 'evening' },
  { code: 'SBL', name: 'Strategic Business Leader', level: 'Strategic Professional', slot: 'evening' },
  { code: 'AFM', name: 'Advanced Financial Management', level: 'Strategic Professional', slot: 'evening' },
  { code: 'APM', name: 'Advanced Performance Management', level: 'Strategic Professional', slot: 'evening' },
  { code: 'ATX', name: 'Advanced Taxation', level: 'Strategic Professional', slot: 'evening' },
  { code: 'AAA', name: 'Advanced Audit & Assurance', level: 'Strategic Professional', slot: 'evening' },
];

const getPaperStyle = (titleOrCode: string) => {
  const upper = (titleOrCode || '').toUpperCase();
  if (upper.includes('TX') || upper.includes('TAX')) {
    return { badge: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500', bar: 'border-l-amber-500', label: 'TX' };
  }
  if (upper.includes('FR') || upper.includes('REPORTING')) {
    return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500', bar: 'border-l-emerald-500', label: 'FR' };
  }
  if (upper.includes('FM') || upper.includes('FINANCIAL MAN')) {
    return { badge: 'bg-cyan-100 text-cyan-800 border-cyan-300', dot: 'bg-cyan-500', bar: 'border-l-cyan-500', label: 'FM' };
  }
  if (upper.includes('PM') || upper.includes('PERFORMANCE')) {
    return { badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500', bar: 'border-l-indigo-500', label: 'PM' };
  }
  if (upper.includes('AA') || upper.includes('AUDIT')) {
    return { badge: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500', bar: 'border-l-purple-500', label: 'AA' };
  }
  if (upper.includes('CL') || upper.includes('LAW')) {
    return { badge: 'bg-teal-100 text-teal-800 border-teal-300', dot: 'bg-teal-500', bar: 'border-l-teal-500', label: 'CL' };
  }
  if (upper.includes('SBL') || upper.includes('LEADER')) {
    return { badge: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600', bar: 'border-l-rose-600', label: 'SBL' };
  }
  if (upper.includes('SBR')) {
    return { badge: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-600', bar: 'border-l-sky-600', label: 'SBR' };
  }
  if (upper.includes('BT') || upper.includes('FBT')) {
    return { badge: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600', bar: 'border-l-blue-600', label: 'BT' };
  }
  if (upper.includes('MA') || upper.includes('FMA') || upper.includes('MA1') || upper.includes('MA2')) {
    return { badge: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-600', bar: 'border-l-violet-600', label: 'MA' };
  }
  if (upper.includes('FA') || upper.includes('FFA') || upper.includes('FA1') || upper.includes('FA2')) {
    return { badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300', dot: 'bg-fuchsia-600', bar: 'border-l-fuchsia-600', label: 'FA' };
  }
  return { badge: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500', bar: 'border-l-slate-400', label: 'ACCA' };
};

export const ClassTimetablePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'day' | 'cards' | 'month'>('grid');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayDate, setSelectedDayDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [myScheduleOnly, setMyScheduleOnly] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Modals
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'single' | 'recurring'>('single');
  const [rosterOpen, setRosterOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionItem | null>(null);
  const [roster, setRoster] = useState<any[]>([]);

  // Conflict Checking
  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Single Session Form
  const [scheduleForm, setScheduleForm] = useState({
    batch_uuid: '',
    selected_paper: '',
    trainer_id: '',
    title: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '17:30',
    end_time: '20:30',
    delivery_mode: 'Online',
    location: 'Google Meet Virtual Campus',
    meeting_url: 'https://meet.google.com/xyz-iat-live',
    notes: '',
  });

  // Recurring Batch Timetable Form
  const [recurringForm, setRecurringForm] = useState({
    batch_uuid: '',
    selected_paper: '',
    trainer_id: '',
    title: '',
    topic: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days_of_week: ['Mon', 'Wed', 'Fri'],
    start_time: '17:30',
    end_time: '20:30',
    delivery_mode: 'Online',
    location: 'Google Meet Virtual Campus',
    meeting_url: 'https://meet.google.com/xyz-iat-live',
    notes: '',
  });

  // Edit Session Form
  const [editForm, setEditForm] = useState({
    title: '',
    topic: '',
    date: '',
    start_time: '',
    end_time: '',
    delivery_mode: 'Online',
    location: '',
    meeting_url: '',
    status: 'scheduled',
    notes: '',
  });

  // Monday–Sunday calculation
  const weekDates = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    const day = today.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekOffset]);

  const formatDateYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayYMD = formatDateYMD(new Date());

  const weekRangeLabel = useMemo(() => {
    if (weekDates.length < 7) return '';
    const start = weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} – ${end}`;
  }, [weekDates]);

  // Load class sessions & metadata
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        branch_uuid: branchFilter || undefined,
        batch_uuid: batchFilter || undefined,
        status: statusFilter || undefined,
        delivery_mode: modeFilter || undefined,
        search: searchQuery || undefined,
        my_schedule: myScheduleOnly ? 1 : undefined,
      };

      if (viewMode === 'grid') {
        queryParams.from_date = formatDateYMD(weekDates[0]);
        queryParams.to_date = formatDateYMD(weekDates[6]);
        queryParams.per_page = 150;
      } else if (viewMode === 'day') {
        queryParams.from_date = selectedDayDate;
        queryParams.to_date = selectedDayDate;
        queryParams.per_page = 100;
      } else if (viewMode === 'month') {
        const firstDay = new Date(weekDates[0].getFullYear(), weekDates[0].getMonth(), 1);
        const lastDay = new Date(weekDates[0].getFullYear(), weekDates[0].getMonth() + 1, 0);
        queryParams.from_date = formatDateYMD(firstDay);
        queryParams.to_date = formatDateYMD(lastDay);
        queryParams.per_page = 200;
      } else {
        queryParams.from_date = fromDate || undefined;
        queryParams.to_date = toDate || undefined;
        queryParams.page = page;
      }

      const [sRes, bRes, brRes, usersRes] = await Promise.all([
        api.get('/class-sessions', { params: queryParams }),
        api.get('/batches', { params: { per_page: 100 } }),
        api.get('/branches', { params: { per_page: 100 } }),
        api.get('/users', { params: { role: 'Trainer', per_page: 50 } }).catch(() => ({ data: { data: [] } })),
      ]);

      setSessions(sRes.data.data || []);
      if (sRes.data.meta) setPagination(sRes.data.meta);
      setBatches(bRes.data.data || []);
      setBranches(brRes.data.data || []);
      setTrainers(usersRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load class sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [viewMode, weekOffset, selectedDayDate, branchFilter, batchFilter, statusFilter, modeFilter, searchQuery, myScheduleOnly, fromDate, toDate, page]);

  // Conflict Checking Debounce
  useEffect(() => {
    if (!scheduleOpen || scheduleMode !== 'single') return;
    if (!scheduleForm.date || !scheduleForm.start_time || !scheduleForm.end_time) return;

    const timer = setTimeout(async () => {
      setConflictChecking(true);
      try {
        const res = await api.post('/class-sessions/check-conflicts', {
          date: scheduleForm.date,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time,
          batch_uuid: scheduleForm.batch_uuid || undefined,
          trainer_id: scheduleForm.trainer_id || undefined,
          location: scheduleForm.location || undefined,
        });
        if (res.data.success) {
          setConflicts(res.data.data.conflicts || []);
        }
      } catch (err) {
        console.error('Conflict check error:', err);
      } finally {
        setConflictChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [scheduleForm.date, scheduleForm.start_time, scheduleForm.end_time, scheduleForm.batch_uuid, scheduleForm.trainer_id, scheduleForm.location, scheduleOpen, scheduleMode]);

  // Handle Paper Quick-Pick in Single Form
  const handlePaperSelectSingle = (code: string) => {
    const paper = ACCA_PAPERS.find((p) => p.code === code);
    if (!paper) return;

    let startTime = '17:30';
    let endTime = '20:30';
    if (paper.slot === 'early_morning') {
      startTime = '06:00';
      endTime = '08:00';
    } else if (paper.slot === 'morning') {
      startTime = '08:30';
      endTime = '12:00';
    }

    setScheduleForm((prev) => ({
      ...prev,
      selected_paper: code,
      title: `ACCA ${paper.level}: ${paper.code} — ${paper.name}`,
      topic: `Core Syllabus Review & CBE Past Questions: ${paper.name}`,
      start_time: startTime,
      end_time: endTime,
    }));
  };

  // Handle Paper Quick-Pick in Recurring Form
  const handlePaperSelectRecurring = (code: string) => {
    const paper = ACCA_PAPERS.find((p) => p.code === code);
    if (!paper) return;

    let startTime = '17:30';
    let endTime = '20:30';
    if (paper.slot === 'early_morning') {
      startTime = '06:00';
      endTime = '08:00';
    } else if (paper.slot === 'morning') {
      startTime = '08:30';
      endTime = '12:00';
    }

    setRecurringForm((prev) => ({
      ...prev,
      selected_paper: code,
      title: `ACCA ${paper.level}: ${paper.code} — ${paper.name}`,
      topic: `Comprehensive lecture modules & exam practice for ${paper.name}`,
      start_time: startTime,
      end_time: endTime,
    }));
  };

  // Preset Time Slots
  const applyTimeSlotPreset = (start: string, end: string, isRecurring = false) => {
    if (isRecurring) {
      setRecurringForm((prev) => ({ ...prev, start_time: start, end_time: end }));
    } else {
      setScheduleForm((prev) => ({ ...prev, start_time: start, end_time: end }));
    }
  };

  // Schedule Single Session Submit
  const handleSingleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/class-sessions', {
        ...scheduleForm,
        allow_conflicts: conflicts.length > 0 ? window.confirm('Scheduling conflicts were detected. Do you want to proceed anyway?') : false,
      });
      setScheduleOpen(false);
      setConflicts([]);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule class session.');
    }
  };

  // Schedule Recurring Timetable Submit
  const handleRecurringScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/class-sessions/batch-schedule', recurringForm);
      alert(`Success! Generated ${res.data.data.created_count} recurring timetable sessions.`);
      setScheduleOpen(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate recurring timetable.');
    }
  };

  // Edit Session Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    try {
      await api.put(`/class-sessions/${activeSession.uuid}`, editForm);
      setEditOpen(false);
      setDetailOpen(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update class session.');
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (session: SessionItem, newStatus: string) => {
    try {
      await api.put(`/class-sessions/${session.uuid}`, { status: newStatus });
      fetchSessions();
      if (activeSession && activeSession.uuid === session.uuid) {
        setActiveSession({ ...activeSession, status: newStatus });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Delete Session
  const handleDeleteSession = async (session: SessionItem) => {
    if (!window.confirm(`Are you sure you want to remove '${session.title}' from the timetable?`)) return;
    try {
      await api.delete(`/class-sessions/${session.uuid}`);
      setDetailOpen(false);
      setActiveSession(null);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete class session.');
    }
  };

  // Attendance Roster Handlers
  const openAttendanceRoster = async (session: SessionItem) => {
    setActiveSession(session);
    try {
      const res = await api.get(`/class-sessions/${session.uuid}/attendance`);
      if (res.data.success) {
        setRoster(res.data.data.roster || []);
        setRosterOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load attendance roster.');
    }
  };

  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    try {
      await api.post(`/class-sessions/${activeSession.uuid}/attendance`, {
        records: roster.map((r) => ({
          student_uuid: r.student_uuid,
          status: r.status,
          remarks: r.remarks,
        })),
      });
      setRosterOpen(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save attendance.');
    }
  };

  // Standard Educational Timetable Slots
  const timeSlots = [
    {
      id: 'early_morning',
      label: 'Early Morning Review',
      timeRange: '06:00 – 08:00',
      description: 'Online revision & morning ACCA cohorts',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 5 && h < 8;
      },
    },
    {
      id: 'morning',
      label: 'Morning Session',
      timeRange: '08:30 – 12:00',
      description: 'Main lecture modules & practical applications',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 8 && h < 13;
      },
    },
    {
      id: 'afternoon',
      label: 'Afternoon Workshop',
      timeRange: '13:00 – 17:00',
      description: 'Tutorials, CBE test practice & problem solving',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 13 && h < 17;
      },
    },
    {
      id: 'evening',
      label: 'Evening Executive Session',
      timeRange: '17:30 – 20:30',
      description: 'Professional & working student cohorts',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 17;
      },
    },
  ];

  // Helper: check if session is happening right now
  const isSessionLiveNow = (session: SessionItem) => {
    if (session.date !== todayYMD) return false;
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const curTimeVal = currentH * 60 + currentM;

    const [sh, sm] = session.start_time.split(':').map(Number);
    const [eh, em] = session.end_time.split(':').map(Number);
    const startVal = sh * 60 + sm;
    const endVal = eh * 60 + em;

    return curTimeVal >= startVal && curTimeVal <= endVal;
  };

  // Summary statistics for the current timetable view
  const stats = useMemo(() => {
    const total = sessions.length;
    const online = sessions.filter((s) => s.delivery_mode === 'Online').length;
    const physical = sessions.filter((s) => s.delivery_mode === 'Physical').length;
    const todayCount = sessions.filter((s) => s.date === todayYMD).length;
    const liveNow = sessions.filter((s) => isSessionLiveNow(s)).length;
    return { total, online, physical, todayCount, liveNow };
  }, [sessions, todayYMD]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Operational Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
              Academic Operations
            </span>
            <span className="text-xs text-slate-400 font-semibold">• IAT Master Timetable</span>
            {stats.liveNow > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 text-[10px] font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {stats.liveNow} Live Now
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class Timetable & Scheduling</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full academic timetable matrix, automated lecture conflict detection, and live attendance tracking.
          </p>
        </div>

        {/* View Mode & Scheduling Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-[#73111b] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Weekly Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'day'
                  ? 'bg-white text-[#73111b] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Daily Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-[#73111b] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Agenda Cards</span>
            </button>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            title="Print Timetable Matrix"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Schedule Session Button */}
          {hasPermission('classes.manage') && (
            <button
              onClick={() => {
                setScheduleMode('single');
                setScheduleOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Session</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Operational Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#73111b] shrink-0">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Scheduled</p>
            <p className="text-lg font-black text-slate-900">{stats.total} Sessions</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online Virtual</p>
            <p className="text-lg font-black text-blue-900">{stats.online} Google Meet</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campus Classes</p>
            <p className="text-lg font-black text-emerald-900">{stats.physical} Physical</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Lectures</p>
            <p className="text-lg font-black text-slate-900">{stats.todayCount} Today</p>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Filter & Navigation Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 items-center">
          {/* Search Query */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper (e.g. TX, FR, SBL), topic, trainer..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="">All Campuses</option>
            {branches.map((b) => (
              <option key={b.uuid} value={b.uuid}>{b.name}</option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="">All Cohort Intakes</option>
            {batches.map((b) => (
              <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
            ))}
          </select>

          {/* Delivery Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="">All Delivery Modes</option>
            <option value="Online">Online (Virtual Live)</option>
            <option value="Physical">Physical (On-Campus)</option>
            <option value="Hybrid">Hybrid Delivery</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date Navigation & Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {viewMode === 'grid' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  weekOffset === 0
                    ? 'bg-[#fff1f2] border border-[#fecdd3] text-[#73111b]'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                This Week
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <span className="font-bold text-slate-900 ml-1">
                {weekRangeLabel}
              </span>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-500">Selected Day:</label>
              <input
                type="date"
                value={selectedDayDate}
                onChange={(e) => setSelectedDayDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
              />
              <button
                type="button"
                onClick={() => setSelectedDayDate(todayYMD)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                  selectedDayDate === todayYMD
                    ? 'bg-[#fff1f2] border border-[#fecdd3] text-[#73111b]'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                Today
              </button>
            </div>
          )}

          {viewMode === 'cards' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Date Range:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
          )}

          {/* Quick toggle: My Schedule Only */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={myScheduleOnly}
                onChange={(e) => setMyScheduleOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#73111b] focus:ring-[#73111b]"
              />
              <span>My Enrolled / Assigned Classes Only</span>
            </label>
          </div>
        </div>
      </Card>

      {/* VIEW 1: WEEKLY MATRIX (Core Grid View) */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-2xs">
            <div className="min-w-[1040px]">
              {/* Day Header Row */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/90 text-slate-700">
                <div className="p-3.5 border-r border-slate-200 font-bold text-xs text-slate-500 uppercase flex items-center justify-center">
                  Time Slot
                </div>
                {weekDates.map((d) => {
                  const dateStr = formatDateYMD(d);
                  const isToday = dateStr === todayYMD;
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <div
                      key={dateStr}
                      className={`p-3 text-center border-r border-slate-200 last:border-r-0 transition ${
                        isToday ? 'bg-[#fff1f2]/90 border-b-2 border-b-[#73111b]' : ''
                      }`}
                    >
                      <span className={`text-[11px] font-bold block uppercase ${isToday ? 'text-[#73111b]' : 'text-slate-500'}`}>
                        {dayName}
                      </span>
                      <span className={`text-sm font-black inline-block mt-0.5 ${isToday ? 'text-[#73111b]' : 'text-slate-900'}`}>
                        {dayNum} {monthName}
                      </span>
                      {isToday && (
                        <span className="block mt-1 mx-auto w-1.5 h-1.5 rounded-full bg-[#73111b]" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time Slot Rows */}
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="grid grid-cols-8 border-b border-slate-200 last:border-b-0 min-h-[145px]"
                >
                  {/* Slot Label Column */}
                  <div className="p-3 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-900 block">{slot.label}</span>
                    <span className="text-[11px] font-mono text-[#73111b] font-semibold mt-0.5">
                      {slot.timeRange}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                      {slot.description}
                    </span>
                  </div>

                  {/* 7 Days for this Time Slot */}
                  {weekDates.map((d) => {
                    const dateStr = formatDateYMD(d);
                    const isToday = dateStr === todayYMD;

                    const slotSessions = sessions.filter(
                      (s) => s.date === dateStr && slot.isMatch(s.start_time)
                    );

                    return (
                      <div
                        key={dateStr}
                        className={`p-2 border-r border-slate-200 last:border-r-0 space-y-2 transition flex flex-col justify-start ${
                          isToday ? 'bg-rose-50/15' : 'hover:bg-slate-50/40'
                        }`}
                      >
                        {slotSessions.length > 0 ? (
                          slotSessions.map((s) => {
                            const pStyle = getPaperStyle(s.title);
                            const isLive = isSessionLiveNow(s);

                            return (
                              <div
                                key={s.uuid}
                                className={`p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#73111b]/40 transition text-left cursor-pointer group relative border-l-4 ${pStyle.bar}`}
                                onClick={() => {
                                  setActiveSession(s);
                                  setDetailOpen(true);
                                }}
                              >
                                {isLive && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                  </span>
                                )}

                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[10px] font-black text-[#73111b] font-mono">
                                    {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${pStyle.badge}`}
                                  >
                                    {pStyle.label}
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#73111b] transition">
                                  {s.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">
                                  {s.batch?.name || s.batch?.code}
                                </p>

                                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                  <span className="truncate max-w-[70px]">
                                    {s.trainer?.full_name?.split(' ')[0] || 'Trainer'}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    {s.meeting_url && (
                                      <a
                                        href={s.meeting_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
                                        title="Launch Google Meet"
                                      >
                                        <Video className="h-3 w-3" />
                                        <span>Meet</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-300 select-none py-4">
                            —
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY TIMELINE VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daily Lecture Schedule: {new Date(selectedDayDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-500">
                  {sessions.length} sessions scheduled for this date.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(selectedDayDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDayDate(formatDateYMD(d));
                  }}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(selectedDayDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDayDate(formatDateYMD(d));
                  }}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No class sessions scheduled on this date.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => {
                  const pStyle = getPaperStyle(s.title);
                  const isLive = isSessionLiveNow(s);

                  return (
                    <div
                      key={s.uuid}
                      className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isLive ? 'bg-emerald-50/30 border-emerald-300' : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {s.start_time.slice(0, 5)}
                          </span>
                          <span className="text-xs font-black text-[#73111b]">
                            {s.end_time.slice(0, 5)}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${pStyle.badge}`}>
                              {pStyle.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                              {s.delivery_mode}
                            </span>
                            <Badge variant={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'primary' : 'warning'}>
                              {s.status}
                            </Badge>
                            {isLive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] animate-pulse">
                                Live Session Now
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                          <p className="text-xs text-[#73111b] font-semibold mt-0.5">
                            {s.batch?.name} • Branch: {s.batch?.branch?.name || 'Main Campus'}
                          </p>
                          {s.topic && <p className="text-xs text-slate-500 mt-1 italic">{s.topic}</p>}

                          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span>Trainer: {s.trainer?.full_name || 'Assigned Lead Trainer'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              <span>{s.location || 'Online Virtual Campus'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {s.meeting_url && (
                          <a
                            href={s.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs transition"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Join Live Meet</span>
                          </a>
                        )}

                        {hasPermission('attendance.create') && (
                          <button
                            type="button"
                            onClick={() => openAttendanceRoster(s)}
                            className="px-3.5 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white transition shadow-xs"
                          >
                            {s.attendance_session ? 'Edit Attendance' : 'Mark Attendance'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSession(s);
                            setDetailOpen(true);
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: AGENDA / CARD LIST VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-16 text-center text-xs text-slate-400">
                Loading scheduled class sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-slate-400">
                No class sessions scheduled matching current filters.
              </div>
            ) : (
              sessions.map((s) => {
                const pStyle = getPaperStyle(s.title);
                const isLive = isSessionLiveNow(s);

                return (
                  <Card key={s.uuid} className={`flex flex-col justify-between hover:border-slate-300 transition relative border-l-4 ${pStyle.bar}`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${pStyle.badge}`}>
                            {pStyle.label}
                          </span>
                          <Badge variant={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'primary' : 'warning'}>
                            {s.status}
                          </Badge>
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] animate-pulse">
                              Live
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{s.delivery_mode}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                      <p className="text-xs text-[#73111b] font-semibold mt-0.5">{s.batch?.name}</p>
                      {s.topic && <p className="text-xs text-slate-500 mt-1 italic">{s.topic}</p>}

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{s.date} • {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{s.location || 'Online Virtual Campus'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>Trainer: {s.trainer?.full_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {s.meeting_url ? (
                        <a
                          href={s.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Live Meet
                        </a>
                      ) : <span />}

                      <div className="flex items-center gap-2">
                        {hasPermission('attendance.create') && (
                          <button
                            onClick={() => openAttendanceRoster(s)}
                            className="px-3 py-1.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white transition shadow-2xs"
                          >
                            {s.attendance_session ? 'Attendance' : 'Mark'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveSession(s);
                            setDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* 4. Session Details Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setActiveSession(null);
        }}
        title="Class Session Details"
        subtitle={activeSession?.batch?.name}
      >
        {activeSession && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={activeSession.status === 'completed' ? 'success' : activeSession.status === 'in_progress' ? 'primary' : 'warning'}>
                    {activeSession.status}
                  </Badge>
                  <span className="text-xs font-bold text-slate-600">{activeSession.delivery_mode}</span>
                </div>
                {/* Status Switcher for Coordinators */}
                {hasPermission('classes.manage') && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Mark:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(activeSession, 'in_progress')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(activeSession, 'completed')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      Completed
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">{activeSession.title}</h3>
              {activeSession.topic && (
                <p className="text-xs text-slate-500 mt-1 italic">{activeSession.topic}</p>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#73111b]" />
                <span className="font-semibold">{activeSession.date}</span>
                <span className="text-slate-500 font-mono">
                  ({activeSession.start_time.slice(0, 5)} – {activeSession.end_time.slice(0, 5)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#73111b]" />
                <span>{activeSession.location || 'Online Virtual Campus'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#73111b]" />
                <span>Trainer: {activeSession.trainer?.full_name} ({activeSession.trainer?.email})</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#73111b]" />
                <span>Batch Code: {activeSession.batch?.code}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {activeSession.meeting_url && (
                  <a
                    href={activeSession.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-2 shadow-xs transition"
                  >
                    <Video className="h-4 w-4" />
                    <span>Launch Google Meet</span>
                  </a>
                )}

                {hasPermission('attendance.create') && (
                  <button
                    onClick={() => {
                      setDetailOpen(false);
                      openAttendanceRoster(activeSession);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white transition shadow-xs"
                  >
                    {activeSession.attendance_session ? 'Edit Attendance' : 'Mark Attendance'}
                  </button>
                )}
              </div>

              {hasPermission('classes.manage') && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        title: activeSession.title,
                        topic: activeSession.topic || '',
                        date: typeof activeSession.date === 'string' ? activeSession.date.split('T')[0] : '',
                        start_time: activeSession.start_time.slice(0, 5),
                        end_time: activeSession.end_time.slice(0, 5),
                        delivery_mode: activeSession.delivery_mode,
                        location: activeSession.location || '',
                        meeting_url: activeSession.meeting_url || '',
                        status: activeSession.status,
                        notes: activeSession.notes || '',
                      });
                      setEditOpen(true);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    title="Edit Session Details"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(activeSession)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    title="Remove from Timetable"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Schedule Session Modal (Single vs Recurring Timetable Generator) */}
      <Modal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Timetable Session Scheduler"
        subtitle="Schedule individual lectures or generate a recurring term timetable"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setScheduleMode('single')}
              className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
                scheduleMode === 'single'
                  ? 'border-[#73111b] text-[#73111b]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Single Session</span>
            </button>
            <button
              type="button"
              onClick={() => setScheduleMode('recurring')}
              className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
                scheduleMode === 'recurring'
                  ? 'border-[#73111b] text-[#73111b]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Repeat className="h-4 w-4" />
              <span>Recurring Timetable Generator</span>
            </button>
          </div>

          {/* TAB A: SINGLE SESSION */}
          {scheduleMode === 'single' && (
            <form onSubmit={handleSingleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intake Batch *</label>
                <select
                  required
                  value={scheduleForm.batch_uuid}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, batch_uuid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                >
                  <option value="">Select Cohort Intake</option>
                  {batches.map((b) => (
                    <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* ACCA Paper Quick Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quick Select ACCA Paper (Auto-populates Title & Topic)
                </label>
                <select
                  value={scheduleForm.selected_paper}
                  onChange={(e) => handlePaperSelectSingle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-rose-50/40 border border-[#fecdd3] rounded-xl text-xs text-slate-800 focus:outline-none font-semibold"
                >
                  <option value="">-- Choose ACCA Paper --</option>
                  {ACCA_PAPERS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code}: {p.name} ({p.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. ACCA Applied Skills: TX - Taxation (Corporation Tax & Reliefs)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Syllabus Focus</label>
                <input
                  type="text"
                  value={scheduleForm.topic}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, topic: e.target.value })}
                  placeholder="e.g. Trading profits, capital allowances, and self-assessment deadlines"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                />
              </div>

              {/* Date & Time with Presets */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Schedule Time Slot</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyTimeSlotPreset('06:00', '08:00')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-100"
                    >
                      06:00–08:00
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTimeSlotPreset('08:30', '12:00')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-100"
                    >
                      08:30–12:00
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTimeSlotPreset('17:30', '20:30')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-100 text-[#73111b]"
                    >
                      17:30–20:30
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#73111b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#73111b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time *</label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#73111b]"
                    />
                  </div>
                </div>
              </div>

              {/* Conflict Alert Box */}
              {conflictChecking ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Checking room and trainer timetabling availability...</span>
                </div>
              ) : conflicts.length > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Timetabling Conflict Detected</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-semibold">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Time slot and venue are clear for scheduling.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
                  <select
                    value={scheduleForm.delivery_mode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, delivery_mode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="Online">Online (Google Meet Virtual)</option>
                    <option value="Physical">Physical (On-Campus)</option>
                    <option value="Hybrid">Hybrid Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Classroom / Location</label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    placeholder="e.g. Lab 2, Nairobi Campus or Virtual"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Meet / Live Video Link</label>
                <input
                  type="url"
                  value={scheduleForm.meeting_url}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_url: e.target.value })}
                  placeholder="https://meet.google.com/xyz-iat-live"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          )}

          {/* TAB B: RECURRING TIMETABLE GENERATOR */}
          {scheduleMode === 'recurring' && (
            <form onSubmit={handleRecurringScheduleSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-rose-50/50 border border-[#fecdd3] text-xs text-slate-700">
                <span className="font-bold text-[#73111b] block mb-1">Automated Term Timetabling</span>
                Generate an entire semester/term of lecture sessions across selected days of the week in a single operation.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intake Batch *</label>
                <select
                  required
                  value={recurringForm.batch_uuid}
                  onChange={(e) => setRecurringForm({ ...recurringForm, batch_uuid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="">Select Cohort Intake</option>
                  {batches.map((b) => (
                    <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* Paper Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ACCA Paper / Subject
                </label>
                <select
                  value={recurringForm.selected_paper}
                  onChange={(e) => handlePaperSelectRecurring(e.target.value)}
                  className="w-full px-3.5 py-2 bg-rose-50/40 border border-[#fecdd3] rounded-xl text-xs text-slate-800 focus:outline-none font-semibold"
                >
                  <option value="">-- Choose ACCA Paper --</option>
                  {ACCA_PAPERS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code}: {p.name} ({p.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Series Title Template *</label>
                <input
                  type="text"
                  required
                  value={recurringForm.title}
                  onChange={(e) => setRecurringForm({ ...recurringForm, title: e.target.value })}
                  placeholder="e.g. ACCA Applied Skills: FR - Financial Reporting"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Days of Week Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Scheduled Days of Week *</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const isSelected = recurringForm.days_of_week.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = isSelected
                            ? recurringForm.days_of_week.filter((d) => d !== day)
                            : [...recurringForm.days_of_week, day];
                          setRecurringForm({ ...recurringForm, days_of_week: newDays });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          isSelected
                            ? 'bg-[#73111b] text-white border-[#73111b] shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Term Start Date *</label>
                  <input
                    type="date"
                    required
                    value={recurringForm.start_date}
                    onChange={(e) => setRecurringForm({ ...recurringForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Term End Date *</label>
                  <input
                    type="date"
                    required
                    value={recurringForm.end_date}
                    onChange={(e) => setRecurringForm({ ...recurringForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Time Slot Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={recurringForm.start_time}
                    onChange={(e) => setRecurringForm({ ...recurringForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={recurringForm.end_time}
                    onChange={(e) => setRecurringForm({ ...recurringForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
                  <select
                    value={recurringForm.delivery_mode}
                    onChange={(e) => setRecurringForm({ ...recurringForm, delivery_mode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Online">Online (Virtual Live)</option>
                    <option value="Physical">Physical (On-Campus)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Classroom / Meeting Link</label>
                  <input
                    type="text"
                    value={recurringForm.location}
                    onChange={(e) => setRecurringForm({ ...recurringForm, location: e.target.value })}
                    placeholder="e.g. Lab 3 or Virtual Campus"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2"
                >
                  <Repeat className="h-4 w-4" />
                  <span>Generate Term Timetable</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* 6. Edit Session Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Class Session"
        subtitle={`Session: ${activeSession?.title}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
            <input
              type="text"
              value={editForm.topic}
              onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={editForm.start_time}
                onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={editForm.end_time}
                onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
              <select
                value={editForm.delivery_mode}
                onChange={(e) => setEditForm({ ...editForm, delivery_mode: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location / Classroom</label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Google Meet URL</label>
            <input
              type="url"
              value={editForm.meeting_url}
              onChange={(e) => setEditForm({ ...editForm, meeting_url: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-2xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Attendance Roster Modal */}
      <Modal
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        title="Class Attendance Roster"
        subtitle={`Session: ${activeSession?.title} • ${activeSession?.date}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Student #</th>
                  <th className="py-2.5 px-3">Attendance Status</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {roster.map((r, idx) => (
                  <tr key={r.student_uuid}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.student_name}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{r.student_number}</td>
                    <td className="py-2.5 px-3">
                      <select
                        value={r.status}
                        onChange={(e) => {
                          const newR = [...roster];
                          newR[idx].status = e.target.value;
                          setRoster(newR);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          r.status === 'Present'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : r.status === 'Absent'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Excused">Excused</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={r.remarks || ''}
                        onChange={(e) => {
                          const newR = [...roster];
                          newR[idx].remarks = e.target.value;
                          setRoster(newR);
                        }}
                        placeholder="Optional remarks..."
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRosterOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30"
            >
              Save Attendance Marks
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Calendar,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Filter,
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
  attendance_session?: any;
}

export const ClassTimetablePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [weekOffset, setWeekOffset] = useState(0);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [branchFilter, setBranchFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionItem | null>(null);
  const [roster, setRoster] = useState<any[]>([]);

  const [scheduleForm, setScheduleForm] = useState({
    batch_uuid: '',
    title: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '06:00',
    end_time: '08:00',
    delivery_mode: 'Online',
    location: 'Google Meet Virtual Campus',
    meeting_url: 'https://meet.google.com/xyz-iat-live',
  });

  // Calculate Monday–Sunday of the selected week offset
  const weekDates = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    const day = today.getDay();
    // Monday = 1, Sunday = 0
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

  const weekRangeLabel = useMemo(() => {
    if (weekDates.length < 7) return '';
    const start = weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} – ${end}`;
  }, [weekDates]);

  const formatDateYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let queryParams: any = {
        branch_uuid: branchFilter || undefined,
        batch_uuid: batchFilter || undefined,
        status: statusFilter || undefined,
      };

      if (viewMode === 'grid') {
        queryParams.from_date = formatDateYMD(weekDates[0]);
        queryParams.to_date = formatDateYMD(weekDates[6]);
        queryParams.per_page = 100;
      } else {
        queryParams.from_date = fromDate || undefined;
        queryParams.to_date = toDate || undefined;
        queryParams.page = page;
      }

      const [sRes, bRes, brRes] = await Promise.all([
        api.get('/class-sessions', { params: queryParams }),
        api.get('/batches', { params: { per_page: 100 } }),
        api.get('/branches', { params: { per_page: 100 } }),
      ]);

      setSessions(sRes.data.data || []);
      if (sRes.data.meta) setPagination(sRes.data.meta);
      setBatches(bRes.data.data || []);
      setBranches(brRes.data.data || []);
    } catch (err) {
      console.error('Failed to load class sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [viewMode, weekOffset, branchFilter, batchFilter, statusFilter, fromDate, toDate, page]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/class-sessions', scheduleForm);
      setScheduleOpen(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule class session.');
    }
  };

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

  // Define standard educational timetable time slots
  const timeSlots = [
    {
      id: 'early_morning',
      label: 'Early Morning',
      timeRange: '06:00 – 08:00',
      description: 'ACCA Morning Classes & Online Review',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 5 && h < 8;
      },
    },
    {
      id: 'morning',
      label: 'Morning Session',
      timeRange: '08:30 – 12:00',
      description: 'Daytime Lectures & Practical Labs',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 8 && h < 13;
      },
    },
    {
      id: 'afternoon',
      label: 'Afternoon Session',
      timeRange: '13:00 – 17:00',
      description: 'Applied Workshops & Tutorial Groups',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 13 && h < 17;
      },
    },
    {
      id: 'evening',
      label: 'Evening Session',
      timeRange: '17:30 – 20:30',
      description: 'Executive & Professional Evening Cohorts',
      isMatch: (start: string) => {
        const h = parseInt(start.split(':')[0], 10);
        return h >= 17;
      },
    },
  ];

  const todayYMD = formatDateYMD(new Date());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
              Academic Operations
            </span>
            <span className="text-xs text-slate-400">• IAT Master Timetable</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Class Timetable & Attendance</h1>
          <p className="text-xs text-slate-500">
            Interactive weekly timetable matrix and lecture attendance tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-[#73111b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Weekly Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-[#73111b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Card List</span>
            </button>
          </div>

          {hasPermission('classes.manage') && (
            <button
              onClick={() => setScheduleOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          >
            <option value="">All Campus Branches</option>
            {branches.map((b) => (
              <option key={b.uuid} value={b.uuid}>{b.name}</option>
            ))}
          </select>

          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          >
            <option value="">All Intake Batches</option>
            {batches.map((b) => (
              <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {viewMode === 'cards' ? (
            <>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                placeholder="From date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                placeholder="To date"
              />
            </>
          ) : (
            /* Weekly Controls */
            <div className="md:col-span-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
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
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <span className="text-xs font-bold text-slate-800 shrink-0 ml-1">
                {weekRangeLabel}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* VIEW 1: WEEKLY MATRIX GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="min-w-[1000px]">
              {/* Day Header Row */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/80 text-slate-700">
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
                      className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                        isToday ? 'bg-[#fff1f2]/80' : ''
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                        {dayName}
                      </span>
                      <span
                        className={`text-sm font-black inline-block mt-0.5 ${
                          isToday ? 'text-[#73111b]' : 'text-slate-900'
                        }`}
                      >
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
                  className="grid grid-cols-8 border-b border-slate-200 last:border-b-0 min-h-[140px]"
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

                    // Find all sessions on this date that match this slot
                    const slotSessions = sessions.filter(
                      (s) => s.date === dateStr && slot.isMatch(s.start_time)
                    );

                    return (
                      <div
                        key={dateStr}
                        className={`p-2 border-r border-slate-200 last:border-r-0 space-y-2 transition flex flex-col justify-start ${
                          isToday ? 'bg-rose-50/20' : 'hover:bg-slate-50/40'
                        }`}
                      >
                        {slotSessions.length > 0 ? (
                          slotSessions.map((s) => (
                            <div
                              key={s.uuid}
                              className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#73111b]/40 transition text-left cursor-pointer group"
                              onClick={() => {
                                setActiveSession(s);
                                setDetailOpen(true);
                              }}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-bold text-[#73111b] truncate">
                                  {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                                    s.delivery_mode === 'Online'
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {s.delivery_mode}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#73111b] transition">
                                {s.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">
                                {s.batch?.code || s.batch?.name}
                              </p>

                              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                <span className="truncate max-w-[80px]">
                                  {s.trainer?.full_name?.split(' ')[0] || 'Trainer'}
                                </span>

                                {s.meeting_url && (
                                  <a
                                    href={s.meeting_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
                                    title="Launch Google Meet Session"
                                  >
                                    <Video className="h-3 w-3" />
                                    <span>Meet</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
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

      {/* VIEW 2: CARDS LIST VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-16 text-center text-xs text-slate-400">
                Loading scheduled sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="col-span-full py-16 text-center text-xs text-slate-400">
                No class sessions scheduled matching current filters.
              </div>
            ) : (
              sessions.map((s) => (
                <Card key={s.uuid} className="flex flex-col justify-between hover:border-slate-300 transition">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={s.status === 'completed' ? 'success' : 'primary'}>{s.status}</Badge>
                      <span className="text-xs text-slate-500 font-medium">{s.delivery_mode}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                    <p className="text-xs text-[#73111b] font-semibold mt-0.5">{s.batch?.name}</p>
                    {s.topic && <p className="text-xs text-slate-500 mt-1 italic">{s.topic}</p>}

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{s.date} • {s.start_time} - {s.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{s.location || 'Online Campus'}</span>
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
                        className="text-xs font-bold text-[#73111b] hover:underline flex items-center gap-1"
                      >
                        <Video className="h-3.5 w-3.5" /> Join Live Meet
                      </a>
                    ) : <span />}

                    {hasPermission('attendance.create') && (
                      <button
                        onClick={() => openAttendanceRoster(s)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white transition shadow-xs"
                      >
                        {s.attendance_session ? 'Edit Attendance' : 'Mark Attendance'}
                      </button>
                    )}
                  </div>
                </Card>
              ))
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

      {/* Session Details Modal (Opened when clicking a calendar cell) */}
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
                <Badge variant={activeSession.status === 'completed' ? 'success' : 'primary'}>
                  {activeSession.status}
                </Badge>
                <span className="text-xs font-bold text-slate-600">{activeSession.delivery_mode}</span>
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
                  ({activeSession.start_time} – {activeSession.end_time})
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {activeSession.meeting_url ? (
                <a
                  href={activeSession.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-2 shadow-xs transition"
                >
                  <Video className="h-4 w-4" />
                  <span>Launch Google Meet Session</span>
                </a>
              ) : <div />}

              {hasPermission('attendance.create') && (
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    openAttendanceRoster(activeSession);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white transition shadow-xs"
                >
                  {activeSession.attendance_session ? 'Edit Attendance Roster' : 'Mark Attendance Roster'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Class Session"
        subtitle="Timetable lecture or practical lab"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Intake Batch *</label>
            <select
              required
              value={scheduleForm.batch_uuid}
              onChange={(e) => setScheduleForm({ ...scheduleForm, batch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Intake</option>
              {batches.map((b) => (
                <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
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
              placeholder="e.g. ACCA FFA: Chapter 4 - Control Accounts & Reconciliations"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
              <select
                value={scheduleForm.delivery_mode}
                onChange={(e) => setScheduleForm({ ...scheduleForm, delivery_mode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="Online">Online (Virtual Live)</option>
                <option value="Physical">Physical (On-Campus)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Classroom</label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                placeholder="Google Meet or Lab 2, Nairobi Campus"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Google Meet / Live Link</label>
            <input
              type="url"
              value={scheduleForm.meeting_url}
              onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_url: e.target.value })}
              placeholder="https://meet.google.com/xyz-iat-live"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
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
      </Modal>

      {/* Attendance Roster Modal */}
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

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, Clock, Users, Video, MapPin, RotateCcw } from 'lucide-react';
import type { CourseBatch, Branch } from '../../../types/models';

export const ClassTimetablePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);

  const [scheduleForm, setScheduleForm] = useState({
    batch_uuid: '',
    title: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '11:00',
    delivery_mode: 'Physical',
    location: 'Lab 2, Main Campus',
    meeting_url: '',
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, brRes] = await Promise.all([
        api.get('/class-sessions', { params: { branch_uuid: branchFilter || undefined, status: statusFilter || undefined, from_date: fromDate || undefined, to_date: toDate || undefined, page } }),
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
  }, [branchFilter, statusFilter, fromDate, toDate, page]);

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

  const openAttendanceRoster = async (session: any) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Class Timetable & Attendance</h1>
          <p className="text-xs text-slate-500">Schedule live lecture/lab sessions and record student attendance rosters.</p>
        </div>
        {hasPermission('classes.manage') && (
          <button
            onClick={() => setScheduleOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Session</span>
          </button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Campus Branches</option>{branches.map((branch) => <option key={branch.uuid} value={branch.uuid}>{branch.name}</option>)}</select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Session Statuses</option><option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="From date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="To date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <button onClick={() => { setBranchFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); setPage(1); }} title="Clear filters" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4 mx-auto" /></button>
        </div>
      </Card>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Loading scheduled sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No class sessions scheduled.
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
                    <Video className="h-3.5 w-3.5" /> Join Link
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
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />

      {/* Schedule Modal */}
      <Modal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Class Session"
        subtitle="Timetable lecture or practical lab"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cohort Batch *</label>
            <select
              required
              value={scheduleForm.batch_uuid}
              onChange={(e) => setScheduleForm({ ...scheduleForm, batch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Cohort</option>
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
              placeholder="e.g. Practical Lab 04: Subnet Masking & Routing Protocols"
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
                <option value="Physical">Physical (On-Campus)</option>
                <option value="Online">Online (Virtual Live)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Classroom</label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                placeholder="Lab 2, Nairobi Campus"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
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

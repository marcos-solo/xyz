import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, RotateCcw } from 'lucide-react';
import type { Enrollment, CourseBatch, StudentProfile } from '../../../types/models';

export const EnrollmentsListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [createOpen, setCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    student_uuid: '',
    batch_uuid: '',
    enrollment_date: new Date().toISOString().split('T')[0],
  });

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const [eRes, bRes, sRes] = await Promise.all([
        api.get('/enrollments', { params: { course_uuid: courseFilter || undefined, batch_uuid: batchFilter || undefined, status: statusFilter || undefined, from_date: fromDate || undefined, to_date: toDate || undefined, page } }),
        api.get('/batches', { params: { per_page: 100 } }),
        api.get('/students', { params: { per_page: 100 } }),
      ]);
      setEnrollments(eRes.data.data || []);
      if (eRes.data.meta) setPagination(eRes.data.meta);
      setBatches(bRes.data.data || []);
      setStudents(sRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [courseFilter, batchFilter, statusFilter, fromDate, toDate, page]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/enrollments', formData);
      setCreateOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to enroll student.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Cohort Enrollments</h1>
          <p className="text-xs text-slate-500">Manage student batch assignments, enrollment numbers, and progress statuses.</p>
        </div>
        {hasPermission('enrollments.create') && (
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll Student to Batch</span>
          </button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Courses</option>{[...new Map(batches.map((b) => [b.course?.uuid, b.course])).values()].filter(Boolean).map((course: any) => <option key={course.uuid} value={course.uuid}>{course.name}</option>)}</select>
          <select value={batchFilter} onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Cohorts</option>{batches.map((batch) => <option key={batch.uuid} value={batch.uuid}>{batch.name}</option>)}</select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Statuses</option><option value="Pending">Pending</option><option value="Active">Active</option><option value="Completed">Completed</option><option value="Suspended">Suspended</option><option value="Withdrawn">Withdrawn</option></select>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="From date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="To date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <button onClick={() => { setCourseFilter(''); setBatchFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); setPage(1); }} title="Clear filters" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4 mx-auto" /></button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Enrollment #</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Cohort Batch</th>
                <th className="py-3.5 px-4">Campus</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading enrollments...</td></tr>
              ) : (
                enrollments.map((enr) => (
                  <tr key={enr.uuid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#73111b]">{enr.enrollment_number}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{enr.student?.full_name}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{enr.batch?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{enr.batch?.branch?.name || 'Main Campus'}</td>
                    <td className="py-3 px-4 text-slate-500">{enr.enrollment_date}</td>
                    <td className="py-3 px-4">
                      <Badge variant={enr.status === 'Active' ? 'success' : 'primary'}>{enr.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Enroll Student to Cohort">
        <form onSubmit={handleEnroll} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={formData.student_uuid}
              onChange={(e) => setFormData({ ...formData, student_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st.user.uuid} value={st.user.uuid}>{st.user.full_name} ({st.student_number})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Cohort Batch *</label>
            <select
              required
              value={formData.batch_uuid}
              onChange={(e) => setFormData({ ...formData, batch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Cohort</option>
              {batches.map((b) => (
                <option key={b.uuid} value={b.uuid}>{b.name} ({b.code}) • {b.branch?.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20">Enroll Student</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

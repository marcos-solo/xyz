import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, Calendar, Building, UserCheck, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import type { CourseBatch, Course, Branch } from '../../../types/models';

const dateOnly = (value?: string): string => value ? value.slice(0, 10) : '';

const formatBatchDate = (value?: string): string => {
  const normalized = dateOnly(value);
  if (!normalized) return 'Not scheduled';

  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${normalized}T00:00:00`));
};

export const BatchesListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<CourseBatch | null>(null);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    course_uuid: '',
    branch_uuid: '',
    name: '',
    code: '',
    start_date: '',
    end_date: '',
    capacity: 25,
    status: 'ongoing',
  });

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const [batchRes, cRes, bRes] = await Promise.all([
        api.get('/batches', { params: { branch_uuid: branchFilter || undefined, category_uuid: categoryFilter || undefined, course_uuid: courseFilter || undefined, status: statusFilter || undefined, from_date: fromDate || undefined, to_date: toDate || undefined, page } }),
        api.get('/courses', { params: { per_page: 100 } }),
        api.get('/branches', { params: { per_page: 100 } }),
      ]);
      setBatches(batchRes.data.data || []);
      if (batchRes.data.meta) setPagination(batchRes.data.meta);
      setCourses(cRes.data.data || []);
      setBranches(bRes.data.data || []);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [branchFilter, categoryFilter, courseFilter, statusFilter, fromDate, toDate, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/batches', formData);
      setCreateOpen(false);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create intake batch.');
    }
  };

  const openEdit = (b: CourseBatch) => {
    setSelectedBatch(b);
    setFormData({
      course_uuid: b.course?.uuid || '',
      branch_uuid: b.branch?.uuid || '',
      name: b.name,
      code: b.code,
      start_date: dateOnly(b.start_date),
      end_date: dateOnly(b.end_date),
      capacity: b.capacity || 25,
      status: b.status || 'ongoing',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      await api.put(`/batches/${selectedBatch.uuid}`, formData);
      setEditOpen(false);
      setSelectedBatch(null);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update intake batch.');
    }
  };

  const openDelete = (b: CourseBatch) => {
    setSelectedBatch(b);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBatch) return;
    try {
      await api.delete(`/batches/${selectedBatch.uuid}`);
      setDeleteOpen(false);
      setSelectedBatch(null);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete intake batch.');
    }
  };

  const openAssignModal = async (batch: CourseBatch) => {
    setSelectedBatch(batch);
    try {
      const res = await api.get('/staff');
      const allStaff: any[] = res.data.data || [];
      const trainerList = allStaff.filter((s) => {
        const u = s.user || s;
        const r = u.roles || [];
        return r.some((role: any) => {
          const name = typeof role === 'string' ? role : role.name;
          return name === 'Trainer' || name === 'Super Admin' || name === 'CEO';
        });
      });
      setTrainers(trainerList);
      setSelectedTrainerIds(batch.trainers?.map((t) => t.uuid) || []);
      setAssignOpen(true);
    } catch (err) {
      console.error('Failed to load trainers:', err);
    }
  };

  const handleSaveTrainers = async () => {
    if (!selectedBatch) return;
    try {
      // Map selected UUIDs to trainer objects and extract their IDs
      const trainersData = selectedTrainerIds.map((uuid, index) => {
        const trainerItem = trainers.find((t) => (t.user?.uuid || t.uuid) === uuid);
        const trainer = trainerItem?.user || trainerItem;
        return {
          trainer_id: trainer?.id,
          role_type: index === 0 ? 'Lead Trainer' : 'Assistant Trainer',
        };
      });

      await api.post(`/batches/${selectedBatch.uuid}/trainers`, {
        trainers: trainersData,
      });
      setAssignOpen(false);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign trainers.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Intake Batches & Class Groups</h1>
          <p className="text-xs text-slate-500">Schedule intake groups, assign certified instructors, and monitor enrollment capacities.</p>
        </div>
        {hasPermission('batches.create') && (
          <button
            onClick={() => {
              setFormData({
                course_uuid: courses[0]?.uuid || '',
                branch_uuid: branches[0]?.uuid || '',
                name: '',
                code: '',
                start_date: '',
                end_date: '',
                capacity: 25,
                status: 'ongoing',
              });
              setCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Launch Intake Batch</span>
          </button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCourseFilter(''); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Categories</option>{[...new Map(courses.map((course) => [course.category?.uuid, course.category])).values()].filter(Boolean).map((category: any) => <option key={category.uuid} value={category.uuid}>{category.name}</option>)}</select>
          <select value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
            <option value="">All Campus Branches</option>
            {branches.map((branch) => <option key={branch.uuid} value={branch.uuid}>{branch.name}</option>)}
          </select>
          <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
            <option value="">All Courses</option>
            {courses.filter((course) => !categoryFilter || course.category?.uuid === categoryFilter).map((course) => <option key={course.uuid} value={course.uuid}>{course.name} ({course.category?.name || 'Uncategorized'})</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
            <option value="">All Intake Statuses</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="Start date from" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="End date to" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <button onClick={() => { setBranchFilter(''); setCategoryFilter(''); setCourseFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">Clear Filters</button>
        </div>
      </Card>

      {/* Intake batches */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading intake batches...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
          {batches.map((b) => (
            <div key={b.uuid} className="flex flex-col gap-3 px-4 py-3 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#73111b]">{b.code}</span>
                  <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                  <Badge variant={b.status === 'ongoing' ? 'success' : 'primary'}>{b.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{b.course?.category?.name || 'Uncategorized'} / {b.course?.name} · {b.branch?.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatBatchDate(b.start_date)} to {formatBatchDate(b.end_date)}</span>
                  <span className="inline-flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-400" /> {b.enrollments_count || 0} / {b.capacity} Students</span>
                  <span className="inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5 text-slate-400" /> {b.trainers?.length || 0} Trainers</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('batches.update') && <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit Batch"><Edit2 className="h-3.5 w-3.5" /></button>}
                {hasPermission('batches.delete') && <button onClick={() => openDelete(b)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete Batch"><Trash2 className="h-3.5 w-3.5" /></button>}
                <a href={`/batches/${b.uuid}/attendance`} className="text-xs font-bold text-slate-600 hover:text-[#73111b]">Attendance</a>
                <button onClick={() => openAssignModal(b)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200"><UserCheck className="h-3.5 w-3.5 text-[#73111b]" /> Assign</button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />

      {/* Create Batch Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Launch Intake Batch"
        subtitle="Schedule a new course intake batch"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Program *</label>
              <select
                required
                value={formData.course_uuid}
                onChange={(e) => setFormData({ ...formData, course_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.uuid} value={c.uuid}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch *</label>
              <select
                required
                value={formData.branch_uuid}
                onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.uuid} value={b.uuid}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. NAI-CCNA-2026-01"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. CCNA Morning Intake Q1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
            >
              Create Intake
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Intake Batch"
        subtitle={`Updating ${selectedBatch?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Program *</label>
              <select
                required
                value={formData.course_uuid}
                onChange={(e) => setFormData({ ...formData, course_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.uuid} value={c.uuid}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch *</label>
              <select
                required
                value={formData.branch_uuid}
                onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.uuid} value={b.uuid}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
            >
              Save Batch Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Batch Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Intake Batch"
        subtitle={`Confirmation for ${selectedBatch?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to delete this intake batch?</p>
              <p className="mt-1">
                Deleting <strong>{selectedBatch?.name}</strong> will remove its timetable and student enrollments.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Trainer Assign Modal */}
      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Trainers to Intake"
        subtitle={`Intake: ${selectedBatch?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">Select certified instructors to lead this batch:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {trainers.map((item) => {
              const tr = item.user || item;
              const isChecked = selectedTrainerIds.includes(tr.uuid);
              return (
                <div
                  key={tr.uuid}
                  onClick={() => {
                    setSelectedTrainerIds((prev) =>
                      prev.includes(tr.uuid) ? prev.filter((id) => id !== tr.uuid) : [...prev, tr.uuid]
                    );
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isChecked
                      ? 'bg-[#fff1f2] border-[#fecdd3]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tr.full_name}</p>
                    <p className="text-[11px] text-slate-500">{tr.email} • {tr.branch?.name || 'Main Campus'}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-[#73111b] focus:ring-[#73111b]"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTrainers}
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
            >
              Save Assignments
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

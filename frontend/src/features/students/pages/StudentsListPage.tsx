import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { StudentAdmissionModal } from '../components/StudentAdmissionModal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { StudentProfile, Branch } from '../../../types/models';

export const StudentsListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const [editForm, setEditForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: {
          search,
          branch_uuid: branchFilter || undefined,
          status: statusFilter || undefined,
          page,
        },
      });
      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.meta) {
          setPagination(res.data.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/branches').then((res) => setBranches(res.data.data || []));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, branchFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const openEdit = (st: StudentProfile) => {
    setSelectedStudent(st);
    setEditForm({
      first_name: st.user?.first_name || '',
      middle_name: st.user?.middle_name || '',
      last_name: st.user?.last_name || '',
      email: st.user?.email || '',
      phone: st.user?.phone || '',
      status: st.status || 'active',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.put(`/students/${selectedStudent.uuid}`, editForm);
      setEditOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update student.');
    }
  };

  const openDelete = (st: StudentProfile) => {
    setSelectedStudent(st);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      await api.delete(`/students/${selectedStudent.uuid}`);
      setDeleteOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive student.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Roster & Admissions</h1>
          <p className="text-xs text-slate-500">View and manage admitted students, institutional records, and parent/guardian contacts.</p>
        </div>
        {hasPermission('students.create') && (
          <button
            onClick={() => setAdmissionOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Admit New Student</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student number, name, email..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div>
            <select
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">All Campus Branches</option>
              {branches.map((b) => (
                <option key={b.uuid} value={b.uuid}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            Filter Records
          </button>
        </form>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Student Number</th>
                <th className="py-3.5 px-4">Campus Branch</th>
                <th className="py-3.5 px-4">Enrolled Program</th>
                <th className="py-3.5 px-4">Guardian Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.uuid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center font-bold text-xs text-[#73111b]">
                          {st.user?.first_name?.charAt(0)}
                          {st.user?.last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{st.user?.full_name}</p>
                          <p className="text-[11px] text-slate-500">{st.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#73111b]">
                      {st.student_number}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{st.user?.branch?.name || 'IAT Main Campus'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium">
                        {(st.user as any)?.enrollments?.[0]?.batch?.course?.name || 'Active Student'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {st.guardians?.[0] ? (
                        <span>
                          {st.guardians[0].first_name} ({st.guardians[0].pivot.relationship}) • {st.guardians[0].phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={st.status === 'active' ? 'success' : 'neutral'}>{st.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPermission('students.update') && (
                          <button
                            onClick={() => openEdit(st)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
                            title="Edit Student"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {hasPermission('students.delete') && (
                          <button
                            onClick={() => openDelete(st)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Archive Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </Card>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Student Record"
        subtitle={`Updating ${selectedStudent?.user?.full_name} (${selectedStudent?.student_number})`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={editForm.middle_name}
                onChange={(e) => setEditForm({ ...editForm, middle_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Contact</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="completed">Completed / Graduated</option>
              <option value="dropped">Dropped Out</option>
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
              Save Student Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Student Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Archive Student Record"
        subtitle={`Confirmation for ${selectedStudent?.user?.full_name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to archive this student record?</p>
              <p className="mt-1">
                Archiving <strong>{selectedStudent?.user?.full_name}</strong> will remove them from active class rosters and suspend portal access.
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
              Confirm Archive
            </button>
          </div>
        </div>
      </Modal>

      <StudentAdmissionModal
        isOpen={admissionOpen}
        onClose={() => setAdmissionOpen(false)}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Mail, Building, Phone, Edit2, Trash2, AlertTriangle, Search, RotateCcw } from 'lucide-react';
import type { Branch } from '../../../types/models';

export const StaffListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    job_title: '',
    employee_number: '',
    employment_type: 'full_time',
    specialization: '',
    status: 'active',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff', { params: { search: search || undefined, branch_uuid: branchFilter || undefined, status: statusFilter || undefined, page } });
      if (res.data.success) {
        setStaffList(res.data.data);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [branchFilter, statusFilter, page]);

  useEffect(() => {
    api.get('/branches', { params: { per_page: 100 } }).then((res) => setBranches(res.data.data || []));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const openEdit = (staff: any) => {
    setSelectedStaff(staff);
    setEditForm({
      job_title: staff.job_title || staff.user?.position?.name || '',
      employee_number: staff.employee_number || '',
      employment_type: staff.employment_type || 'full_time',
      specialization: staff.specialization || '',
      status: staff.status || 'active',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await api.put(`/staff/${selectedStaff.uuid}`, editForm);
      setEditOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update staff profile.');
    }
  };

  const openDelete = (staff: any) => {
    setSelectedStaff(staff);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await api.delete(`/staff/${selectedStaff.uuid}`);
      setDeleteOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive staff.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff & Faculty Directory</h1>
        <p className="text-xs text-slate-500">Institute of Advanced Technology instructors, branch managers, and operational staff.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff name, employee number..." className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" /></div>
          <select value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Campus Branches</option>{branches.map((branch) => <option key={branch.uuid} value={branch.uuid}>{branch.name}</option>)}</select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Staff Statuses</option><option value="active">Active</option><option value="on_leave">On Leave</option><option value="terminated">Terminated</option></select>
          <div className="flex gap-2"><button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">Apply</button><button type="button" onClick={() => { setSearch(''); setBranchFilter(''); setStatusFilter(''); setPage(1); }} title="Clear filters" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /></button></div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading faculty directory...</div>
        ) : staffList.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">No staff members found.</div>
        ) : (
          staffList.map((item) => {
            const user = item.user || item;
            const roles = user.roles || [];

            return (
              <Card key={item.uuid || user.uuid} className="p-5 flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center font-bold text-xs text-[#73111b] shadow-xs">
                        {user.first_name?.charAt(0)}
                        {user.last_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{user.full_name || `${user.first_name} ${user.last_name}`}</h3>
                        <p className="text-xs text-[#73111b] font-semibold">{item.job_title || user.position?.name || 'Staff Member'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasPermission('staff.update') && (
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                          title="Edit Staff Profile"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {hasPermission('staff.delete') && (
                        <button
                          onClick={() => openDelete(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Archive Staff"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </p>
                    {user.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{user.phone}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.branch?.name || item.branch?.name || 'IAT Main Campus'}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {roles.map((r: any, idx: number) => {
                    const roleName = typeof r === 'string' ? r : r.display_name || r.name;
                    return (
                      <Badge key={idx} variant="primary">
                        {roleName}
                      </Badge>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />

      {/* Edit Staff Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Staff Record"
        subtitle={`Updating ${selectedStaff?.user?.full_name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={editForm.job_title}
              onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee Number</label>
              <input
                type="text"
                value={editForm.employee_number}
                onChange={(e) => setEditForm({ ...editForm, employee_number: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
              <select
                value={editForm.employment_type}
                onChange={(e) => setEditForm({ ...editForm, employment_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specialization / Expertise</label>
            <input
              type="text"
              value={editForm.specialization}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              placeholder="e.g. CCNA, CyberOps, Python Data Analytics"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
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
              Save Staff Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Staff Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Archive Staff Member"
        subtitle={`Confirmation for ${selectedStaff?.user?.full_name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to archive this staff record?</p>
              <p className="mt-1">
                Archiving <strong>{selectedStaff?.user?.full_name}</strong> will deactivate their account and remove trainer intake assignments.
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
    </div>
  );
};

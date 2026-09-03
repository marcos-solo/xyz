import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import type { Department, Branch } from '../../../types/models';

export const DepartmentsListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    branch_uuid: '',
    name: '',
    code: '',
    description: '',
  });

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const [dRes, bRes] = await Promise.all([
        api.get('/departments'),
        api.get('/branches'),
      ]);
      setDepartments(dRes.data.data || []);
      setBranches(bRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', formData);
      setCreateOpen(false);
      setFormData({ branch_uuid: '', name: '', code: '', description: '' });
      fetchDepts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const openEdit = (d: Department) => {
    setSelectedDept(d);
    setFormData({
      branch_uuid: d.branch?.uuid || '',
      name: d.name,
      code: d.code || '',
      description: d.description || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    try {
      await api.put(`/departments/${selectedDept.uuid}`, formData);
      setEditOpen(false);
      setSelectedDept(null);
      fetchDepts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update department.');
    }
  };

  const openDelete = (d: Department) => {
    setSelectedDept(d);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      await api.delete(`/departments/${selectedDept.uuid}`);
      setDeleteOpen(false);
      setSelectedDept(null);
      fetchDepts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Departments</h1>
          <p className="text-xs text-slate-500">Organize functional academic and operational units across IAT campuses.</p>
        </div>
        {hasPermission('departments.create') && (
          <button
            onClick={() => {
              setFormData({ branch_uuid: '', name: '', code: '', description: '' });
              setCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading departments...</div>
        ) : (
          departments.map((d) => (
            <Card key={d.uuid} className="p-5 hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#73111b]">{d.code || 'DEPT'}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="primary">{d.branch?.name || 'Global'}</Badge>
                    {hasPermission('departments.update') && (
                      <button
                        onClick={() => openEdit(d)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                        title="Edit Department"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {hasPermission('departments.delete') && (
                      <button
                        onClick={() => openDelete(d)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{d.description || 'Department unit'}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch</label>
            <select
              value={formData.branch_uuid}
              onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Institution-wide (All Campuses)</option>
              {branches.map((b) => (
                <option key={b.uuid} value={b.uuid}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Information Technology & Cybersecurity"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. IT-SEC"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20">Create Department</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Department" subtitle={`Editing ${selectedDept?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch</label>
            <select
              value={formData.branch_uuid}
              onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Institution-wide (All Campuses)</option>
              {branches.map((b) => (
                <option key={b.uuid} value={b.uuid}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Department" subtitle={`Confirmation for ${selectedDept?.name}`}>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to delete this department?</p>
              <p className="mt-1">
                Deleting <strong>{selectedDept?.name}</strong> will remove it from the organization hierarchy. Departments with assigned staff or courses cannot be deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={handleDelete} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20">Confirm Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

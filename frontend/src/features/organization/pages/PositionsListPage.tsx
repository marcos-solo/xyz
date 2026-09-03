import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Briefcase, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import type { Position } from '../../../types/models';

export const PositionsListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/positions');
      if (res.data.success) {
        setPositions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/positions', { name, description });
      setCreateOpen(false);
      setName('');
      setDescription('');
      fetchPositions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create position.');
    }
  };

  const openEdit = (p: Position) => {
    setSelectedPos(p);
    setName(p.name);
    setDescription(p.description || '');
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPos) return;
    try {
      await api.put(`/positions/${selectedPos.uuid || selectedPos.id}`, { name, description });
      setEditOpen(false);
      setSelectedPos(null);
      setName('');
      setDescription('');
      fetchPositions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update position.');
    }
  };

  const openDelete = (p: Position) => {
    setSelectedPos(p);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPos) return;
    try {
      await api.delete(`/positions/${selectedPos.uuid || selectedPos.id}`);
      setDeleteOpen(false);
      setSelectedPos(null);
      fetchPositions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete position.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Job Titles & Positions</h1>
          <p className="text-xs text-slate-500">Position defines organizational role/job title, independent from dynamic RBAC security roles.</p>
        </div>
        {hasPermission('positions.manage') && (
          <button
            onClick={() => {
              setName('');
              setDescription('');
              setCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Position Title</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading positions...</div>
        ) : (
          positions.map((p) => (
            <Card key={p.uuid || p.id} className="p-5 hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#fff1f2] text-[#73111b]">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  </div>
                  {hasPermission('positions.manage') && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                        title="Edit Position"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Position"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{p.description || 'Institutional job position title'}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Job Position Title">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Position / Job Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Network Engineering Instructor"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Position scope and responsibilities..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20">Save Position</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Job Position Title" subtitle={`Editing ${selectedPos?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Position / Job Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Position" subtitle={`Confirmation for ${selectedPos?.name}`}>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to delete this position title?</p>
              <p className="mt-1">
                Deleting <strong>{selectedPos?.name}</strong> will remove it from future job title assignment lists.
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

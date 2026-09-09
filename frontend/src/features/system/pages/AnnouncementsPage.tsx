import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, Megaphone, Edit2, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [targetType, setTargetType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_type: 'all',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements', { params: { search: search || undefined, status: status || undefined, target_type: targetType || undefined, from_date: fromDate || undefined, to_date: toDate || undefined, page, per_page: 20 } });
      if (res.data.success) {
        setAnnouncements(res.data.data);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [search, status, targetType, fromDate, toDate, page]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      setCreateOpen(false);
      setFormData({ title: '', message: '', target_type: 'all' });
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post announcement.');
    }
  };

  const openEdit = (a: any) => {
    setSelectedAnnouncement(a);
    setFormData({
      title: a.title,
      message: a.message,
      target_type: a.target_type || 'all',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    try {
      await api.put(`/announcements/${selectedAnnouncement.uuid || selectedAnnouncement.id}`, formData);
      setEditOpen(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update announcement.');
    }
  };

  const openDelete = (a: any) => {
    setSelectedAnnouncement(a);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await api.delete(`/announcements/${selectedAnnouncement.uuid || selectedAnnouncement.id}`);
      setDeleteOpen(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Broadcasts & Announcements</h1>
          <p className="text-xs text-slate-500">Targeted news, campus updates, and academic notifications.</p>
        </div>
        {hasPermission('announcements.create') && (
          <button
            onClick={() => {
              setFormData({ title: '', message: '', target_type: 'all' });
              setCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Post Broadcast</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title or message" className="sm:col-span-2 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
            <select value={targetType} onChange={(e) => { setTargetType(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"><option value="">All audiences</option><option value="all">Everyone</option><option value="branch">Branch</option><option value="role">Role</option><option value="course">Course</option><option value="batch">Batch</option></select>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="From date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            <div className="flex gap-2"><input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="To date" className="min-w-0 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><button onClick={() => { setSearch(''); setStatus(''); setTargetType(''); setFromDate(''); setToDate(''); setPage(1); }} title="Clear filters" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /></button></div>
          </div>
        </Card>
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading broadcasts...</div>
        ) : (
          announcements.map((a) => (
            <Card key={a.uuid || a.id} className="p-6 hover:border-slate-300 transition">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#fff1f2] text-[#73111b]">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{a.target_type}</Badge>
                  {hasPermission('announcements.create') && (
                    <>
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                        title="Edit Broadcast"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(a)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mt-2.5">{a.message}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Posted by: {a.creator?.full_name || 'System Administrator'}</span>
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))
        )}
      </div>
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Post Announcement">
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. End of Term Examination Timetable Notice"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <select
              value={formData.target_type}
              onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="all">All Students and Staff (Institution-wide)</option>
              <option value="branch">Branch Campus Only</option>
              <option value="role">Specific Role Group</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Message Content *</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Announcement details..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20">Broadcast</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Broadcast Announcement" subtitle={`Editing ${selectedAnnouncement?.title}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
            <select
              value={formData.target_type}
              onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="all">All Students and Staff (Institution-wide)</option>
              <option value="branch">Branch Campus Only</option>
              <option value="role">Specific Role Group</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Message Content *</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Broadcast" subtitle={`Confirmation for ${selectedAnnouncement?.title}`}>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to delete this broadcast?</p>
              <p className="mt-1">
                Deleting <strong>{selectedAnnouncement?.title}</strong> will remove it from all student and staff noticeboards.
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

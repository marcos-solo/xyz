import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, ArrowRight, Layers, Edit2, Trash2, Tags, CheckCircle2, AlertTriangle, Compass } from 'lucide-react';
import type { Course, LearningPath } from '../../../types/models';

export const CoursesListPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const isStudent = user?.roles?.includes('Student') ?? false;
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ uuid: string; name: string }[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [pathsOpen, setPathsOpen] = useState(false);
  const [pathSaving, setPathSaving] = useState(false);
  const [pathForm, setPathForm] = useState({
    title: '',
    category_uuid: '',
    description: '',
    duration: 60,
    duration_unit: 'hours' as 'hours' | 'weeks' | 'months',
    level: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const accaCategory = categories.find((category) => category.name.trim().toLowerCase() === 'acca');
  const [formData, setFormData] = useState({
    category_uuid: '',
    learning_path_uuid: '',
    code: '',
    name: '',
    short_description: '',
    description: '',
    program_level: '',
    entry_requirements: '',
    paper_count: undefined as number | undefined,
    duration: 12,
    duration_unit: 'weeks',
    level: 'Intermediate',
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses', { params: { search: search || undefined, level: levelFilter || undefined, status: statusFilter || undefined, page } });
      if (res.data.success) {
        setCourses(res.data.data);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPaths = async () => {
    try {
      const res = await api.get('/learning-paths');
      if (res.data.success) {
        setLearningPaths(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load learning paths:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [levelFilter, statusFilter, page]);

  useEffect(() => {
    api.get('/course-categories')
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error('Failed to load course categories:', err));
    fetchLearningPaths();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', formData);
      if (res.data.success) {
        setCreateOpen(false);
        fetchCourses();
        navigate(`/courses/${res.data.data.uuid}/curriculum`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySaving(true);
    try {
      const res = await api.post('/course-categories', { name: categoryName, description: categoryDescription });
      if (res.data.success) {
        setCategories((current) => [...current, res.data.data]);
        setCategoryName('');
        setCategoryDescription('');
        setCategoryOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setPathSaving(true);
    try {
      const res = await api.post('/learning-paths', pathForm);
      if (res.data.success) {
        fetchLearningPaths();
        setPathForm({
          title: '',
          category_uuid: '',
          description: '',
          duration: 60,
          duration_unit: 'hours',
          level: 'Intermediate',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create learning path.');
    } finally {
      setPathSaving(false);
    }
  };

  const openEdit = (c: Course) => {
    setSelectedCourse(c);
    setFormData({
      category_uuid: c.category?.uuid || '',
      learning_path_uuid: c.learning_path?.uuid || '',
      code: c.code,
      name: c.name,
      short_description: c.short_description || '',
      description: c.description || '',
      duration: c.duration || 12,
      duration_unit: c.duration_unit || 'weeks',
      level: c.level || 'Intermediate',
      program_level: c.program_level || '',
      entry_requirements: c.entry_requirements || '',
      paper_count: c.paper_count,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.put(`/courses/${selectedCourse.uuid}`, formData);
      setEditOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course.');
    }
  };

  const openDelete = (c: Course) => {
    setSelectedCourse(c);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;
    try {
      await api.delete(`/courses/${selectedCourse.uuid}`);
      setDeleteOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{isStudent ? 'My Courses' : 'Courses & Curriculum Programs'}</h1>
          <p className="text-xs text-slate-500">{isStudent ? 'Continue your enrolled training and work through each course module.' : 'Define course syllabi, curriculum module trees, and multimedia lessons.'}</p>
        </div>
        {!isStudent && (hasPermission('courses.create') || hasPermission('course-categories.manage')) && (
          <div className="flex items-center gap-2">
            {hasPermission('courses.create') && (
              <button
                onClick={() => setPathsOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition"
              >
                <Compass className="h-4 w-4 text-[#73111b]" />
                <span>Learning Paths</span>
              </button>
            )}
            {hasPermission('courses.create') && <button
              onClick={() => setCategoryOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition"
            >
              <Tags className="h-4 w-4 text-[#73111b]" />
              <span>Manage Categories</span>
            </button>}
            <button
              onClick={() => {
              setFormData({
                category_uuid: categories[0]?.uuid || '',
                learning_path_uuid: '',
                code: '',
                name: '',
                short_description: '',
                description: '',
                program_level: '',
                entry_requirements: '',
                paper_count: undefined,
                duration: 12,
                duration_unit: 'weeks',
                level: 'Intermediate',
              });
              setCreateOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course Program</span>
            </button>
          </div>
        )}
      </div>

      {!isStudent && <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search course code or name..." className="sm:col-span-2 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          <select value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
            <option value="">All Levels</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Professional">Professional</option>
          </select>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="min-w-0 flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"><option value="">All Statuses</option><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select>
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">Apply</button>
          </div>
        </form>
      </Card>}

      {/* Course catalog */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading course curriculum catalog...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
          {courses.map((c) => {
            const progressPercentage = c.learning_progress?.percentage ?? 0;
            return (
            <div key={c.uuid} className="flex flex-col gap-3 px-4 py-3 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#73111b]">{c.code}</span>
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                  {c.category?.name && <span className="text-[11px] font-semibold text-[#73111b]">{c.category.name}</span>}
                  {c.learning_path?.title && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#fff1f2] border border-[#fecdd3] px-2 py-0.5 text-[11px] font-bold text-[#73111b]">
                      <Compass className="h-3 w-3 text-[#73111b]" />
                      {c.learning_path.title}
                    </span>
                  )}
                  <Badge variant="primary">{c.level}</Badge>
                  {!isStudent && c.status === 'draft' && <Badge variant="warning">Awaiting Academic Approval</Badge>}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{c.program_level ? `ACCA ${c.program_level} · ${c.paper_count} Papers` : c.short_description || c.description || 'Comprehensive training curriculum.'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">{isStudent ? `${Math.round(c.learning_progress?.percentage || 0)}% complete` : `${c.batches_count || 0} intakes`}</span>
                <span className="inline-flex items-center gap-1 text-slate-500"><Layers className="h-3.5 w-3.5 text-[#73111b]" /> {c.units_count || c.modules_count || 0} stages</span>
                {!isStudent && hasPermission('courses.update') && <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit Course"><Edit2 className="h-3.5 w-3.5" /></button>}
                {!isStudent && hasPermission('courses.delete') && <button onClick={() => openDelete(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete Course"><Trash2 className="h-3.5 w-3.5" /></button>}
                <button
                  onClick={() => isStudent ? navigate(`/learn/${c.uuid}`) : navigate(`/courses/${c.uuid}/curriculum`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff1f2] px-3 py-1.5 font-bold text-[#73111b] border border-[#fecdd3] hover:bg-[#73111b] hover:text-white transition"
                >
                  <span>{isStudent ? (progressPercentage >= 100 ? 'Completed' : progressPercentage > 0 ? 'Continue Learning' : 'Start Learning') : 'Open'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                {!isStudent && c.status === 'draft' && hasPermission('courses.approve') && (
                  <button
                    onClick={async () => {
                      try {
                        await api.patch(`/courses/${c.uuid}/approve`);
                        fetchCourses();
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Failed to approve course.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
              </div>
            </div>
            );
          })}
          </div>
        )}
      </div>
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={setPage} />

      {/* Create Course Modal */}
      <Modal
        isOpen={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        title="Manage Course Categories"
        subtitle="Create a category before adding a course"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
            <input required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Networking and Infrastructure" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="What courses belong in this category?" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setCategoryOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
            <button type="submit" disabled={categorySaving} className="px-5 py-2.5 rounded-xl bg-[#73111b] text-xs font-bold text-white disabled:opacity-60">{categorySaving ? 'Creating...' : 'Create Category'}</button>
          </div>
        </form>
      </Modal>

      {/* Manage Learning Paths Modal */}
      <Modal
        isOpen={pathsOpen}
        onClose={() => setPathsOpen(false)}
        title="Manage Academic Learning Paths"
        subtitle="Organize courses into structured academic tracks"
      >
        <div className="space-y-6">
          <form onSubmit={handleCreatePath} className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create New Track</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Track Title *</label>
              <input
                required
                value={pathForm.title}
                onChange={(e) => setPathForm({ ...pathForm, title: e.target.value })}
                placeholder="e.g. Enterprise Cloud & Infrastructure Track"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category (Optional)</label>
                <select
                  value={pathForm.category_uuid}
                  onChange={(e) => setPathForm({ ...pathForm, category_uuid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.uuid} value={c.uuid}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                <select
                  value={pathForm.level}
                  onChange={(e) => setPathForm({ ...pathForm, level: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={pathForm.description}
                onChange={(e) => setPathForm({ ...pathForm, description: e.target.value })}
                placeholder="Scope and professional goals of this track..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pathSaving}
                className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-sm disabled:opacity-60"
              >
                {pathSaving ? 'Creating Track...' : 'Save Learning Path'}
              </button>
            </div>
          </form>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Existing Learning Paths</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
              {learningPaths.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 text-center">No learning paths created yet.</p>
              ) : (
                learningPaths.map((lp) => (
                  <div key={lp.uuid} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{lp.title}</span>
                        <Badge variant="primary">{lp.level}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{lp.description || 'No description provided.'}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 shrink-0">
                      <span className="font-semibold text-[#73111b]">{lp.courses?.length || lp.courses_count || 0}</span> courses
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPathsOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Course Program"
        subtitle="Step 1 of curriculum definition"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Category *</label>
              <select
                required
                value={formData.category_uuid}
                onChange={(e) => setFormData({ ...formData, category_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Course Category</option>
                {categories.map((category) => <option key={category.uuid} value={category.uuid}>{category.name}</option>)}
              </select>
              {categories.length === 0 && <p className="text-[11px] text-rose-600 mt-1">Create a course category before adding a course.</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Learning Path</label>
              <select
                value={formData.learning_path_uuid}
                onChange={(e) => setFormData({ ...formData, learning_path_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">-- None (Standalone Course) --</option>
                {learningPaths.map((lp) => (
                  <option key={lp.uuid} value={lp.uuid}>{lp.title} ({lp.level})</option>
                ))}
              </select>
            </div>
          </div>
          {accaCategory && formData.category_uuid === accaCategory.uuid && (
            <div className="rounded-xl border border-[#fecdd3] bg-[#fffafb] p-3 text-xs text-slate-600">
              <p className="font-bold text-[#73111b]">ACCA is one course program</p>
              <p className="mt-1">Foundation, Fundamental, and Strategic Professional will be created inside the course as units. Add each paper as a module under its unit.</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. IAT-CCNA"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cisco Certified Network Associate"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration Value</label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration Unit</label>
              <select
                value={formData.duration_unit}
                onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Summary of course scope and objectives..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
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
              Create & Open Builder
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Course Program"
        subtitle={`Updating ${selectedCourse?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Category *</label>
              <select
                required
                value={formData.category_uuid}
                onChange={(e) => setFormData({ ...formData, category_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Course Category</option>
                {categories.map((category) => <option key={category.uuid} value={category.uuid}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Learning Path</label>
              <select
                value={formData.learning_path_uuid}
                onChange={(e) => setFormData({ ...formData, learning_path_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">-- None (Standalone Course) --</option>
                {learningPaths.map((lp) => (
                  <option key={lp.uuid} value={lp.uuid}>{lp.title} ({lp.level})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration Value</label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration Unit</label>
              <select
                value={formData.duration_unit}
                onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
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
              Save Course Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Course Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Course Program"
        subtitle={`Confirmation for ${selectedCourse?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to delete this course?</p>
              <p className="mt-1">
                Deleting <strong>{selectedCourse?.name}</strong> will remove its curriculum structure. Courses with ongoing student intakes cannot be deleted.
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
    </div>
  );
};

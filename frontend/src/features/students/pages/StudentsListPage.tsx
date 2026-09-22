import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { StudentAdmissionModal } from '../components/StudentAdmissionModal';
import { StudentStatsCards } from '../components/StudentStatsCards';
import { StudentProfileDrawer } from '../components/StudentProfileDrawer';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  AlertTriangle,
  Download,
  LayoutGrid,
  List,
  RotateCcw,
  Copy,
  Check,
  Building,
  Mail,
  Phone,
  BookOpen,
  Eye,
  X,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react';
import type { StudentProfile, Branch, Course, StudentStats } from '../../../types/models';

export const StudentsListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & View State
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal / Drawer States
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    date_of_birth: '',
    gender: 'male',
    national_id: '',
    address: '',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: {
          search: search || undefined,
          branch_uuid: branchFilter || undefined,
          course_uuid: courseFilter || undefined,
          status: statusFilter && statusFilter !== 'new_this_month' ? statusFilter : undefined,
          page,
        },
      });

      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.meta) {
          setPagination({
            current_page: res.data.meta.current_page,
            last_page: res.data.meta.last_page,
            total: res.data.meta.total,
          });
          if (res.data.meta.stats) {
            setStats(res.data.meta.stats);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/branches', { params: { per_page: 100 } }),
      api.get('/courses', { params: { per_page: 100 } }),
    ]).then(([bRes, cRes]) => {
      setBranches(bRes.data.data || []);
      setCourses(cRes.data.data || []);
    });
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, branchFilter, courseFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleClearFilters = () => {
    setSearch('');
    setBranchFilter('');
    setCourseFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDrawer = (st: StudentProfile) => {
    setSelectedStudent(st);
    setDrawerOpen(true);
  };

  const openEdit = (st: StudentProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStudent(st);
    setEditForm({
      first_name: st.user?.first_name || '',
      middle_name: st.user?.middle_name || '',
      last_name: st.user?.last_name || '',
      email: st.user?.email || '',
      phone: st.user?.phone || '',
      status: st.status || 'active',
      date_of_birth: st.date_of_birth ? st.date_of_birth.split('T')[0] : '',
      gender: (st.gender as any) || 'male',
      national_id: st.national_id || '',
      address: st.address || '',
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
      alert(err.response?.data?.message || 'Failed to update student profile.');
    }
  };

  const openDelete = (st: StudentProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const exportToCSV = () => {
    if (students.length === 0) return;

    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Phone',
      'Campus Branch',
      'Enrolled Program',
      'Intake Batch',
      'Status',
      'Admission Date',
      'Primary Guardian',
      'Guardian Phone',
    ];

    const rows = students.map((st) => {
      const enrollment = (st.user as any)?.enrollments?.[0];
      const guardian = st.guardians?.[0];

      return [
        `"${st.student_number || ''}"`,
        `"${st.user?.full_name || ''}"`,
        `"${st.user?.email || ''}"`,
        `"${st.user?.phone || ''}"`,
        `"${st.user?.branch?.name || ''}"`,
        `"${enrollment?.batch?.course?.name || 'Unassigned'}"`,
        `"${enrollment?.batch?.name || 'N/A'}"`,
        `"${st.status || ''}"`,
        `"${st.admission_date ? st.admission_date.split('T')[0] : ''}"`,
        `"${guardian ? `${guardian.first_name} ${guardian.last_name} (${guardian.pivot.relationship})` : ''}"`,
        `"${guardian?.phone || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IAT_Student_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(search || branchFilter || courseFilter || statusFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#73111b]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Academic Records & Admissions</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Roster & Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Manage admitted students, institutional records, campus branches, cohort placements, and guardian contacts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={students.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            title="Export Roster to CSV"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Roster</span>
          </button>

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
      </div>

      {/* KPI Stats Cards */}
      <StudentStatsCards
        stats={stats}
        loading={loading && !stats}
        activeStatusFilter={statusFilter}
        onFilterByStatus={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
      />

      {/* Search & Advanced Filter Toolbar */}
      <Card className="p-4 bg-white shadow-xs border-slate-200">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-5">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student number, name, email, phone..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#73111b] transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Campus Branch Filter */}
            <div className="sm:col-span-3">
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b] transition"
              >
                <option value="">All Campus Branches</option>
                {branches.map((b) => (
                  <option key={b.uuid} value={b.uuid}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div className="sm:col-span-2">
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b] transition"
              >
                <option value="">All Programmes</option>
                {courses.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b] transition"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Learners</option>
                <option value="completed">Completed / Alumni</option>
                <option value="suspended">Suspended</option>
                <option value="dropped">Dropped Out</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Sub-bar with Active Badges, Result Counts, and View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Showing {students.length} of {pagination.total} records
              </span>

              {hasActiveFilters && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {branchFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        Campus: {branches.find((b) => b.uuid === branchFilter)?.code || 'Selected'}
                        <button type="button" onClick={() => setBranchFilter('')}>
                          <X className="h-3 w-3 hover:text-rose-600" />
                        </button>
                      </span>
                    )}

                    {courseFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        Course: {courses.find((c) => c.uuid === courseFilter)?.code || 'Selected'}
                        <button type="button" onClick={() => setCourseFilter('')}>
                          <X className="h-3 w-3 hover:text-rose-600" />
                        </button>
                      </span>
                    )}

                    {statusFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-[11px] font-bold text-[#73111b] border border-rose-100">
                        Status: {statusFilter}
                        <button type="button" onClick={() => setStatusFilter('')}>
                          <X className="h-3 w-3 hover:text-rose-600" />
                        </button>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[11px] font-semibold text-[#73111b] hover:underline flex items-center gap-1 ml-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        /* Table View */
        <Card className="p-0 overflow-hidden bg-white shadow-xs border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Campus Branch</th>
                  <th className="py-3.5 px-4">Enrolled Program & Intake</th>
                  <th className="py-3.5 px-4">Guardian Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-6 w-6 border-2 border-[#73111b] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Loading student roster...</span>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-10 w-10 text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">No student records found</p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Try adjusting your search query or filters, or admit a new student to the roster.
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="mt-2 text-xs font-semibold text-[#73111b] hover:underline"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((st) => {
                    const enrollment = (st.user as any)?.enrollments?.[0];
                    const guardian = st.guardians?.[0];

                    return (
                      <tr
                        key={st.uuid}
                        onClick={() => openDrawer(st)}
                        className="hover:bg-rose-50/30 cursor-pointer transition group"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] border border-[#fecdd3] flex items-center justify-center font-black text-xs text-[#73111b] shadow-2xs group-hover:scale-105 transition">
                                {st.user?.first_name?.charAt(0)}
                                {st.user?.last_name?.charAt(0)}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                                  st.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-[#73111b] transition">
                                {st.user?.full_name}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span>{st.user?.email}</span>
                                {st.user?.phone && (
                                  <>
                                    <span>•</span>
                                    <span>{st.user?.phone}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Student Number Badge with 1-click Copy */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#73111b] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              {st.student_number}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(st.student_number, e)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100"
                              title="Copy ID"
                            >
                              {copiedId === st.student_number ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Campus Branch */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            {st.user?.branch?.name || 'IAT Main Campus'}
                          </span>
                        </td>

                        {/* Enrolled Program */}
                        <td className="py-3.5 px-4">
                          {enrollment ? (
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">
                                {enrollment.batch?.course?.name || 'Active Student'}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {enrollment.batch?.name || 'Cohort'}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Admitted · Unassigned
                            </span>
                          )}
                        </td>

                        {/* Guardian Contact */}
                        <td className="py-3.5 px-4">
                          {guardian ? (
                            <div>
                              <p className="font-medium text-slate-800 text-xs">
                                {guardian.first_name} {guardian.last_name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                <span className="font-semibold text-rose-800">
                                  {guardian.pivot?.relationship || 'Guardian'}
                                </span>{' '}
                                • {guardian.phone}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge variant={st.status === 'active' ? 'success' : 'neutral'}>
                            {st.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => openDrawer(st)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#73111b] hover:bg-rose-50/50 hover:border-rose-200 transition"
                              title="View Student Dossier"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {hasPermission('students.update') && (
                              <button
                                type="button"
                                onClick={(e) => openEdit(st, e)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                                title="Edit Record"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {hasPermission('students.delete') && (
                              <button
                                type="button"
                                onClick={(e) => openDelete(st, e)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                                title="Archive Student"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </Card>
      ) : (
        /* Cards Grid View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-6 w-6 border-2 border-[#73111b] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Loading student cards...</span>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <p className="text-sm font-bold text-slate-700">No student records found</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting your filters.</p>
              </div>
            ) : (
              students.map((st) => {
                const enrollment = (st.user as any)?.enrollments?.[0];
                const guardian = st.guardians?.[0];

                return (
                  <div
                    key={st.uuid}
                    onClick={() => openDrawer(st)}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#73111b]/30 cursor-pointer transition duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] border border-[#fecdd3] flex items-center justify-center font-black text-sm text-[#73111b] shadow-2xs group-hover:scale-105 transition">
                            {st.user?.first_name?.charAt(0)}
                            {st.user?.last_name?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-[#73111b] transition line-clamp-1">
                              {st.user?.full_name}
                            </h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="font-mono text-[11px] font-bold text-[#73111b]">
                                {st.student_number}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(st.student_number, e)}
                                className="p-0.5 text-slate-400 hover:text-slate-700"
                                title="Copy ID"
                              >
                                {copiedId === st.student_number ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <Badge variant={st.status === 'active' ? 'success' : 'neutral'}>
                          {st.status}
                        </Badge>
                      </div>

                      {/* Campus & Enrolled Course */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">
                            {st.user?.branch?.name || 'IAT Main Campus'}
                          </span>
                        </div>

                        <div className="flex items-start gap-1.5 text-xs text-slate-600">
                          <BookOpen className="h-3.5 w-3.5 text-[#73111b] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 line-clamp-1">
                              {enrollment?.batch?.course?.name || 'Admitted Student'}
                            </span>
                            {enrollment?.batch?.name && (
                              <span className="text-[11px] text-slate-500 block truncate">
                                {enrollment.batch.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{st.user?.email}</span>
                        </div>
                        {st.user?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{st.user.phone}</span>
                          </div>
                        )}
                        {guardian && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                            <Users className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                            <span className="truncate">
                              {guardian.pivot?.relationship}: {guardian.first_name} ({guardian.phone})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div
                      className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openDrawer(st)}
                        className="text-xs font-bold text-[#73111b] hover:text-[#5c0d15] flex items-center gap-1 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Dossier</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {hasPermission('students.update') && (
                          <button
                            type="button"
                            onClick={(e) => openEdit(st, e)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit Record"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {hasPermission('students.delete') && (
                          <button
                            type="button"
                            onClick={(e) => openDelete(st, e)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Archive Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Card className="p-4 bg-white shadow-xs">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              onPageChange={(p) => setPage(p)}
            />
          </Card>
        </div>
      )}

      {/* Slide-over Profile Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={(st) => openEdit(st)}
      />

      {/* Edit Student Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Student Record"
        subtitle={`Updating institutional profile for ${selectedStudent?.user?.full_name} (${selectedStudent?.student_number})`}
        maxWidth="lg"
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={editForm.middle_name}
                onChange={(e) => setEditForm({ ...editForm, middle_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Contact</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">National ID / Passport</label>
              <input
                type="text"
                value={editForm.national_id}
                onChange={(e) => setEditForm({ ...editForm, national_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="completed">Completed / Graduated</option>
                <option value="dropped">Dropped Out</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="e.g. Westlands, Nairobi"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 transition"
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
        subtitle={`Confirmation for ${selectedStudent?.user?.full_name} (${selectedStudent?.student_number})`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Are you sure you want to archive this student record?</p>
              <p className="mt-1">
                Archiving <strong>{selectedStudent?.user?.full_name}</strong> will deactivate their portal access and remove them from active classroom rosters. Historical attendance and assessments will remain preserved in the audit archives.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition"
            >
              Confirm Archive
            </button>
          </div>
        </div>
      </Modal>

      {/* Admission Intake Modal */}
      <StudentAdmissionModal
        isOpen={admissionOpen}
        onClose={() => setAdmissionOpen(false)}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

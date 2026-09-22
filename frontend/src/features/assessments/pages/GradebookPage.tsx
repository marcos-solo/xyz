import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  ArrowLeft,
  Edit3,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
  BarChart3,
  GraduationCap,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { batchUuid } = useParams<{ batchUuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');

  // Mark entry modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingMark, setSavingMark] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    student: any;
    assessment: any;
    currentScore: number | null;
  } | null>(null);

  const [inputScore, setInputScore] = useState<string>('');
  const [inputFeedback, setInputFeedback] = useState<string>('');

  const fetchGradebook = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/batches/${batchUuid}/gradebook`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load gradebook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchUuid) fetchGradebook();
  }, [batchUuid]);

  const handleOpenEdit = (student: any, assessment: any, currentMark: any) => {
    setSelectedCell({
      student,
      assessment,
      currentScore: currentMark ? currentMark.score : null,
    });
    setInputScore(currentMark && currentMark.score !== null ? String(currentMark.score) : '');
    setInputFeedback('');
    setEditModalOpen(true);
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    setSavingMark(true);
    try {
      const scoreNum = parseFloat(inputScore);
      const res = await api.post(`/batches/${batchUuid}/gradebook/mark`, {
        student_uuid: selectedCell.student.student_uuid,
        assessment_uuid: selectedCell.assessment.uuid,
        score: scoreNum,
        feedback: inputFeedback || undefined,
      });

      if (res.data.success) {
        setData(res.data.data);
        setEditModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save assessment score.');
    } finally {
      setSavingMark(false);
    }
  };

  const exportCSV = () => {
    if (!data || !data.matrix) return;

    const headers = [
      'Student Name',
      'Student Number',
      ...(data.assessments || []).map((a: any) => `${a.title} (${a.type} ${a.weight}%)`),
      'Weighted Total (%)',
      'Letter Grade',
      'Academic Standing',
    ];

    const rows = data.matrix.map((row: any) => [
      `"${row.student_name}"`,
      `"${row.student_number}"`,
      ...(data.assessments || []).map((a: any) => {
        const mark = row.assessments?.[a.uuid];
        return mark && mark.score !== null ? mark.score : '';
      }),
      row.total_weighted_score,
      row.final_grade,
      row.passed ? 'Passed' : 'Failed',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gradebook_${data.batch?.code || 'Batch'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredMatrix = useMemo(() => {
    if (!data?.matrix) return [];
    return data.matrix.filter((row: any) => {
      const matchesSearch =
        row.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        row.student_number?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'passed' && row.passed) ||
        (statusFilter === 'failed' && !row.passed);
      return matchesSearch && matchesStatus;
    });
  }, [data?.matrix, search, statusFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    if (!data?.matrix || data.matrix.length === 0) {
      return { total: 0, passed: 0, passRate: 0, avgScore: 0 };
    }
    const total = data.matrix.length;
    const passed = data.matrix.filter((r: any) => r.passed).length;
    const totalScore = data.matrix.reduce((acc: number, r: any) => acc + (parseFloat(r.total_weighted_score) || 0), 0);
    return {
      total,
      passed,
      passRate: Math.round((passed / total) * 100),
      avgScore: Math.round((totalScore / total) * 10) / 10,
    };
  }, [data?.matrix]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="h-10 w-10 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center animate-spin text-[#73111b]">
          <RotateCcw className="h-5 w-5" />
        </div>
        <p className="text-xs font-bold text-slate-700">Computing Weighted Gradebook Matrix...</p>
        <p className="text-[11px] text-slate-400">Aggregating CAT 1, CAT 2, and Mock Exam marks against scheme</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/batches')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
            title="Back to Batches"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#73111b] bg-[#fff1f2] border border-[#fecdd3] px-2 py-0.5 rounded-md">
                {data.batch?.code}
              </span>
              <span className="text-xs text-slate-500">• {data.batch?.branch}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Intake Gradebook Matrix — {data.batch?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-2xs transition"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Senate CSV</span>
          </button>
        </div>
      </div>

      {/* Cohort Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Enrolled Candidates</span>
            <span className="text-xl font-black text-slate-900">{stats.total} Students</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Cohort Pass Rate</span>
            <span className="text-xl font-black text-emerald-700">{stats.passRate}%</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#73111b] shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Mean Weighted Score</span>
            <span className="text-xl font-black text-[#73111b]">{stats.avgScore}%</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Continuous Assessments</span>
            <span className="text-xl font-black text-slate-900">{data.assessments?.length || 0} Registered</span>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name or student #..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({data.matrix?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('passed')}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === 'passed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Passed ({stats.passed})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('failed')}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === 'failed' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                At Risk ({stats.total - stats.passed})
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grade Matrix Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200">
                  Candidate
                </th>
                <th className="py-3.5 px-4">Student #</th>
                {data.assessments?.map((ass: any) => (
                  <th key={ass.uuid} className="py-3.5 px-4 text-center border-l border-slate-100">
                    <div className="font-bold text-slate-800">{ass.title}</div>
                    <span className="text-[9px] text-[#73111b] font-bold lowercase block">
                      ({ass.type} • {ass.weight}%)
                    </span>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center border-l border-slate-200 bg-rose-50/30">
                  Weighted Score
                </th>
                <th className="py-3.5 px-4 text-center border-l border-slate-100 bg-rose-50/30">
                  Grade
                </th>
                <th className="py-3.5 px-4 text-center border-l border-slate-100 bg-rose-50/30">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + (data.assessments?.length || 0)}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((row: any) => (
                  <tr key={row.student_uuid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50/95 z-10 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                          {row.student_name?.slice(0, 1) || 'S'}
                        </div>
                        <span className="truncate max-w-[180px]">{row.student_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {row.student_number}
                    </td>

                    {/* Assessment Columns with Interactive Mark Entry */}
                    {data.assessments?.map((ass: any) => {
                      const mark = row.assessments?.[ass.uuid];
                      const hasMark = mark && mark.score !== null;

                      return (
                        <td
                          key={ass.uuid}
                          onClick={() => handleOpenEdit(row, ass, mark)}
                          className="py-3.5 px-4 text-center border-l border-slate-100 font-mono text-xs cursor-pointer group hover:bg-rose-50/50 transition"
                          title="Click to enter or modify assessment marks"
                        >
                          <div className="inline-flex items-center justify-center gap-1">
                            {hasMark ? (
                              <span className="font-bold text-slate-900 group-hover:text-[#73111b] transition">
                                {mark.score}
                              </span>
                            ) : (
                              <span className="text-slate-300 group-hover:text-slate-500 transition">
                                —
                              </span>
                            )}
                            <Edit3 className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition text-[#73111b]" />
                          </div>
                        </td>
                      );
                    })}

                    {/* Weighted Total */}
                    <td className="py-3.5 px-4 text-center font-black text-sm text-[#73111b] border-l border-slate-200 bg-rose-50/10">
                      {row.total_weighted_score}%
                    </td>

                    {/* Final Grade Letter */}
                    <td className="py-3.5 px-4 text-center border-l border-slate-100 bg-rose-50/10">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${
                          row.final_grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.final_grade === 'B'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : row.final_grade === 'C'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {row.final_grade}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center border-l border-slate-100 bg-rose-50/10">
                      <Badge variant={row.passed ? 'success' : 'danger'}>
                        {row.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mark Recording / Editing Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Record / Update Assessment Score"
        subtitle={`Candidate: ${selectedCell?.student?.student_name} (${selectedCell?.student?.student_number})`}
      >
        <form onSubmit={handleSaveMark} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Assessment</span>
            <p className="text-sm font-bold text-slate-900">{selectedCell?.assessment?.title}</p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-[#73111b]">
                {selectedCell?.assessment?.type}
              </span>
              <span>Weight: {selectedCell?.assessment?.weight}%</span>
              <span>• Max Marks: {selectedCell?.assessment?.total_marks || 100}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recorded Marks (out of {selectedCell?.assessment?.total_marks || 100}) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={selectedCell?.assessment?.total_marks || 100}
              required
              value={inputScore}
              onChange={(e) => setInputScore(e.target.value)}
              placeholder="e.g. 82.5"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Feedback / Remarks</label>
            <textarea
              rows={3}
              value={inputFeedback}
              onChange={(e) => setInputFeedback(e.target.value)}
              placeholder="Optional remarks on continuous assessment performance..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingMark}
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
            >
              {savingMark ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Saving & Recalculating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Mark & Recalculate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

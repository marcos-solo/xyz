import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, Play, Table } from 'lucide-react';
import type { Assessment, CourseBatch } from '../../../types/models';

export const AssessmentsListPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    batch_uuid: '',
    title: '',
    description: '',
    type: 'Quiz',
    weight_percentage: 20,
    total_marks: 50,
    pass_mark: 30,
    time_limit: 30,
    attempts_allowed: 2,
    randomize_questions: true,
    show_immediate_results: true,
  });

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const [assRes, bRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/batches'),
      ]);
      setAssessments(assRes.data.data || []);
      setBatches(bRes.data.data || []);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assessments', formData);
      setCreateOpen(false);
      fetchAssessments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create assessment.');
    }
  };

  const isStudent = user?.roles?.includes('Student');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{isStudent ? 'My Assessments' : 'Assessments & Quizzes'}</h1>
          <p className="text-xs text-slate-500">
            {isStudent ? 'View your enrolled assessments, check due work, and submit attempts.' : 'Create and manage quizzes, CATs, assignments, practicals, and final examinations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {batches.length > 0 && !isStudent && (
            <button
              onClick={() => navigate(`/batches/${batches[0]?.uuid}/gradebook`)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Table className="h-4 w-4 text-[#73111b]" />
              <span>Batch Gradebook</span>
            </button>
          )}

          {!isStudent && hasPermission('assessments.create') && (
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Loading assessment evaluations...
          </div>
        ) : (
          assessments.map((a) => (
            <Card key={a.uuid} className="flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={a.type === 'Quiz' ? 'primary' : a.type === 'CAT' ? 'info' : 'warning'}>
                    {a.type}
                  </Badge>
                  <span className="text-xs font-bold text-slate-500">Weight: {a.weight_percentage}%</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{a.batch?.name}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Marks</span>
                    <span className="font-bold text-slate-800">{a.total_marks} (Pass: {a.pass_mark})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Time Limit</span>
                    <span className="font-bold text-slate-800">{a.time_limit || 'Untimed'} mins</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {a.questions_count || a.questions?.length || 0} Questions
                </span>

                <button
                  onClick={() => navigate(`/assessments/${a.uuid}/take`)}
                  className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-1.5 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isStudent ? 'Take Assessment' : 'Preview Assessment'}</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Assessment"
        subtitle="Configure evaluation criteria and grading weights"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Cohort Batch *</label>
              <select
                required
                value={formData.batch_uuid}
                onChange={(e) => setFormData({ ...formData, batch_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Cohort Batch</option>
                {batches.map((b) => (
                  <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="Quiz">Quiz</option>
                <option value="CAT">Continuous Assessment Test (CAT)</option>
                <option value="Assignment">Assignment</option>
                <option value="Practical">Practical Examination</option>
                <option value="Final Examination">Final Examination</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. CAT 1: Routing Protocols & VLSM"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weight Percentage (%)</label>
              <input
                type="number"
                required
                value={formData.weight_percentage}
                onChange={(e) => setFormData({ ...formData, weight_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                required
                value={formData.total_marks}
                onChange={(e) => setFormData({ ...formData, total_marks: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pass Mark</label>
              <input
                type="number"
                required
                value={formData.pass_mark}
                onChange={(e) => setFormData({ ...formData, pass_mark: parseFloat(e.target.value) || 0 })}
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
              Create Assessment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

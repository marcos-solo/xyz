import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import api from '../../../api/client';
import {
  BookOpen,
  Plus,
  ArrowLeft,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Video,
  Check,
  CheckCircle2,
} from 'lucide-react';
import type { Course, CourseModule, CourseUnit } from '../../../types/models';
import { useAuth } from '../../../context/AuthContext';

export const CurriculumBuilderPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const isStudent = user?.roles?.includes('Student') ?? false;
  const canManageCurriculum = !isStudent && (
    hasPermission('modules.manage')
    || user?.roles?.some((role) => ['Admin', 'Administrator', 'Super Admin', 'CEO'].includes(role))
  );
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [unitTitle, setUnitTitle] = useState('');
  const [unitDesc, setUnitDesc] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<CourseUnit | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content_type: 'video',
    content: '',
    video_url: '',
    duration: 45,
  });

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${uuid}`);
      if (res.data.success) {
        setCourse(res.data.data);
        setCompletedLessons(new Set(res.data.data.learning_progress?.completed_lesson_uuids || []));
      }
    } catch (err) {
      console.error('Failed to load course curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) fetchCourse();
  }, [uuid]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${uuid}/modules`, {
        title: moduleTitle,
        description: moduleDesc,
        unit_uuid: selectedUnit?.uuid || undefined,
      });
      setAddModuleOpen(false);
      setModuleTitle('');
      setModuleDesc('');
      setSelectedUnit(null);
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add module.');
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${uuid}/units`, { title: unitTitle, description: unitDesc });
      setAddUnitOpen(false);
      setUnitTitle('');
      setUnitDesc('');
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add unit.');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      await api.post(`/modules/${selectedModule.uuid}/lessons`, lessonForm);
      setAddLessonOpen(false);
      setLessonForm({
        title: '',
        description: '',
        content_type: 'video',
        content: '',
        video_url: '',
        duration: 45,
      });
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add lesson.');
    }
  };

  const handleCompleteLesson = async (lessonUuid: string) => {
    const batchUuid = course?.batches?.[0]?.uuid;
    if (!batchUuid || completingLesson || completedLessons.has(lessonUuid)) return;
    setCompletingLesson(lessonUuid);
    try {
      await api.post(`/lessons/${lessonUuid}/progress`, { batch_uuid: batchUuid, status: 'completed' });
      setCompletedLessons((current) => new Set(current).add(lessonUuid));
      setCompletionMessage('Lesson completed. Keep going!');
      window.setTimeout(() => setCompletionMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update lesson progress.');
    } finally {
      setCompletingLesson(null);
    }
  };

  // Reorder modules up / down
  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    if (!course?.modules) return;
    const newModules = [...course.modules];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newModules.length) return;

    const temp = newModules[index];
    newModules[index] = newModules[targetIdx];
    newModules[targetIdx] = temp;

    setCourse({ ...course, modules: newModules });

    try {
      await api.post(`/courses/${uuid}/modules/reorder`, {
        module_uuids: newModules.map((m) => m.uuid),
      });
    } catch (err) {
      console.error('Failed to save reorder:', err);
      fetchCourse();
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-slate-400">
        Loading curriculum modules and lessons...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {completionMessage && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 shadow-lg" role="status">
          <CheckCircle2 className="h-4 w-4" />
          {completionMessage}
        </div>
      )}

      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/courses')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#73111b]">{course.code}</span>
              <Badge variant="primary">{course.level}</Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{course.name}</h1>
            {course.category?.name && <p className="text-xs text-slate-500 mt-0.5">Category: {course.category.name}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            hidden={!canManageCurriculum}
            onClick={() => { setSelectedUnit(null); setAddModuleOpen(true); }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Module</span>
          </button>
          <button
            hidden={!canManageCurriculum}
            onClick={() => setAddUnitOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#73111b] text-[#73111b] hover:bg-[#fff1f2] text-xs font-bold flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Curriculum Module Tree */}
      <div className="space-y-4">
        {course.units?.map((unit) => (
          <Card key={unit.uuid} className="p-5 border-[#fecdd3] bg-[#fffafb]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#fecdd3]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#73111b]">Unit</p>
                <h2 className="text-base font-bold text-slate-900">{unit.title}</h2>
                {unit.description && <p className="text-xs text-slate-500 mt-0.5">{unit.description}</p>}
              </div>
              <button
                hidden={!canManageCurriculum}
                onClick={() => { setSelectedUnit(unit); setAddModuleOpen(true); }}
                className="px-3.5 py-1.5 rounded-xl bg-[#73111b] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Module
              </button>
            </div>
            <div className="space-y-3 pl-3">
              {unit.modules?.length ? unit.modules.map((module) => (
                <div key={module.uuid} className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{module.title}</p>
                      <p className="text-[11px] text-slate-500">{module.lessons?.length || 0} lessons</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCollapsedModules((current) => {
                        const next = new Set(current);
                        if (next.has(module.uuid)) next.delete(module.uuid); else next.add(module.uuid);
                        return next;
                      })}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title={collapsedModules.has(module.uuid) ? 'Expand module' : 'Collapse module'}
                    >
                      {collapsedModules.has(module.uuid) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  {!collapsedModules.has(module.uuid) && <div className="mt-2 space-y-1">
                    {module.lessons?.map((lesson) => <p key={lesson.uuid} className="text-[11px] text-slate-600 pl-2">{lesson.title}</p>)}
                    {canManageCurriculum && <button onClick={() => { setSelectedModule(module); setAddLessonOpen(true); }} className="mt-2 text-[11px] font-bold text-[#73111b]">+ Add Lesson</button>}
                  </div>}
                </div>
              )) : <p className="text-xs text-slate-400 italic">No modules in this unit yet.</p>}
            </div>
          </Card>
        ))}

        {course.modules?.length === 0 && (course.units?.length || 0) === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">{canManageCurriculum ? 'No Curriculum Modules Defined' : 'No lessons available yet'}</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {canManageCurriculum ? 'Begin structuring this course by adding your first module.' : 'Your instructor has not published curriculum content for this course yet.'}
            </p>
            <button
              hidden={!canManageCurriculum}
              onClick={() => { setSelectedUnit(null); setAddModuleOpen(true); }}
              className="px-4 py-2 rounded-xl bg-[#73111b] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add First Module
            </button>
          </Card>
        ) : course.modules?.length ? (
          course.modules?.map((module, mIdx) => (
            <Card key={module.uuid} className="p-5 border-slate-200 bg-white">
              {/* Module Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCollapsedModules((current) => {
                      const next = new Set(current);
                      if (next.has(module.uuid)) next.delete(module.uuid); else next.add(module.uuid);
                      return next;
                    })}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title={collapsedModules.has(module.uuid) ? 'Expand module' : 'Collapse module'}
                  >
                    {collapsedModules.has(module.uuid) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {canManageCurriculum && <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveModule(mIdx, 'up')}
                      disabled={mIdx === 0}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveModule(mIdx, 'down')}
                      disabled={mIdx === (course.modules?.length || 1) - 1}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{module.title}</span>
                      <span className="text-[10px] font-semibold text-[#73111b] font-mono">
                        ({module.lessons?.length || 0} Lessons)
                      </span>
                    </h3>
                    {module.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    hidden={!hasPermission('lessons.manage') || collapsedModules.has(module.uuid)}
                    onClick={() => {
                      setSelectedModule(module);
                      setAddLessonOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#73111b]" /> Add Lesson
                  </button>
                </div>
              </div>

              {/* Lessons List in Module */}
              {!collapsedModules.has(module.uuid) && <div className="space-y-2 pl-6">
                {module.lessons?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic">No lessons in this module yet.</p>
                ) : (
                  module.lessons?.map((lesson) => (
                    <React.Fragment key={lesson.uuid}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={activeLesson === lesson.uuid}
                      onClick={() => setActiveLesson(activeLesson === lesson.uuid ? null : lesson.uuid)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setActiveLesson(activeLesson === lesson.uuid ? null : lesson.uuid);
                        }
                      }}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#73111b]">
                          {lesson.content_type === 'video' ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{lesson.title}</p>
                          <span className="text-[11px] text-slate-500 capitalize">
                            Type: {lesson.content_type} • {lesson.duration || 30} mins
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {completedLessons.has(lesson.uuid) && <Badge variant="success"><span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Completed</span></Badge>}
                        {lesson.is_preview && <Badge variant="success">Free Preview</Badge>}
                      </div>
                    </div>
                    {activeLesson === lesson.uuid && <div className="ml-3 p-4 rounded-xl border border-[#fecdd3] bg-[#fffafb] space-y-3">
                      {lesson.description && <p className="text-xs text-slate-600">{lesson.description}</p>}
                      {lesson.content && <p className="text-xs text-slate-700 whitespace-pre-wrap">{lesson.content}</p>}
                      {lesson.video_url && <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#73111b] hover:underline">Open lesson video</a>}
                      {isStudent && <button type="button" disabled={completingLesson === lesson.uuid || completedLessons.has(lesson.uuid)} onClick={() => handleCompleteLesson(lesson.uuid)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#73111b] text-white text-xs font-bold transition hover:bg-[#5c0d15] disabled:cursor-not-allowed disabled:bg-emerald-600">
                        {completingLesson === lesson.uuid ? 'Saving progress...' : completedLessons.has(lesson.uuid) ? <><Check className="h-3.5 w-3.5" /> Lesson completed</> : 'Mark lesson complete'}
                      </button>}
                    </div>}
                    </React.Fragment>
                  ))
                )}
              </div>}
            </Card>
          ))
        ) : null}
      </div>

      {/* Add Module Modal */}
      <Modal
        isOpen={addUnitOpen}
        onClose={() => setAddUnitOpen(false)}
        title="Add Course Unit"
        subtitle={`Course: ${course.name}`}
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unit Title *</label>
            <input required value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} placeholder="e.g. Financial Reporting" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={unitDesc} onChange={(e) => setUnitDesc(e.target.value)} placeholder="What this unit covers" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setAddUnitOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#73111b] text-xs font-bold text-white">Create Unit</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        title="Add Curriculum Module"
        subtitle={selectedUnit ? `Unit: ${selectedUnit.title}` : `Course: ${course.name}`}
      >
        <form onSubmit={handleAddModule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Module Title *</label>
            <input
              type="text"
              required
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="e.g. Module 1 — Networking Fundamentals"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Key Topics</label>
            <textarea
              rows={3}
              value={moduleDesc}
              onChange={(e) => setModuleDesc(e.target.value)}
              placeholder="Core competencies covered in this module..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModuleOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
            >
              Create Module
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={addLessonOpen}
        onClose={() => setAddLessonOpen(false)}
        title="Add Lesson to Module"
        subtitle={`Module: ${selectedModule?.title}`}
      >
        <form onSubmit={handleAddLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              placeholder="e.g. 1.1 Introduction to IP Subnetting"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Content Type</label>
              <select
                value={lessonForm.content_type}
                onChange={(e) => setLessonForm({ ...lessonForm, content_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="video">Video Stream URL</option>
                <option value="text">Markdown / Article Text</option>
                <option value="pdf">PDF Document</option>
                <option value="scorm">SCORM Package</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Duration (Mins)</label>
              <input
                type="number"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          {lessonForm.content_type === 'video' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video Stream URL</label>
              <input
                type="url"
                value={lessonForm.video_url}
                onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Content / Notes (Markdown)</label>
            <textarea
              rows={4}
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
              placeholder="Detailed lesson guide and notes..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddLessonOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
            >
              Save Lesson
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

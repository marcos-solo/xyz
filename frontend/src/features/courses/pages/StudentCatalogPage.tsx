import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  Search,
  BookOpen,
  Compass,
  Clock,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  GraduationCap,
  Sparkles,
  Award,
  ChevronRight,
  MapPin,
  Calendar,
  X,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface CourseItem {
  id: number;
  uuid: string;
  code: string;
  name: string;
  short_description?: string;
  description?: string;
  program_level?: string;
  paper_count?: number;
  duration: number;
  duration_unit: string;
  level: string;
  status: string;
  category?: { name: string; uuid: string };
  learning_path?: { uuid: string; title: string };
  modules_count?: number;
  units_count?: number;
  batches_count?: number;
  learning_progress?: {
    percentage: number;
  };
  batches?: {
    id: number;
    uuid: string;
    name: string;
    code: string;
    start_date?: string;
    branch?: { name: string };
  }[];
}

interface LearningPathItem {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: number;
  duration_unit: string;
  courses_count: number;
  progress_percentage?: number;
  courses?: {
    id: number;
    uuid: string;
    code: string;
    name: string;
    level: string;
  }[];
}

export const StudentCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathItem[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'courses' | 'paths'>(() => {
    return location.pathname.includes('/paths') ? 'paths' : 'courses';
  });

  useEffect(() => {
    if (location.pathname.includes('/paths')) {
      setViewMode('paths');
    } else if (location.pathname.includes('/catalog')) {
      setViewMode('courses');
    }
  }, [location.pathname]);

  // Course Detail & Application Modal state
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [courseDetailLoading, setCourseDetailLoading] = useState(false);
  const [fullCourseDetails, setFullCourseDetails] = useState<any>(null);
  const [selectedBatchUuid, setSelectedBatchUuid] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const [coursesRes, pathsRes, enrollmentsRes] = await Promise.all([
        api.get('/courses', { params: { per_page: 50 } }),
        api.get('/learning-paths'),
        api.get('/dashboard'),
      ]);

      setCourses(coursesRes.data.data || []);
      setLearningPaths(pathsRes.data.data || []);
      setStudentEnrollments(enrollmentsRes.data.data?.workflow || []);
    } catch (err) {
      console.error('Failed to load catalog data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const openCourseDetails = async (course: CourseItem) => {
    setSelectedCourse(course);
    setApplySuccess(null);
    setApplyError(null);
    setCourseDetailLoading(true);

    try {
      const res = await api.get(`/courses/${course.uuid}`);
      if (res.data.success) {
        setFullCourseDetails(res.data.data);
        if (res.data.data.batches?.length > 0) {
          setSelectedBatchUuid(res.data.data.batches[0].uuid);
        }
      }
    } catch (err: any) {
      console.error('Could not load course curriculum detail', err);
      setFullCourseDetails(null);
    } finally {
      setCourseDetailLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedBatchUuid) return;
    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const res = await api.post('/enrollments/apply', {
        batch_uuid: selectedBatchUuid,
      });

      if (res.data.success) {
        setApplySuccess(res.data.message || 'Application submitted successfully!');
        fetchCatalogData();
      }
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to submit intake application.');
    } finally {
      setApplying(false);
    }
  };

  // Check enrollment state for a given course
  const getEnrollmentStatus = (course: CourseItem) => {
    const courseCodeLower = course.code.toLowerCase();
    const courseNameLower = course.name.toLowerCase();

    const enrolled = studentEnrollments.find((e: any) => {
      const eName = (e.course_name || '').toLowerCase();
      return eName.includes(courseCodeLower) || courseNameLower.includes(eName) || eName === courseNameLower;
    });

    if (!enrolled) return null;
    return enrolled;
  };

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (c.category?.name || '').toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesLevel =
      selectedLevel === 'all' || c.level.toLowerCase() === selectedLevel.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner - Compact & Sleek */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#420a10] to-[#73111b] text-white px-5 py-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/15 text-rose-200 border border-white/20">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Academic Catalog
            </span>
            <span className="text-[11px] text-rose-200/70 font-medium">ACCA • Cisco • Cyber • BI</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Courses, Certifications & Learning Pathways
          </h1>
        </div>
        <p className="text-[11px] text-slate-200/80 max-w-xs hidden md:block text-right">
          Accredited qualifications and cohort intakes for career advancement.
        </p>
      </section>

      {/* 2. Controls & Filter Bar */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by qualification, paper or keyword (e.g. ACCA, TX, Cisco)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#73111b] focus:bg-white transition"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('courses')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'courses'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Qualifications ({filteredCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('paths')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'paths'
                  ? 'bg-white text-[#73111b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Career Tracks ({learningPaths.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {[
            { id: 'all', label: 'All Fields' },
            { id: 'acca', label: 'ACCA & Accounting' },
            { id: 'cisco', label: 'Cisco Networking' },
            { id: 'cyber', label: 'Cybersecurity' },
            { id: 'bi', label: 'Power BI & Analytics' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-[#73111b] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Catalog Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 text-xs">
          <Loader2 className="h-8 w-8 text-[#73111b] animate-spin mb-3" />
          <span>Loading catalog curriculums and cohort availability...</span>
        </div>
      ) : viewMode === 'paths' ? (
        /* Career Pathways View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {learningPaths.map((path) => (
            <div
              key={path.uuid}
              className="rounded-3xl bg-white border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#73111b]/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                    <Compass className="h-3 w-3" />
                    Structured Academic Track
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                    {path.level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{path.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {path.description || 'Structured academic track covering sequential curriculum requirements.'}
                </p>

                {/* Courses in path */}
                {path.courses && path.courses.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Course Units ({path.courses.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {path.courses.map((pc) => (
                        <span
                          key={pc.uuid}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                        >
                          {pc.code}: {pc.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{path.duration} {path.duration_unit} total</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('courses');
                    if (path.courses?.[0]) {
                      setSearchQuery(path.courses[0].code);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fff1f2] hover:bg-[#73111b] text-[#73111b] hover:text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Explore Track Courses</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Qualifications & Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const enrollment = getEnrollmentStatus(course);
            const isEnrolledActive = enrollment && ['in_training', 'course_completed', 'certified'].includes(enrollment.stage);
            const isPendingReview = enrollment && ['registered', 'branch_review', 'finance_cleared'].includes(enrollment.stage);

            return (
              <div
                key={course.uuid}
                className="rounded-3xl bg-white border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-[#73111b]/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#fff1f2] text-[#73111b] font-mono font-bold text-xs border border-[#fecdd3]">
                        {course.code}
                      </span>
                      {course.category?.name && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          {course.category.name}
                        </span>
                      )}
                    </div>

                    {isEnrolledActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Enrolled & Active
                      </span>
                    ) : isPendingReview ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        Admissions Review
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {course.level}
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#73111b] transition leading-snug">
                    {course.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {course.short_description || course.description || 'Comprehensive professional curriculum and CBE preparation.'}
                  </p>

                  {/* Feature Pills */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{course.duration} {course.duration_unit} duration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-[#73111b]" />
                      <span>
                        {course.paper_count ? `${course.paper_count} CBE Papers` : `${course.units_count || course.modules_count || 1} Curricular Units`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>Certificate & Transcript upon completion</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openCourseDetails(course)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
                  >
                    View Syllabus
                  </button>

                  {isEnrolledActive ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/learn/${course.uuid}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white text-xs font-bold shadow-xs transition"
                    >
                      <span>Study Player</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openCourseDetails(course)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fff1f2] hover:bg-[#73111b] text-[#73111b] hover:text-white border border-[#fecdd3] text-xs font-bold transition shadow-2xs"
                    >
                      <span>Apply for Intake</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredCourses.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              No qualifications found matching your search and category filter.
            </div>
          )}
        </div>
      )}

      {/* 4. Course Syllabus & Cohort Application Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#73111b] bg-[#fff1f2] px-2 py-0.5 rounded border border-[#fecdd3]">
                    {selectedCourse.code}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedCourse.level}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedCourse.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Overview</h4>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {selectedCourse.description || selectedCourse.short_description || 'Professional qualifications designed with practical case study applications and CBE test preparation.'}
                </p>
              </div>

              {/* Syllabus Units / Modules */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Curriculum Units & Papers
                </h4>
                {courseDetailLoading ? (
                  <div className="py-6 flex justify-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#73111b]" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fullCourseDetails?.units?.map((u: any, idx: number) => (
                      <div key={u.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{u.title}</span>
                          <span className="text-[10px] text-slate-400">{u.modules?.length || 0} Modules</span>
                        </div>
                        {u.modules && u.modules.length > 0 && (
                          <div className="mt-2 pl-3 border-l-2 border-[#73111b]/30 space-y-1 text-slate-600">
                            {u.modules.map((m: any) => (
                              <div key={m.id} className="flex items-center justify-between text-[11px]">
                                <span>{m.title}</span>
                                <span className="text-slate-400">{m.lessons?.length || 0} lessons</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {(!fullCourseDetails?.units || fullCourseDetails.units.length === 0) && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-500">
                        Standard full-length accredited curriculum covering theory, revision, and CBE mock drills.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Available Intakes & Application */}
              <div className="p-4 rounded-2xl bg-rose-50/40 border border-[#fecdd3] space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#73111b]" />
                  <span>Select Cohort Intake</span>
                </h4>

                {fullCourseDetails?.batches && fullCourseDetails.batches.length > 0 ? (
                  <div className="space-y-2">
                    {fullCourseDetails.batches.map((b: any) => (
                      <label
                        key={b.uuid}
                        className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition ${
                          selectedBatchUuid === b.uuid
                            ? 'bg-white border-[#73111b] shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="cohort_batch"
                            checked={selectedBatchUuid === b.uuid}
                            onChange={() => setSelectedBatchUuid(b.uuid)}
                            className="mt-0.5 text-[#73111b] focus:ring-[#73111b]"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{b.name}</p>
                            <p className="text-[11px] text-slate-500">
                              Branch: {b.branch?.name || 'Nairobi Main'} • Starts: {b.start_date || 'September 2026'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Admissions Open
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">
                    New cohorts are scheduling. You can apply to be placed in the upcoming intake.
                  </p>
                )}

                {applySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{applySuccess}</span>
                  </div>
                )}

                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{applyError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Close
              </button>

              <button
                type="button"
                disabled={applying || !selectedBatchUuid || applySuccess !== null}
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#73111b]/20 transition flex items-center gap-2"
              >
                {applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : applySuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Application Recorded</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Intake Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Badge } from '../../../components/common/Badge';
import {
  X,
  Copy,
  Check,
  Building,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  UserCheck,
  Shield,
  MapPin,
  IdCard,
  Edit2,
  GraduationCap,
  Users,
} from 'lucide-react';
import type { StudentProfile } from '../../../types/models';

interface StudentProfileDrawerProps {
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: StudentProfile) => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'academics' | 'personal' | 'guardians'>('academics');

  if (!isOpen || !student) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(student.student_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enrollments = (student.user as any)?.enrollments || [];

  const workflowLabels: Record<string, string> = {
    registered: 'Registered',
    branch_review: 'Branch review',
    finance_cleared: 'Finance cleared',
    in_training: 'In training',
    course_completed: 'Course completed',
    certification_ready: 'Ready for certification',
    certified: 'Certified',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-300">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-[#73111b] via-[#8c1d29] to-[#540d14] text-white p-6 pb-7">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Close Dossier"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black text-white shadow-inner shrink-0">
                {student.user?.first_name?.charAt(0)}
                {student.user?.last_name?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight truncate">
                    {student.user?.full_name}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      student.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        student.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    {student.status.toUpperCase()}
                  </span>
                </div>

                {/* Copyable Student ID */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-rose-100 bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
                    {student.student_number}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition flex items-center gap-1 text-[10px] font-medium"
                    title="Copy Student Number"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-300" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-rose-100/90">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 opacity-75" />
                    {student.user?.branch?.name || 'Main Campus'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 opacity-75" />
                    Admitted {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6">
            <button
              onClick={() => setActiveTab('academics')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'academics'
                  ? 'border-[#73111b] text-[#73111b] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Academic Programs ({enrollments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'personal'
                  ? 'border-[#73111b] text-[#73111b] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('guardians')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'guardians'
                  ? 'border-[#73111b] text-[#73111b] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Guardians & Contacts</span>
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'academics' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cohort Enrolments & Curriculum
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    {enrollments.length} Active Placement{enrollments.length === 1 ? '' : 's'}
                  </span>
                </div>

                {enrollments.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No active academic enrollments</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      This student is admitted to the institution roster but has not yet been assigned to an active intake cohort.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enr: any) => (
                      <div
                        key={enr.uuid || enr.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#73111b]/30 hover:shadow-xs transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#73111b] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                              {enr.batch?.course?.code || 'PROGRAM'}
                            </span>
                            <h4 className="mt-1.5 text-sm font-bold text-slate-900">
                              {enr.batch?.course?.name || 'Assigned Course'}
                            </h4>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              {enr.batch?.name}
                            </p>
                          </div>
                          <Badge
                            variant={
                              enr.workflow_stage === 'certified'
                                ? 'success'
                                : enr.workflow_stage === 'in_training'
                                ? 'primary'
                                : 'neutral'
                            }
                          >
                            {workflowLabels[enr.workflow_stage] || enr.workflow_stage || enr.status}
                          </Badge>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Enrollment #
                            </span>
                            <span className="font-mono text-slate-700 font-semibold">
                              {enr.enrollment_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Date Enrolled
                            </span>
                            <span className="text-slate-700">
                              {enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Institutional Profile & Identity
                </h3>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 divide-y divide-slate-200/80">
                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Email Address
                    </span>
                    <a
                      href={`mailto:${student.user?.email}`}
                      className="font-semibold text-[#73111b] hover:underline"
                    >
                      {student.user?.email}
                    </a>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      Phone Contact
                    </span>
                    <span className="font-semibold text-slate-800">
                      {student.user?.phone || 'Not provided'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5 text-slate-400" />
                      National ID / Passport
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {student.national_id || 'Not registered'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Date of Birth
                    </span>
                    <span className="font-semibold text-slate-800">
                      {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-slate-400" />
                      Gender
                    </span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {student.gender || 'Unspecified'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Residential Address
                    </span>
                    <span className="font-semibold text-slate-800">
                      {student.address || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guardians' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Parent, Guardian & Emergency Contacts
                </h3>

                {student.guardians && student.guardians.length > 0 ? (
                  student.guardians.map((g, idx) => (
                    <div
                      key={g.uuid || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            {g.pivot?.relationship || 'Guardian'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {g.first_name} {g.last_name}
                          </h4>
                          {g.occupation && (
                            <p className="text-xs text-slate-500">{g.occupation}</p>
                          )}
                        </div>
                        {g.pivot?.is_emergency_contact && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Emergency Contact
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <a href={`tel:${g.phone}`} className="hover:text-[#73111b] font-medium">
                            {g.phone}
                          </a>
                        </div>
                        {g.email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <a href={`mailto:${g.email}`} className="hover:text-[#73111b] font-medium truncate">
                              {g.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : student.emergency_contact_name ? (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Emergency Contact Record
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {student.emergency_contact_name}
                    </h4>
                    {student.emergency_contact_phone && (
                      <p className="text-xs text-slate-600 font-medium">
                        Phone: {student.emergency_contact_phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No guardian contacts recorded</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      No parent or guardian details were provided during admission.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-1.5 transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Student Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

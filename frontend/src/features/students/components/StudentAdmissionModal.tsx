import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import api from '../../../api/client';
import { UserPlus, BookOpen, User, Users, Building, Shield, AlertCircle, Loader2 } from 'lucide-react';
import type { Branch, Course, CourseBatch } from '../../../types/models';

interface StudentAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentAdmissionModal: React.FC<StudentAdmissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    branch_uuid: '',
    admission_date: new Date().toISOString().split('T')[0],
    date_of_birth: '',
    gender: 'male',
    national_id: '',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relationship: 'Parent',
    course_uuid: '',
    batch_uuid: '',
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      Promise.all([
        api.get('/branches'),
        api.get('/courses', { params: { per_page: 100 } }),
        api.get('/batches', { params: { per_page: 100 } }),
      ]).then(([branchRes, courseRes, batchRes]) => {
        setBranches(branchRes.data.data || []);
        setCourses(courseRes.data.data || []);
        setBatches(batchRes.data.data || []);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to admit student. Please review inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Intake & Admission"
      subtitle="Register student profile with auto-generated student number, campus branch, and cohort placement."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Personal Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="h-4 w-4 text-[#73111b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                placeholder="e.g. Mwangi"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kariuki"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+254 700 000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">National ID / Passport</label>
              <input
                type="text"
                placeholder="ID or Passport #"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Institutional & Campus Setup */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="h-4 w-4 text-[#73111b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Campus & Intake Timing
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch *</label>
              <select
                required
                value={formData.branch_uuid}
                onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Campus</option>
                {branches.map((b) => (
                  <option key={b.uuid} value={b.uuid}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admission Date *</label>
              <input
                type="date"
                required
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Academic Placement */}
        <div className="rounded-2xl border border-rose-200 bg-[#fff9f9] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#73111b]" />
              <h4 className="text-xs font-bold text-slate-800">Academic Placement (Optional)</h4>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Can be enrolled later</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Programme</label>
              <select
                value={formData.course_uuid}
                onChange={(e) => setFormData({ ...formData, course_uuid: e.target.value, batch_uuid: '' })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#73111b]"
              >
                <option value="">Admit without immediate cohort</option>
                {courses.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Intake Batch</label>
              <select
                value={formData.batch_uuid}
                disabled={!formData.course_uuid}
                onChange={(e) => setFormData({ ...formData, batch_uuid: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 disabled:opacity-50 disabled:bg-slate-100 focus:border-[#73111b]"
              >
                <option value="">Select intake batch</option>
                {batches
                  .filter((b) => b.course?.uuid === formData.course_uuid)
                  .map((b) => (
                    <option key={b.uuid} value={b.uuid}>
                      {b.name} ({b.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Guardian & Emergency Contacts */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="h-4 w-4 text-[#73111b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Parent, Guardian or Sponsor Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Parent / Guardian Name"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Contact</label>
              <input
                type="text"
                placeholder="+254 7..."
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
              <select
                value={formData.guardian_relationship}
                onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Legal Guardian</option>
                <option value="Sponsor">Sponsor</option>
                <option value="Self">Self / Employer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Admitting Student...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Admit Student</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

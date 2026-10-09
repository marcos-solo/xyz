import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Compass, UserPlus } from 'lucide-react';
import { IatLogo } from '../../../components/common/IatLogo';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

interface RegistrationCourse {
  uuid: string;
  name: string;
  code?: string;
  learning_path?: {
    uuid: string;
    title: string;
    slug?: string;
    name?: string;
  };
  batches: RegistrationBatch[];
}

interface RegistrationBatch {
  uuid: string;
  name: string;
  start_date: string;
  end_date?: string;
  capacity: number;
  active_enrollments_count: number;
  branch?: { name: string };
}

export const StudentRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [courses, setCourses] = useState<RegistrationCourse[]>([]);
  const [courseUuid, setCourseUuid] = useState('');
  const [batchUuid, setBatchUuid] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [privacyNoticeAccepted, setPrivacyNoticeAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/registration-options')
      .then((response) => setCourses(response.data.data || []))
      .catch(() => setError('Unable to load available courses and intakes.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedCourse = courses.find((course) => course.uuid === courseUuid);
  const availableBatches = selectedCourse?.batches.filter((batch) => batch.active_enrollments_count < batch.capacity) || [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post('/auth/register-student', {
        ...form,
        course_uuid: courseUuid,
        batch_uuid: batchUuid,
        privacy_notice_accepted: privacyNoticeAccepted,
      });
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/my-courses', { replace: true });
    } catch (requestError: any) {
      const validation = requestError.response?.data?.errors;
      setError(validation ? Object.values(validation).flat().join(' ') : requestError.response?.data?.message || 'Registration could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><IatLogo size="md" /></div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Apply for student admission</h1>
          <p className="mt-2 text-sm text-slate-500">Create your account, choose a course and intake, then submit your admission application.</p>
        </div>

        {error && <div className="mt-6 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

        <form onSubmit={submit} className="mt-7 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {(['first_name', 'last_name'] as const).map((field) => (
              <label key={field} className="text-xs font-bold text-slate-700">
                {field === 'first_name' ? 'First name' : 'Last name'}
                <input required value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white" />
              </label>
            ))}
          </div>
          <label className="block text-xs font-bold text-slate-700">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white" /></label>
          <label className="block text-xs font-bold text-slate-700">Phone number <span className="font-normal text-slate-400">(optional)</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">Course<select required value={courseUuid} onChange={(event) => { setCourseUuid(event.target.value); setBatchUuid(''); }} disabled={loading} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white"><option value="">{loading ? 'Loading courses...' : 'Select course'}</option>{courses.map((course) => <option key={course.uuid} value={course.uuid}>{course.name}{course.code ? ` (${course.code})` : ''}</option>)}</select></label>
            <label className="text-xs font-bold text-slate-700">Preferred intake<select required value={batchUuid} onChange={(event) => setBatchUuid(event.target.value)} disabled={!courseUuid} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white"><option value="">Select intake</option>{availableBatches.map((batch) => <option key={batch.uuid} value={batch.uuid}>{batch.name} - {batch.branch?.name || 'Campus'}</option>)}</select></label>
            {selectedCourse?.learning_path && (
              <div className="sm:col-span-2 rounded-2xl border border-[#fecdd3] bg-[#fffafb] p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center shrink-0">
                    <Compass className="h-4 w-4 text-[#73111b]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#73111b]">Curriculum Learning Track</p>
                    <p className="text-slate-600 font-medium">{selectedCourse.learning_path.title || (selectedCourse.learning_path as any).name}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#73111b] bg-white px-2.5 py-1 rounded-lg border border-[#fecdd3]">
                  Track Included
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">Password<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white" /></label>
            <label className="text-xs font-bold text-slate-700">Confirm password<input required minLength={8} type="password" value={form.password_confirmation} onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#73111b] focus:bg-white" /></label>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-slate-600">
              <input
                type="checkbox"
                required
                checked={privacyNoticeAccepted}
                onChange={(event) => setPrivacyNoticeAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#73111b]"
              />
              <span>
                I acknowledge that the personal information I provide will be used to process my application and manage my student account, in accordance with Kenya's Data Protection Act, 2019 and other applicable data protection requirements, including the GDPR where applicable.
              </span>
            </label>
            <p className="mt-2 pl-6 text-[10px] leading-relaxed text-slate-500">
              Please provide accurate information. You may contact IAT to ask about access, correction, or other rights over your personal data.
            </p>
          </div>
          <button type="submit" disabled={submitting || loading || !availableBatches.length || !privacyNoticeAccepted} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#73111b] py-3.5 text-sm font-bold text-white shadow-md shadow-[#73111b]/20 transition hover:bg-[#5c0d15] disabled:cursor-not-allowed disabled:opacity-50"><UserPlus className="h-4 w-4" />{submitting ? 'Submitting application...' : 'Submit application'}<ArrowRight className="h-4 w-4" /></button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">Already registered? <Link to="/login" className="font-bold text-[#73111b] hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
};
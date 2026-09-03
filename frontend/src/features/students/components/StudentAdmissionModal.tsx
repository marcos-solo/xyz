import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import api from '../../../api/client';
import type { Branch } from '../../../types/models';

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
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      api.get('/branches').then((res) => setBranches(res.data.data || []));
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
      setError(err.response?.data?.message || 'Failed to admit student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Intake & Admission"
      subtitle="Register student profile with auto-generated student number and guardian contacts"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
            <input
              type="text"
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch *</label>
            <select
              required
              value={formData.branch_uuid}
              onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Admission Date</label>
            <input
              type="date"
              required
              value={formData.admission_date}
              onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
        </div>

        {/* Guardian Information */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Parent / Guardian Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Guardian Name</label>
              <input
                type="text"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                placeholder="Parent Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Guardian Phone</label>
              <input
                type="text"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                placeholder="+254 7..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Relationship</label>
              <select
                value={formData.guardian_relationship}
                onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Legal Guardian</option>
                <option value="Sponsor">Sponsor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 disabled:opacity-50"
          >
            {loading ? 'Admitting...' : 'Admit Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import api from '../../../api/client';
import { Check, ChevronRight, ChevronLeft, User, Building, Lock, Shield, CheckCircle2 } from 'lucide-react';
import type { Branch, Department, Position, Role } from '../../../types/models';

interface UserCreateWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserCreateWizardModal: React.FC<UserCreateWizardModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    branch_uuid: '',
    department_uuid: '',
    position_uuid: '',
    password: '',
    status: 'active',
    roles: [] as string[],
    job_title: '',
    user_type: 'staff',
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      fetchMetadata();
    }
  }, [isOpen]);

  const fetchMetadata = async () => {
    try {
      const [bRes, dRes, pRes, rRes] = await Promise.all([
        api.get('/branches'),
        api.get('/departments'),
        api.get('/positions'),
        api.get('/roles'),
      ]);
      setBranches(bRes.data.data || []);
      setDepartments(dRes.data.data || []);
      setPositions(pRes.data.data || []);
      setRoles(rRes.data.data || []);
    } catch (err) {
      console.error('Failed to load org metadata:', err);
    }
  };

  const handleRoleToggle = (roleName: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBranch = branches.find((b) => b.uuid === formData.branch_uuid);
  const selectedDept = departments.find((d) => d.uuid === formData.department_uuid);
  const selectedPos = positions.find((p) => p.uuid === formData.position_uuid);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create User Account"
      subtitle={`Step ${step} of 5 — Administrator Creation Flow`}
      maxWidth="2xl"
    >
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        {[
          { num: 1, label: 'Personal', icon: User },
          { num: 2, label: 'Campus', icon: Building },
          { num: 3, label: 'Account', icon: Lock },
          { num: 4, label: 'Roles', icon: Shield },
          { num: 5, label: 'Review', icon: CheckCircle2 },
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;

          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#73111b] text-white shadow-md shadow-[#73111b]/30 ring-2 ring-[#73111b]/30'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. John"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                placeholder="e.g. Kamau"
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
                placeholder="e.g. Mwangi"
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
                placeholder="john.mwangi@iat.ac.ke"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254 700 000000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Branch *</label>
            <select
              value={formData.branch_uuid}
              onChange={(e) => setFormData({ ...formData, branch_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Campus Branch</option>
              {branches.map((b) => (
                <option key={b.uuid} value={b.uuid}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department_uuid}
                onChange={(e) => setFormData({ ...formData, department_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((d) => (
                  <option key={d.uuid} value={d.uuid}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Position (Job Title)</label>
              <select
                value={formData.position_uuid}
                onChange={(e) => setFormData({ ...formData, position_uuid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              >
                <option value="">Select Organizational Title</option>
                {positions.map((p) => (
                  <option key={p.uuid} value={p.uuid}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password (Leave blank to auto-generate)</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="e.g. Password123!"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Roles *</label>
          <select
            multiple
            value={formData.roles}
            onChange={(e) => setFormData({ ...formData, roles: Array.from(e.target.selectedOptions, (option) => option.value) })}
            className="w-full min-h-40 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
          >
            {roles.map((r) => <option key={r.uuid} value={r.name}>{r.display_name || r.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {formData.roles.map((roleName) => <Badge key={roleName} variant="primary">{roles.find((role) => role.name === roleName)?.display_name || roleName}</Badge>)}
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div className="space-y-3 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in fade-in duration-150">
          <div className="flex justify-between py-1.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Full Name:</span>
            <span className="font-bold text-slate-800">
              {formData.first_name} {formData.middle_name} {formData.last_name}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Email Address:</span>
            <span className="font-bold text-slate-800">{formData.email}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Campus:</span>
            <span className="font-bold text-slate-800">{selectedBranch?.name || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Department / Position:</span>
            <span className="font-bold text-slate-800">
              {selectedDept?.name || 'N/A'} • {selectedPos?.name || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Assigned Roles:</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {formData.roles.map((r) => (
                <Badge key={r} variant="primary">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={step === 1 || loading}
          onClick={() => setStep(step - 1)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition flex items-center gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {step < 5 ? (
          <button
            type="button"
            disabled={
              (step === 1 && (!formData.first_name || !formData.last_name || !formData.email)) ||
              (step === 4 && formData.roles.length === 0)
            }
            onClick={() => setStep(step + 1)}
            className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 transition flex items-center gap-1.5 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition flex items-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Confirm & Create Account'}
          </button>
        )}
      </div>
    </Modal>
  );
};

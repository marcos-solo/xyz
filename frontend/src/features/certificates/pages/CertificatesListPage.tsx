import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Plus, AlertTriangle, ExternalLink } from 'lucide-react';
import type { Certificate, CourseBatch, User as UserModel } from '../../../types/models';

export const CertificatesListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [issueOpen, setIssueOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const [issueForm, setIssueForm] = useState({
    student_uuid: '',
    batch_uuid: '',
    template_uuid: '',
    force: false,
  });
  const [studentsInBatch, setStudentsInBatch] = useState<UserModel[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, tRes] = await Promise.all([
        api.get('/certificates'),
        api.get('/batches'),
        api.get('/certificate-templates'),
      ]);
      setCertificates(cRes.data.data || []);
      setBatches(bRes.data.data || []);
      setTemplates(tRes.data.data || []);
      if (tRes.data.data?.[0]) {
        setIssueForm((prev) => ({ ...prev, template_uuid: tRes.data.data[0].uuid }));
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleBatchSelect = async (batchUuid: string) => {
    setIssueForm((prev) => ({ ...prev, batch_uuid: batchUuid, student_uuid: '' }));
    try {
      const res = await api.get('/students');
      setStudentsInBatch(res.data.data?.map((sp: any) => sp.user) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/certificates/issue', issueForm);
      setIssueOpen(false);
      fetchCertificates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue certificate.');
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) return;
    try {
      await api.post(`/certificates/${selectedCert.uuid}/revoke`, { reason: revokeReason });
      setRevokeOpen(false);
      setSelectedCert(null);
      setRevokeReason('');
      fetchCertificates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke certificate.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Certificate Credential Registry</h1>
          <p className="text-xs text-slate-500">Issue tamper-proof certificates with QR validation and audit tracking.</p>
        </div>
        {hasPermission('certificates.issue') && (
          <button
            onClick={() => setIssueOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Issue Certificate</span>
          </button>
        )}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Certificate #</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Course Program</th>
                <th className="py-3.5 px-4">Campus</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading credentials registry...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No certificates issued.
                  </td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.uuid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#73111b]">
                      {c.certificate_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.student?.full_name}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{c.course?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.batch?.branch?.name || 'Main Campus'}</td>
                    <td className="py-3 px-4 font-black text-emerald-700">{c.final_grade}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === 'issued' ? 'success' : 'danger'}>{c.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/verify/${c.verification_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-[#73111b] hover:bg-[#fff1f2] transition"
                          title="Public Verification"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        {c.status === 'issued' && hasPermission('certificates.revoke') && (
                          <button
                            onClick={() => {
                              setSelectedCert(c);
                              setRevokeOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                            title="Revoke Certificate"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Issue Modal */}
      <Modal
        isOpen={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Certificate Credential"
        subtitle="Validate graduation requirements and mint certificate"
      >
        <form onSubmit={handleIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Cohort Batch *</label>
            <select
              required
              value={issueForm.batch_uuid}
              onChange={(e) => handleBatchSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Cohort</option>
              {batches.map((b) => (
                <option key={b.uuid} value={b.uuid}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Graduating Student *</label>
            <select
              required
              value={issueForm.student_uuid}
              onChange={(e) => setIssueForm({ ...issueForm, student_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Student</option>
              {studentsInBatch.map((st) => (
                <option key={st.uuid} value={st.uuid}>{st.full_name} ({st.email})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="force"
              checked={issueForm.force}
              onChange={(e) => setIssueForm({ ...issueForm, force: e.target.checked })}
              className="rounded border-slate-300 text-[#73111b] focus:ring-[#73111b]"
            />
            <label htmlFor="force" className="text-xs text-slate-600 cursor-pointer font-medium">
              Override strict graduation requirements (Admin manual approval)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIssueOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
            >
              Mint & Issue Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        title="Revoke Certificate Credential"
        subtitle={`Certificate: ${selectedCert?.certificate_number}`}
      >
        <form onSubmit={handleRevoke} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            Revoking a certificate invalidates its public verification QR code and marks it as revoked in audit logs.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Revocation *</label>
            <textarea
              rows={3}
              required
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="State clear justification (e.g. Academic dishonesty, administrative issuance error)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRevokeOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/30"
            >
              Confirm Revocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

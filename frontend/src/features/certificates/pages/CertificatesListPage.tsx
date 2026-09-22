import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import {
  Plus,
  AlertTriangle,
  ExternalLink,
  Award,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  QrCode,
  Download,
} from 'lucide-react';
import type { Certificate, CourseBatch, User as UserModel } from '../../../types/models';

export const CertificatesListPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [issueOpen, setIssueOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);
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

  const handleCopyVerifyUrl = (code: string) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getHonorsLabel = (grade?: string) => {
    if (grade === 'A') return 'Conferred with High Distinction';
    if (grade === 'B') return 'Conferred with Credit';
    if (grade === 'C') return 'Conferred with Pass Standing';
    return 'Conferred with Honors';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
              Credentials & Diplomas
            </span>
            <span className="text-xs text-slate-400">• Cryptographic Validation</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Certificate Credential Registry
          </h1>
          <p className="text-xs text-slate-500">
            Issue and verify tamper-proof graduation certificates with public QR registry tracking.
          </p>
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
      <Card className="p-0 overflow-hidden border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Certificate #</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Course Program</th>
                <th className="py-3.5 px-4">Campus</th>
                <th className="py-3.5 px-4 text-center">Grade</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    Loading credentials registry...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No certificates issued.
                  </td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.uuid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#73111b]">
                      {c.certificate_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.student?.full_name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{c.course?.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.batch?.branch?.name || 'Main Campus'}</td>
                    <td className="py-3.5 px-4 text-center font-black text-emerald-700">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                        {c.final_grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={c.status === 'issued' ? 'success' : 'danger'}>{c.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Certificate Modal Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewCert(c)}
                          className="px-3 py-1 rounded-xl bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] text-[#73111b] font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                          title="View Digital Certificate"
                        >
                          <Award className="h-3.5 w-3.5 text-[#73111b]" />
                          <span>View Diploma</span>
                        </button>

                        <a
                          href={`/verify/${c.verification_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl border border-slate-200 text-[#73111b] hover:bg-slate-50 transition"
                          title="Public Verification"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        {c.status === 'issued' && hasPermission('certificates.revoke') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCert(c);
                              setRevokeOpen(true);
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
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

      {/* Ornate Digital Certificate Preview Modal */}
      <Modal
        isOpen={!!previewCert}
        onClose={() => setPreviewCert(null)}
        title="Official Academic Credential"
        subtitle={`Verification Hash: ${previewCert?.verification_code}`}
        maxWidth="4xl"
      >
        {previewCert && (
          <div className="space-y-6">
            {/* The Certificate Canvas */}
            <div
              id="printable-certificate"
              className="relative p-8 sm:p-12 rounded-3xl border-8 border-double border-[#73111b]/80 bg-gradient-to-b from-[#faf8f5] via-[#fffdfa] to-[#fbf9f6] text-center shadow-xl overflow-hidden select-none"
            >
              {/* Ornate Gold Border Inner Frame */}
              <div className="border border-amber-600/40 rounded-2xl p-6 sm:p-10 relative">
                {/* Background Watermark Crest */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                  <Award className="h-96 w-96 text-[#73111b]" />
                </div>

                {/* Institution Header */}
                <div className="space-y-1 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-[#73111b] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-[#73111b]/30">
                      IAT
                    </div>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-[#73111b] tracking-widest uppercase">
                    Institute of Advanced Technology
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Excellence in Professional & Academic Education • Est. 1991
                  </p>
                  <div className="h-0.5 w-28 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent mx-auto mt-2" />
                </div>

                {/* Certificate Qualification Title */}
                <div className="my-6">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500 block mb-1">
                    Academic Syndicate & Senate of Examiners
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                    Certificate of Academic Qualification
                  </h3>
                </div>

                {/* Body Text */}
                <div className="my-6 space-y-3">
                  <p className="text-xs text-slate-600 italic font-serif">
                    This is to certify that
                  </p>

                  <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#73111b] tracking-wider my-2">
                    {previewCert.student?.full_name}
                  </h1>

                  <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                    having satisfied all requirements of the Examination Syndicate and successfully passed
                    the prescribed curriculum of studies, is hereby officially conferred the credential in
                  </p>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-1">
                    {previewCert.course?.name}
                  </h2>

                  <p className="text-xs text-slate-500 font-medium">
                    Cohort Intake: <span className="font-semibold text-slate-700">{previewCert.batch?.name}</span> • Campus: <span className="font-semibold text-slate-700">{previewCert.batch?.branch?.name || 'Main Campus'}</span>
                  </p>

                  {/* Honors Banner */}
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold tracking-wide shadow-2xs">
                      ✨ {getHonorsLabel(previewCert.final_grade)} (Grade: {previewCert.final_grade})
                    </span>
                  </div>
                </div>

                {/* Certificate Footer with Signatures & Seals */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mt-10 pt-6 border-t border-amber-600/20 text-xs text-slate-700">
                  {/* Left Signature */}
                  <div className="text-center sm:text-left space-y-1">
                    <div className="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 w-36 mx-auto sm:mx-0 font-bold">
                      Dr. N. Wanjiru
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Director of Academic Affairs
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Issued: {previewCert.issue_date}
                    </span>
                  </div>

                  {/* Center Convocation Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-amber-600/80 bg-amber-50/80 flex flex-col items-center justify-center text-amber-800 shadow-inner">
                      <ShieldCheck className="h-6 w-6 text-amber-600 mb-0.5" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">OFFICIAL SEAL</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      {previewCert.certificate_number}
                    </span>
                  </div>

                  {/* Right Signature */}
                  <div className="text-center sm:text-right space-y-1">
                    <div className="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 w-36 mx-auto sm:ml-auto font-bold">
                      Prof. K. Odhiambo
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Controller of Examinations
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Code: {previewCert.verification_code}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified by IAT Public Blockchain & Credential Ledger</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyVerifyUrl(previewCert.verification_code)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>Copy Verification Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`/verify/${previewCert.verification_code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                  <span>Public Registry</span>
                </a>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue Modal */}
      <Modal
        isOpen={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Certificate Credential"
        subtitle="Validate graduation requirements and mint certificate"
      >
        <form onSubmit={handleIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Intake Batch *</label>
            <select
              required
              value={issueForm.batch_uuid}
              onChange={(e) => handleBatchSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              <option value="">Select Intake</option>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Template *</label>
            <select
              required
              value={issueForm.template_uuid}
              onChange={(e) => setIssueForm({ ...issueForm, template_uuid: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            >
              {templates.map((t) => (
                <option key={t.uuid} value={t.uuid}>{t.name} ({t.type})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="forceIssue"
              checked={issueForm.force}
              onChange={(e) => setIssueForm({ ...issueForm, force: e.target.checked })}
              className="h-4 w-4 rounded text-[#73111b] focus:ring-[#73111b]"
            />
            <label htmlFor="forceIssue" className="text-xs text-slate-600 font-medium">
              Academic Senate Override (Bypass minimum attendance / financial clearance check)
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
              Issue Credential
            </button>
          </div>
        </form>
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={revokeOpen}
        onClose={() => {
          setRevokeOpen(false);
          setSelectedCert(null);
        }}
        title="Revoke Certificate Credential"
        subtitle={`Certificate Number: ${selectedCert?.certificate_number}`}
      >
        <form onSubmit={handleRevoke} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Permanent Audit Action: </span>
              Revoking a credential marks it invalid in the public ledger and blocks QR verification.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Revocation *</label>
            <textarea
              required
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Provide official academic senate justification..."
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/30"
            >
              Confirm Revocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

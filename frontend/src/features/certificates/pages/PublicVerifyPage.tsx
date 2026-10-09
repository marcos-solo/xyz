import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/client';
import { IatLogo } from '../../../components/common/IatLogo';
import { ShieldCheck, ShieldAlert, Award, Building, Calendar, CheckCircle2, User, BookOpen, Search } from 'lucide-react';

export const PublicVerifyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchValue, setSearchValue] = useState(code || '');
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState<any>(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setSearchValue(code || '');
    setCert(null);
    setError('');
    setHasSearched(false);
  }, [code]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const certificateNumber = searchValue.trim();
    if (!certificateNumber) return;

    setLoading(true);
    setError('');
    setCert(null);
    setHasSearched(true);
    try {
      const res = await api.get(`/public/verify-certificate/${encodeURIComponent(certificateNumber)}`);
      if (res.data.success) setCert(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No certificate matched that number. Check it and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        {/* IAT Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-200 mb-3">
            <IatLogo size="md" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Public Digital Credential Verification</h1>
          <p className="text-xs text-slate-500">Cryptographically verifiable certificate authenticating student qualification</p>
        </div>

        <form onSubmit={handleSearch} className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label htmlFor="certificate-number" className="mb-1.5 block text-xs font-bold text-slate-800">Certificate number</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="certificate-number"
              type="text"
              required
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Enter the certificate number"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-[#73111b] focus:bg-white focus:ring-1 focus:ring-[#73111b]"
            />
            <button type="submit" disabled={loading || !searchValue.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#73111b] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#5c0d15] disabled:cursor-not-allowed disabled:opacity-50">
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'Search certificate'}
            </button>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Certificate details appear only after you submit a certificate number.</p>
        </form>

        {/* Results remain empty until a visitor submits a search. */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {!hasSearched ? (
            <div className="py-12 text-center text-xs text-slate-500">Enter the number printed on a certificate to check its status.</div>
          ) : loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Checking the certificate number you submitted...</div>
          ) : error ? (
            <div className="p-8 text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Certificate Verification Failed</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            </div>
          ) : cert ? (
            <div>
              {/* Status Banner */}
              <div className={`p-4 text-center border-b ${
                cert.is_valid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center justify-center gap-2 font-bold text-xs">
                  {cert.is_valid ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <ShieldAlert className="h-4 w-4 text-rose-600" />}
                  <span>{cert.is_valid ? 'OFFICIALLY VERIFIED & AUTHENTIC CREDENTIAL' : 'CERTIFICATE REVOKED'}</span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient Name</span>
                    <h2 className="text-xl font-bold text-slate-900">{cert.recipient_name}</h2>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Grade</span>
                    <p className="text-2xl font-bold text-[#73111b]">{cert.final_grade}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-[#73111b] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium">Program of Study:</span>
                      <p className="font-bold text-slate-800 text-sm">{cert.course_name} ({cert.course_code})</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 text-[#73111b] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium">Issuing Institution:</span>
                      <p className="font-bold text-slate-800">Institute of Advanced Technology Ltd • {cert.branch_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-[#73111b] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium">Issue Date & Intake:</span>
                      <p className="font-bold text-slate-800">{cert.issue_date} • {cert.cohort_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-[#73111b] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-medium">Chief Examiner & Signatory:</span>
                      <p className="font-bold text-slate-800">{cert.signatory_name} ({cert.signatory_title})</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Validation */}
                {cert.qr_code_svg && (
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificate Serial</span>
                      <p className="font-mono font-bold text-slate-800 text-xs">{cert.certificate_number}</p>
                      <p className="font-mono text-[11px] text-[#73111b] font-semibold mt-0.5">Verification Code: {cert.verification_code}</p>
                    </div>
                    <div
                      className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0"
                      dangerouslySetInnerHTML={{ __html: cert.qr_code_svg }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[11px] text-slate-400">
            Powered by Institute of Advanced Technology Ltd Digital Credentials Engine
          </p>
        </div>
      </div>
    </div>
  );
};

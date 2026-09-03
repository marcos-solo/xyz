import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { IatLogo } from '../../../components/common/IatLogo';
import api from '../../../api/client';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('superadmin@apexlms.test');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#fff1f2] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#ffe4e6] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* IAT Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-200 mb-3">
            <IatLogo size="md" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Enterprise Learning Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Multi-Branch Academic & Operations Portal</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@iat.ac.ke"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#73111b] focus:ring-1 focus:ring-[#73111b] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#73111b] focus:ring-1 focus:ring-[#73111b] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-white font-bold text-xs shadow-md shadow-[#73111b]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to IAT Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick demo switchers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Demonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ceo@apexlms.test')}
                className="col-span-2 p-2.5 rounded-xl bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black text-[#73111b]">👑 Chief Executive Officer (CEO)</p>
                  <p className="text-[10px] text-slate-600 font-medium">ceo@iat.ac.ke • Multi-Branch Global Oversight</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#73111b] text-white text-[10px] font-bold">All Branches</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@apexlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#fff1f2] border border-slate-200 hover:border-[#fecdd3] text-left transition"
              >
                <p className="text-[11px] font-bold text-[#73111b]">Super Admin</p>
                <p className="text-[10px] text-slate-500 truncate">superadmin@iat.ac.ke</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bm.embu@apexlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#fff1f2] border border-slate-200 hover:border-[#fecdd3] text-left transition"
              >
                <p className="text-[11px] font-bold text-[#73111b]">Branch Manager</p>
                <p className="text-[10px] text-slate-500 truncate">bm.embu@iat.ac.ke</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('trainer.nairobi@apexlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition"
              >
                <p className="text-[11px] font-bold text-emerald-700">Lead Trainer</p>
                <p className="text-[10px] text-slate-500 truncate">trainer.nairobi@...</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('student.john@apexlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition"
              >
                <p className="text-[11px] font-bold text-amber-700">Student (John)</p>
                <p className="text-[10px] text-slate-500 truncate">student.john@...</p>
              </button>
            </div>
          </div>
        </div>

        {/* Public Certificate Verification Link */}
        <div className="text-center mt-6">
          <a
            href="/verify/IAT-CCNA-98234"
            className="text-xs text-slate-600 hover:text-[#73111b] font-semibold transition inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-[#73111b]" />
            <span>Verify Student Certificate Authenticity</span>
          </a>
        </div>
      </div>
    </div>
  );
};

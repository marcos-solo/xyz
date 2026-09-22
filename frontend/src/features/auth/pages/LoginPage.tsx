import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { IatLogo } from '../../../components/common/IatLogo';
import api from '../../../api/client';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  Globe,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('superadmin@iatlms.test');
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
        const loggedInUser = res.data.data.user;
        login(res.data.data.token, loggedInUser);
        navigate(loggedInUser.roles?.includes('Admissions Officer') ? '/enrollments' : '/dashboard');
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-[1340px] lg:grid lg:grid-cols-[1.38fr_1fr] min-h-[760px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Left Side: Authentic ACCA Red Flyer-Faithful Code Design */}
        <div className="hidden lg:flex relative flex-col justify-between bg-[#cc0015] text-white overflow-hidden select-none">
          {/* Subtle geometric background curve */}
          <div className="absolute top-0 right-0 w-[55%] h-full bg-[#bd0012] rounded-l-[160px] pointer-events-none opacity-40" />

          {/* Top Brand Bar */}
          <div className="flex items-center justify-between p-6 xl:p-8 pb-3 relative z-10">
            {/* Left: IAT Logo Card */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-md flex items-center gap-3">
              <img
                src="/iat-logo.png"
                alt="Institute of Advanced Technology"
                className="h-8 w-auto object-contain"
              />
              <div className="border-l border-slate-200 pl-2.5 text-left">
                <p className="text-[11px] font-black text-[#73111b] uppercase tracking-wider leading-tight">
                  Institute of Advanced Technology
                </p>
                <p className="text-[9px] text-slate-500 font-semibold tracking-wide">Ltd</p>
              </div>
            </div>

            {/* Right: Think Ahead ACCA Badge */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-md flex items-center gap-2">
              <span className="text-slate-900 font-bold text-xs tracking-tight">Think Ahead</span>
              <span className="bg-[#cc0015] text-white font-black text-xs px-2 py-0.5 rounded tracking-wider">
                ACCA
              </span>
            </div>
          </div>

          {/* Middle Hero: Headline + Circular Student Frame + Speech Bubble */}
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 items-center px-6 xl:px-8 py-2 relative z-10 my-auto">
            {/* Left: Bold Typography */}
            <div className="space-y-3.5 pr-2">
              <h2 className="text-2xl xl:text-3xl font-black text-white uppercase tracking-tight leading-[1.12]">
                ARE YOU READY<br />
                TO ELEVATE<br />
                YOUR CAREER<br />
                IN ACCOUNTING<br />
                AND FINANCE?
              </h2>
              <p className="text-xs text-white/95 leading-relaxed font-normal">
                All industries need forward thinking finance professionals. Whether you are targeting a role in the banking industry or finance firms, a finance and accountancy qualification course will help you get there!
              </p>
            </div>

            {/* Right: Circular Photo Frame with ENROL NOW! badge and floating dots */}
            <div className="relative flex justify-center items-center py-2">
              {/* Floating Decorative Dots from flyer */}
              <span className="absolute -top-1 right-6 w-3 h-3 rounded-full bg-white shadow-sm" />
              <span className="absolute top-1/3 -left-3 w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              <span className="absolute -bottom-2 right-12 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />

              {/* Circular Student Portrait */}
              <div className="relative w-48 h-48 xl:w-56 xl:h-56 rounded-full border-[5px] border-white shadow-2xl overflow-hidden bg-white">
                <img
                  src="/acca-student.jpg"
                  alt="IAT ACCA Student"
                  className="w-full h-full object-cover object-top scale-105"
                />
              </div>

              {/* Speech Bubble "ENROL NOW!" */}
              <a
                href="/register"
                className="absolute -bottom-2 left-4 xl:left-6 z-20 bg-white text-[#cc0015] hover:bg-rose-50 hover:scale-105 transition-transform duration-200 px-4 py-2.5 rounded-full shadow-xl border-2 border-white flex flex-col items-center justify-center leading-none"
              >
                <span className="text-xs font-black tracking-wider text-[#cc0015]">ENROL</span>
                <span className="text-sm font-black tracking-tight text-[#cc0015] mt-0.5">NOW!</span>
              </a>
            </div>
          </div>

          {/* Bottom: The 3 Curriculum Columns */}
          <div className="px-6 xl:px-8 pt-3 pb-4 relative z-10">
            <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-white/25 text-white">
              {/* Column 1: APPLIED KNOWLEDGE */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4 className="text-[11px] xl:text-xs font-black uppercase tracking-wider leading-tight">
                    APPLIED KNOWLEDGE
                  </h4>
                </div>
                <ul className="text-[10px] xl:text-[11px] text-white/95 space-y-1 pl-6 list-disc font-medium">
                  <li>Business & Technology</li>
                  <li>Financial Accounting</li>
                  <li>Management Accounting</li>
                </ul>
              </div>

              {/* Column 2: APPLIED SKILLS */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4 className="text-[11px] xl:text-xs font-black uppercase tracking-wider leading-tight">
                    APPLIED SKILLS
                  </h4>
                </div>
                <ul className="text-[10px] xl:text-[11px] text-white/95 space-y-0.5 pl-6 list-disc font-medium">
                  <li>Taxation</li>
                  <li>Performance Management</li>
                  <li>Audit & Assurance</li>
                  <li>Corporate & Business Law</li>
                  <li>Financial Reporting</li>
                  <li>Financial Management</li>
                </ul>
              </div>

              {/* Column 3: STRATEGIC PROFESSIONAL */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h4 className="text-[11px] xl:text-xs font-black uppercase tracking-wider leading-tight">
                    STRATEGIC PROFESSIONAL
                  </h4>
                </div>
                <ul className="text-[10px] xl:text-[11px] text-white/95 space-y-0.5 pl-6 list-disc font-medium">
                  <li>Strategic Leader</li>
                  <li>Strategic Business Reporting</li>
                  <li className="list-none -ml-6 pt-1 font-bold text-[10px] text-amber-200">
                    Options (Pick 2):
                  </li>
                  <ul className="pl-3 list-disc space-y-0.5 text-[9.5px] xl:text-[10px] text-white/90">
                    <li>Advanced Audit & Assurance</li>
                    <li>Advanced Financial Management</li>
                    <li>Advanced Performance Management</li>
                    <li>Advanced Taxation</li>
                  </ul>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom White Contact Strip */}
          <div className="bg-white py-3 px-6 xl:px-8 flex items-center justify-between text-slate-800 border-t border-slate-200 relative z-10">
            <a
              href="tel:0723819257"
              className="hover:text-[#cc0015] transition-colors flex items-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-[#cc0015]">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-800 group-hover:text-[#cc0015] text-xs font-extrabold tracking-tight">0723819257</span>
            </a>

            <a
              href="mailto:registrar@iat.ac.ke"
              className="hover:text-[#cc0015] transition-colors flex items-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-[#cc0015]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-800 group-hover:text-[#cc0015] text-xs font-extrabold tracking-tight">registrar@iat.ac.ke</span>
            </a>

            <a
              href="https://www.iat.ac.ke"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#cc0015] transition-colors flex items-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-[#cc0015]">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-800 group-hover:text-[#cc0015] text-xs font-extrabold tracking-tight">www.iat.ac.ke</span>
            </a>
          </div>
        </div>


        <div className="flex flex-col justify-center p-4 sm:p-8 lg:p-12">
        {/* IAT Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-200 mb-3">
            <IatLogo size="md" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Enterprise Learning Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Multi-Branch Academic & Operations Portal</p>
        </div>

        {/* Login card */}
        <div>
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

          <p className="mt-5 text-center text-xs text-slate-500">
            New student?{' '}
            <a href="/register" className="font-bold text-[#73111b] hover:underline">
              Apply for admission
            </a>
          </p>

          {/* Quick demo switchers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Demonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ceo@iatlms.test')}
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
                onClick={() => handleQuickLogin('guest@iatlms.test')}
                className="col-span-2 p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <span>👁️</span>
                    <span>Guest Account (Read-Only Testing)</span>
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    guest@iatlms.test • View all users, records & student portal (no edits)
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-700 text-white text-[10px] font-bold">
                  Guest Mode
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@iatlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#fff1f2] border border-slate-200 hover:border-[#fecdd3] text-left transition"
              >
                <p className="text-[11px] font-bold text-[#73111b]">Super Admin</p>
                <p className="text-[10px] text-slate-500 truncate">superadmin@iat.ac.ke</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bm.embu@iatlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#fff1f2] border border-slate-200 hover:border-[#fecdd3] text-left transition"
              >
                <p className="text-[11px] font-bold text-[#73111b]">Branch Manager</p>
                <p className="text-[10px] text-slate-500 truncate">bm.embu@iat.ac.ke</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('trainer.nairobi@iatlms.test')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition"
              >
                <p className="text-[11px] font-bold text-emerald-700">Lead Trainer</p>
                <p className="text-[10px] text-slate-500 truncate">trainer.nairobi@...</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('student.john@iatlms.test')}
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
    </div>
  );
};

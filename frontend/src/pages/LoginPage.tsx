import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (u: string, p: string) => {
    setLoading(true);
    setError(null);
    try {
      await login(u, p);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-xl shadow-teal-600/25 mb-4 font-bold">
            <Cpu className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
            EduPulse AI
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Intelligent Student Performance Analysis & Early Intervention System
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] text-teal-800 font-medium italic shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
            <span>“Arrear vantha piragu kavalai pattu enna labam? Modhallaye therinja, pass aaga prepare pannalam!”</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dr.kavitha or arun.kumar"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Rapid Demo Login Quick Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
              One-Click Demo Personas
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('dr.kavitha', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 text-left text-xs transition-colors flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Dr. Kavitha Raman</div>
                    <div className="text-[10px] text-slate-500">Faculty & Department Head</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-teal-700 border border-slate-200 font-medium">
                  Teacher View
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('arun.kumar', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 text-left text-xs transition-colors flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div>
                    <div className="font-semibold text-slate-800">Arun Kumar</div>
                    <div className="text-[10px] text-slate-500">Flagged Student (Java Arrays Gap)</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-amber-700 border border-slate-200 font-medium">
                  Student View
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left text-xs transition-colors flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-800">System Administrator</div>
                    <div className="text-[10px] text-slate-500">Institutional Governance & Reset</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 font-medium">
                  Admin View
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500 font-medium">
          Designed for National Inter-College Hackathon • EduPulse AI
        </div>
      </div>
    </div>
  );
};

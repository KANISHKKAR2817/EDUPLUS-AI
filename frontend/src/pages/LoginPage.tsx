import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import {
  Cpu,
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  Activity,
  Layers
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Top right theme switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      {/* Futuristic Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-violet-500 text-white shadow-xl shadow-cyan-500/25 mb-4 font-bold border border-white/20">
            <Cpu className="h-8 w-8 animate-pulse" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              EDUPLUS AI
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
              3D GLASS v2.4
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Intelligent Student Performance Analysis & Early Intervention System
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[11px] text-cyan-700 dark:text-cyan-300 font-medium shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
            <span>AI Predictive Modeling • Auditable Risk • Continuous Interventions</span>
          </div>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="p-7 rounded-2xl glass-panel shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Rapid Demo Login Quick Buttons */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center">
              One-Click Hackathon Demo Personas
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('dr.kavitha', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-slate-100/70 hover:bg-cyan-500/10 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 hover:border-cyan-500/40 text-left text-xs transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Dr. Kavitha Raman</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Faculty & Department Head</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-black/30 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-white/10 font-semibold">
                  Teacher View
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('arun.kumar', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-slate-100/70 hover:bg-amber-500/10 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 text-left text-xs transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Arun Kumar</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Flagged Student (Java Arrays Gap)</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-black/30 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-white/10 font-semibold">
                  Student View
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'Password123!')}
                className="w-full p-2.5 rounded-xl bg-slate-100/70 hover:bg-violet-500/10 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 hover:border-violet-500/40 text-left text-xs transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">System Administrator</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Institutional Governance & Reset</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-black/30 text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-white/10 font-semibold">
                  Admin View
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          EDUPLUS AI • National Inter-College Hackathon Finalist
        </div>
      </div>
    </div>
  );
};

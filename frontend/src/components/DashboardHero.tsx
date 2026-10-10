import React from 'react';
import { Academic3DCore } from './Academic3DCore';
import { Sparkles, ArrowRight, ShieldCheck, Activity, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeroProps {
  totalStudents?: number;
  flaggedCount?: number;
  onExploreInsights?: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  totalStudents = 35,
  flaggedCount = 10,
  onExploreInsights,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-2xl transition-all duration-300">
      {/* Background ambient lighting blobs */}
      <div className="absolute top-0 right-1/4 -mt-12 w-80 h-80 rounded-full bg-blue-500/15 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mb-12 w-72 h-72 rounded-full bg-purple-500/15 dark:bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Vision, Heading, Subtitle & Action CTAs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Animated AI Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-cyan-950/40 border border-blue-200/60 dark:border-cyan-500/30 text-xs font-semibold text-blue-700 dark:text-cyan-300 shadow-2xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-cyan-400" />
            </span>
            <span className="tracking-tight">AI Early Intervention Engine Active • Continuous Monitoring</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Understand Every Student.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-cyan-400 dark:via-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
              Empower Every Future.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            Detect early academic vulnerabilities before semester examinations or arrears occur.
            Synthesizes attendance trends, continuous assessment marks, and practical submissions
            into explainable risk scores and targeted pedagogical interventions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onExploreInsights) {
                  onExploreInsights();
                } else {
                  const el = document.getElementById('student-cohort-table');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/20 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Student Insights</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => navigate('/risk-model')}
              className="px-5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all duration-200 flex items-center gap-2 hover:border-blue-400/50 dark:hover:border-cyan-400/50"
            >
              <Activity className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-400" />
              <span>View Risk Analysis</span>
            </button>
          </div>

          {/* Live Telemetry Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-white/5">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Anna University 2026 Framework
            </span>
            <span>•</span>
            <span className="font-mono">
              <strong className="text-slate-700 dark:text-slate-200 font-bold">{totalStudents}</strong> Students Tracked
            </span>
            <span>•</span>
            <span className="font-mono">
              <strong className="text-rose-600 dark:text-rose-400 font-bold">{flaggedCount}</strong> Flagged For Support
            </span>
          </div>
        </div>

        {/* Right Column: 3D Holographic Academic Intelligence Core */}
        <div className="lg:col-span-5 h-64 sm:h-72 w-full flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full border border-blue-400/20 dark:border-cyan-400/20 animate-spin" style={{ animationDuration: '30s' }} />
            <div className="w-48 h-48 rounded-full border border-dashed border-purple-400/20 dark:border-violet-400/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
          </div>
          <Academic3DCore className="h-full w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
};

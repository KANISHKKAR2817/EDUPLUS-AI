import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Network,
  Stethoscope,
  ClipboardList,
  Bot,
  FileSpreadsheet,
  Settings,
  BookOpen,
  FileText,
  Activity,
  Target,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const teacherNavItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/students', label: 'Student Analytics', icon: Users },
    { to: '/concept-weaknesses', label: 'Performance Insights', icon: Target },
    { to: '/risk-model', label: 'Risk Prediction', icon: Activity },
    { to: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
    { to: '/interventions', label: 'Early Interventions', icon: Stethoscope },
    { to: '/assessments', label: 'Assessments & Quizzes', icon: ClipboardList },
    { to: '/ai-tutor', label: 'AI Learning Tutor', icon: Bot },
    { to: '/reports', label: 'Reports & Audit', icon: FileSpreadsheet },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const studentNavItems = [
    { to: '/', label: 'Overview Hub', icon: LayoutDashboard },
    { to: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
    { to: '/my-interventions', label: 'Practice Tasks & Quizzes', icon: Stethoscope },
    { to: '/assignments', label: 'My Assignments', icon: FileText },
    { to: '/study-materials', label: 'Course Notes', icon: BookOpen },
    { to: '/ai-tutor', label: 'AI Study Assistant', icon: Bot },
    { to: '/risk-model', label: 'Risk Intelligence', icon: Activity },
  ];

  const navItems = role === 'student' ? studentNavItems : teacherNavItems;

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/80 dark:border-white/10 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      <div className="p-3 space-y-1">
        <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 px-3 py-2">
          {role === 'student' ? 'Student Workspace' : 'Academic Command Center'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-500/10 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-300 font-bold border-l-3 border-blue-600 dark:border-cyan-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 font-medium'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Glassmorphic Footer Support Card */}
      <div className="mt-auto p-3 border-t border-slate-200/60 dark:border-white/5">
        <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed shadow-inner">
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Decision-Support Only
          </div>
          Early multi-signal indicators guide faculty to formulate timely pedagogical support.
        </div>
      </div>
    </aside>
  );
};

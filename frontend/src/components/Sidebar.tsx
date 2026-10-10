import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Network,
  Target,
  Stethoscope,
  BookOpen,
  FileText,
  Bot,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  ClipboardList
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const teacherNavItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Student Cohort', icon: Users },
    { to: '/knowledge-graph', label: 'Academic Knowledge Graph', icon: Network },
    { to: '/concept-weaknesses', label: 'Concept Gap Matrix', icon: Target },
    { to: '/interventions', label: 'Targeted Interventions', icon: Stethoscope },
    { to: '/assessments', label: 'Assessments & Mapping', icon: ClipboardList },
    { to: '/assignments', label: 'Assignments & Grading', icon: FileText },
    { to: '/study-materials', label: 'Study-Material Analyzer', icon: BookOpen },
    { to: '/ai-tutor', label: 'AI Learning Tutor', icon: Bot },
    { to: '/risk-model', label: 'Global Risk Explainability', icon: HelpCircle },
    { to: '/reports', label: 'Reports & Audit Logs', icon: FileSpreadsheet },
    { to: '/settings', label: 'Configuration & Reset', icon: Settings },
  ];

  const studentNavItems = [
    { to: '/', label: 'My Learning Dashboard', icon: LayoutDashboard },
    { to: '/my-interventions', label: 'My Targeted Tasks', icon: Stethoscope },
    { to: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
    { to: '/study-materials', label: 'Course Materials', icon: BookOpen },
    { to: '/assignments', label: 'My Assignments', icon: FileText },
    { to: '/ai-tutor', label: 'AI Study Assistant', icon: Bot },
    { to: '/risk-model', label: 'How Risk Is Calculated', icon: HelpCircle },
  ];

  const navItems = role === 'student' ? studentNavItems : teacherNavItems;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white/90 backdrop-blur-md flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-3 py-1">
          {role === 'student' ? 'Student Workspace' : 'Academic Navigation'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border-l-4 border-teal-600 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Early Intervention Disclaimer Card at bottom of sidebar */}
      <div className="mt-auto p-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-teal-700">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            Decision-Support Only
          </div>
          <p className="leading-relaxed">
            EduPulse signals indicate potential learning difficulties to guide timely faculty support. They do not predict future outcomes with certainty.
          </p>
        </div>
      </div>
    </aside>
  );
};

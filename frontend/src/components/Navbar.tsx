import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LogOut,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Cpu
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, login } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const demoAccounts = [
    { username: 'dr.kavitha', role: 'Teacher', name: 'Dr. Kavitha Raman (Faculty)' },
    { username: 'arun.kumar', role: 'Student', name: 'Arun Kumar (Flagged Student)' },
    { username: 'deepa.s', role: 'Student', name: 'Deepa Sundaram (Top Student)' },
    { username: 'admin', role: 'Admin', name: 'System Administrator' },
  ];

  const handleQuickSwitch = async (username: string) => {
    setShowSwitcher(false);
    await login(username, 'Password123!');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
      {/* Brand & Tamil Early Intervention Slogan Banner */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20 font-bold">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 bg-clip-text text-transparent">
                EduPulse AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Hackathon MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Intelligent Student Performance & Early Intervention System
            </p>
          </div>
        </div>

        {/* Tamil core message badge */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-teal-800 bg-teal-50/90 border border-teal-200/90 rounded-full px-3.5 py-1 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span className="italic">
            “Arrear vantha piragu kavalai pattu enna labam? Modhallaye therinja, pass aaga prepare pannalam!”
          </span>
        </div>
      </div>

      {/* User Actions & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-sm"
          >
            <UserCheck className="h-3.5 w-3.5 text-teal-600" />
            <span className="hidden sm:inline">Switch Demo Role</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {showSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 mb-1 uppercase tracking-wider">
                ONE-CLICK DEMO ACCOUNTS
              </div>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => handleQuickSwitch(acc.username)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                    user?.username === acc.username
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{acc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                      {acc.role}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">@{acc.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current User Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs">
          {user?.role === 'teacher' ? (
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          ) : user?.role === 'admin' ? (
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-teal-600" />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{user?.full_name || user?.username}</span>
            <span className="text-[10px] text-slate-500 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors shadow-sm"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

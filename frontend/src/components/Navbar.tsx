import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  Cpu,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  LogOut,
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, login } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const demoAccounts = [
    { username: 'dr.kavitha', role: 'Teacher', name: 'Dr. Kavitha Raman (Faculty)' },
    { username: 'arun.kumar', role: 'Student', name: 'Arun Kumar (Flagged Student)' },
    { username: 'deepa.s', role: 'Student', name: 'Deepa Sundaram (Top Student)' },
    { username: 'admin', role: 'Admin', name: 'System Administrator' },
  ];

  const notifications = [
    { id: 1, title: 'New Risk Alert', desc: 'Arun Kumar flagged for Java Arrays (Score: 63.7)', time: '10m ago', urgent: true },
    { id: 2, title: 'Intervention Completed', desc: 'Follow-up quiz verified +100% improvement', time: '1h ago', urgent: false },
    { id: 3, title: 'Continuous Assessment Sync', desc: 'UT1 & UT2 synced for CSE Sem 4', time: '3h ago', urgent: false },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSwitch = async (username: string) => {
    setShowSwitcher(false);
    await login(username, 'Password123!');
  };

  return (
    <header className="h-16 sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left: Brand Identity & Academic Period */}
      <div className="flex items-center gap-4 lg:gap-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 dark:from-cyan-500 dark:via-blue-600 dark:to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 dark:shadow-cyan-500/25 font-bold">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 dark:from-cyan-400 dark:via-blue-300 dark:to-violet-300 bg-clip-text text-transparent">
                EDUPLUS AI
              </span>
              <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-cyan-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-800">
                National MVP
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 hidden xl:block">
              Student Performance & Early Intervention Command Center
            </p>
          </div>
        </div>

        {/* Academic Period Selector Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
          <span className="font-medium text-[11px]">2025-2026 • Spring Term</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, roll number, course concept..."
            className="w-full rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 pl-9 pr-12 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-blue-500/30 dark:focus:ring-cyan-400/30 transition-all shadow-inner"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Theme Switcher, Notifications & User Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Dynamic 3-Way Theme Switcher */}
        <ThemeSwitcher />

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-2 z-50 shadow-2xl animate-in fade-in">
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Active Alerts</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-semibold">
                  3 New
                </span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs space-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {n.urgent ? (
                          <AlertTriangle className="h-3 w-3 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        )}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Demo Persona Switcher */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Role</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showSwitcher && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-2 z-50 shadow-2xl animate-in fade-in">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/10 mb-1 uppercase tracking-wider">
                Instant Persona Switch
              </div>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => handleQuickSwitch(acc.username)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                    user?.username === acc.username
                      ? 'bg-blue-500/10 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{acc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
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
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-xs">
          {user?.role === 'teacher' ? (
            <GraduationCap className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
          ) : user?.role === 'admin' ? (
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-violet-400" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
            {user?.full_name?.split(' ')[0] || user?.username}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-2xs"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

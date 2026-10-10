import React, { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export const ThemeSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { id: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dark', label: 'Dark Command Center', icon: Moon },
    { id: 'light', label: 'Light Academic Mode', icon: Sun },
    { id: 'system', label: 'System Preference', icon: Laptop },
  ];

  const CurrentIcon = theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  if (compact) {
    // Segmented icon pill for compact views
    return (
      <div className="flex items-center p-0.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-white/10 shadow-inner">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              title={opt.label}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700/90 text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Current theme: ${theme} (${resolvedTheme})`}
        aria-label="Toggle visual theme"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all duration-200 hover:border-blue-400/50 dark:hover:border-cyan-400/50 hover:shadow-glow-blue"
      >
        <span className="relative flex items-center justify-center h-4 w-4">
          <CurrentIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              resolvedTheme === 'dark' ? 'text-cyan-400 rotate-0' : 'text-amber-500 rotate-90'
            }`}
          />
        </span>
        <span className="capitalize text-[11px] hidden sm:inline">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel p-1.5 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/10 mb-1">
            Visual Theme
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-500/10 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isSelected ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3 w-3 text-blue-600 dark:text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

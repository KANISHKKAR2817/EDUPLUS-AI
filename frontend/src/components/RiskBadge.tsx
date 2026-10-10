import React from 'react';

interface RiskBadgeProps {
  band: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ band, score, size = 'md' }) => {
  let colors = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 font-semibold';
  let dotColor = 'bg-emerald-500 dark:bg-emerald-400';
  let pulse = false;

  if (band === 'Moderate concern') {
    colors = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 font-semibold';
    dotColor = 'bg-amber-500 dark:bg-amber-400';
  } else if (band === 'High concern') {
    colors = 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30 font-semibold';
    dotColor = 'bg-orange-500 dark:bg-orange-400';
  } else if (band === 'Urgent review recommended') {
    colors = 'bg-rose-50 dark:bg-rose-950/45 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 font-bold shadow-xs dark:shadow-[0_0_12px_rgba(244,63,94,0.2)]';
    dotColor = 'bg-rose-600 dark:bg-rose-400';
    pulse = true;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-xs transition-all ${colors} ${sizeClasses[size]}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{band}</span>
      {score !== undefined && (
        <span className="opacity-90 font-mono text-[11px] bg-white/70 dark:bg-black/30 border border-current/20 px-1.5 py-0.5 rounded-md">
          {score}
        </span>
      )}
    </span>
  );
};

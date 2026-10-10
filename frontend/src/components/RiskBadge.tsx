import React from 'react';

interface RiskBadgeProps {
  band: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ band, score, size = 'md' }) => {
  let colors = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
  let dotColor = 'bg-emerald-500';
  let pulse = false;

  if (band === 'Moderate concern') {
    colors = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
    dotColor = 'bg-amber-500';
  } else if (band === 'High concern') {
    colors = 'bg-orange-50 text-orange-800 border-orange-300 font-semibold';
    dotColor = 'bg-orange-500';
  } else if (band === 'Urgent review recommended') {
    colors = 'bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-sm';
    dotColor = 'bg-rose-600';
    pulse = true;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${colors} ${sizeClasses[size]}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{band}</span>
      {score !== undefined && (
        <span className="opacity-90 font-mono text-[11px] bg-white/70 border border-current/20 px-1.5 py-0.2 rounded-md">
          {score}
        </span>
      )}
    </span>
  );
};

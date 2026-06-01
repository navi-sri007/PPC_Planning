import React from 'react';

export default function ProgressBar({ progress }) {
  const percent = Math.min(100, Math.max(0, Math.round(progress * 10) / 10));

  // Determine bar color based on progress
  let barColor = 'bg-primary-550';
  if (percent >= 100) {
    barColor = 'bg-emerald-550 dark:bg-emerald-600';
  } else if (percent > 0) {
    barColor = 'bg-blue-500 dark:bg-blue-600';
  } else {
    barColor = 'bg-slate-300 dark:bg-slate-700';
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 bg-secondary rounded-full h-4 overflow-hidden border border-border shadow-inner">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${percent}%` }}
        >
          {percent >= 15 && (
            <span className="text-[10px] font-bold text-white tracking-wider leading-none">
              {percent}%
            </span>
          )}
        </div>
      </div>
      {percent < 15 && (
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap min-w-[2.5rem] text-right">
          {percent}%
        </span>
      )}
    </div>
  );
}

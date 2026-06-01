import React from 'react';

export function Spinner({ className = "w-6 h-6", text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div className={`${className} border-2 border-primary-550 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full animate-pulse border border-border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/40 border-b border-border py-4 px-6 flex justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded w-24" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="py-5 px-6 flex justify-between gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 bg-muted rounded ${
                  colIndex === 0 ? 'w-32' : colIndex === cols - 1 ? 'w-16' : 'w-24'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse border border-border rounded-xl p-5 bg-card flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-muted" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
      <div className="flex justify-between items-center mt-2 border-t border-border pt-4">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
    </div>
  );
}

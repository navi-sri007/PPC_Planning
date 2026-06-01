import React from 'react';
import { Cpu, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { JOB_THEMES } from '../../utils/constants';

export default function ResponseCard({ data, title }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  // Detect structure type
  const isMachineData = data[0].hasOwnProperty('machine_name');
  const isJobData = data[0].hasOwnProperty('job_name');

  return (
    <div className="mt-3 border border-border/80 rounded-2xl bg-card shadow-sm overflow-hidden text-left max-w-full">
      {/* Header */}
      <div className="bg-secondary/40 border-b px-4 py-3 flex justify-between items-center">
        <span className="text-xs font-bold text-foreground font-sans tracking-wide">
          {title || (isMachineData ? 'Available Equipment' : 'Job Status Inventory')}
        </span>
        <span className="bg-primary-550/15 text-primary-550 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-primary-950/40 dark:text-primary-300">
          {data.length} item(s) found
        </span>
      </div>

      {/* Grid List */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
        {isMachineData && data.map((mac) => (
          <div key={mac.machine_id} className="border border-border/80 p-3 rounded-xl bg-secondary/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-cyan-50 border border-cyan-150 p-2 rounded-lg text-cyan-700 dark:bg-cyan-950/20 dark:border-cyan-900/30 dark:text-cyan-400">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-foreground leading-snug">
                  {mac.machine_name}
                </h5>
                <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                  Type: {mac.machine_type} • M-{mac.machine_id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-foreground">
                {mac.efficiency?.toLocaleString()}
              </span>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                units/day
              </p>
            </div>
          </div>
        ))}

        {isJobData && data.map((job) => {
          const theme = JOB_THEMES[job.job_name?.toLowerCase()] || JOB_THEMES.default;
          const JobIcon = theme.icon;
          
          // Check if it's near-due
          const isNearDue = job.hasOwnProperty('days_remaining');

          return (
            <div key={job.job_id} className="border border-border/80 p-3 rounded-xl bg-secondary/20 flex flex-col gap-2.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${theme.badgeClass.split(' ')[0]}`}>
                    <JobIcon className={`w-3.5 h-3.5 ${theme.textClass}`} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-foreground capitalize leading-snug">
                      {job.job_name}
                    </h5>
                    <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                      Job ID: J-{job.job_id}
                    </p>
                  </div>
                </div>
                {isNearDue && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 leading-none ${
                    job.days_remaining <= 1
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {job.days_remaining} day(s) left
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Calendar className="w-3.5 h-3.5 text-primary-550" />
                  {formatDate(job.due_date)}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin-slow text-primary-550" />
                  {Math.round(job.completion_percentage || job.progress || 0)}% Complete
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

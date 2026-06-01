import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { formatDate, isOverdue, isDueSoon } from '../../utils/dateFormatter';
import { JOB_THEMES } from '../../utils/constants';
import ProgressBar from './ProgressBar';
import { CheckCircle2, Clock, Loader2, Calendar, LayoutDashboard } from 'lucide-react';
import { TableSkeleton } from '../Common/LoadingSpinner';

export default function DashboardTable() {
  const { jobs, isLoading, setSelectedJob } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground text-left">Production Status</h3>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground text-left flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary-550" />
            Active Production Queue
          </h2>
          <p className="text-xs text-muted-foreground text-left">
            Real-time status of scheduled jobs and assigned assembly lines
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 bg-card flex flex-col items-center justify-center text-center gap-3">
          <div className="p-3 bg-secondary rounded-full text-muted-foreground">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">No Active Jobs</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              There are currently no active jobs in the system. Go to the Admin panel to create a new production run.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Name</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Machines</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Due Date</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => {
                  const jobNameLower = job.job_name.toLowerCase();
                  const theme = JOB_THEMES[jobNameLower] || JOB_THEMES.default;
                  const Icon = theme.icon;

                  // Compute due date badge colors
                  const overdue = isOverdue(job.delivery_date) && job.status !== 'completed';
                  const dueSoon = isDueSoon(job.delivery_date) && job.status !== 'completed';
                  
                  let dateClass = 'text-foreground';
                  let dateBadgeBg = 'bg-secondary/50 border-border dark:bg-slate-900/30';
                  if (overdue) {
                    dateClass = 'text-red-600 dark:text-red-400 font-bold';
                    dateBadgeBg = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
                  } else if (dueSoon) {
                    dateClass = 'text-amber-600 dark:text-amber-400 font-semibold';
                    dateBadgeBg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
                  }

                  // Split machines list
                  const machinePills = job.assigned_machine
                    ? job.assigned_machine.split(',').map(m => m.trim())
                    : [];

                  return (
                    <tr
                      key={job.job_id}
                      onClick={() => setSelectedJob(job)}
                      className="hover:bg-secondary/30 transition-all duration-200 cursor-pointer"
                    >
                      {/* Job name with Icon */}
                      <td className="py-4 px-6 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${theme.badgeClass.split(' ')[0]}`}>
                            <Icon className={`w-4 h-4 ${theme.textClass}`} />
                          </div>
                          <span className="capitalize">{job.job_name}</span>
                        </div>
                      </td>

                      {/* Comma separated badges */}
                      <td className="py-4 px-6">
                        {machinePills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {machinePills.map((machine, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                              >
                                {machine}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None assigned</span>
                        )}
                      </td>

                      {/* Progress bar */}
                      <td className="py-4 px-6 min-w-[200px]">
                        <ProgressBar progress={job.progress} />
                      </td>

                      {/* Delivery Due date */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md border text-xs font-mono inline-flex items-center gap-1.5 ${dateBadgeBg} ${dateClass}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(job.delivery_date)}
                        </span>
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-6">
                        {job.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : job.status === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 pulsing-indicator">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

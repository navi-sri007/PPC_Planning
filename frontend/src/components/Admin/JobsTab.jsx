import React, { useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../context/AppContext";
import { JOB_THEMES } from "../../utils/constants";
import {
  Trash2,
  ShieldCheck,
  RefreshCw,
  Calendar,
  Briefcase,
  User,
} from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";
import JobForm from "./JobForm";
import { TableSkeleton } from "../Common/LoadingSpinner";

export default function JobsTab() {
  const { fetchJobs, deleteJob, fetchJobTemplates } = useApi();
  const { jobs, jobTemplates, loadingStates } = useApp(); // Remove jobClientMap

  useEffect(() => {
    fetchJobs();
    fetchJobTemplates();
  }, [fetchJobs, fetchJobTemplates]);

  const handleDelete = async (job, jobName) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${jobName} job? This will release all booked machine dates.`,
      )
    ) {
      await deleteJob(job.id);
    }
  };

  const getTemplateName = (templateId) => {
    const template = jobTemplates.find((t) => t.id === templateId);
    return template ? template.name : "Job";
  };

  // Get full display name - now using job.client_name directly
  const getDisplayName = (job) => {
    const baseName = getTemplateName(job.template_id);
    // Use client_name from the job object itself
    const clientName = job.client_name;
    return clientName ? `${baseName} - ${clientName}` : baseName;
  };

  const isLoading = loadingStates.jobs;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Jobs List Table (Left 2 Columns) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-foreground text-left">
              Active Production Runs
            </h3>
            <p className="text-xs text-muted-foreground text-left">
              Track manufacturing job orders, delivery due dates, and schedule
              routing statuses
            </p>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : jobs.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-12 bg-card text-center flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-secondary rounded-full text-muted-foreground">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                No Jobs Scheduled
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Enter template parameters in the scheduler form on the right to
                start production planning.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Job Name
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => {
                    const jobName = getTemplateName(job.template_id);
                    const displayName = getDisplayName(job);
                    const clientName = job.client_name || "-"; // Direct from job object
                    const jobNameLower = jobName.toLowerCase();
                    const theme =
                      JOB_THEMES[jobNameLower] || JOB_THEMES.default;
                    const JobIcon = theme.icon;

                    const isCompleted = job.completion_percentage >= 100;

                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-secondary/20 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-muted-foreground">
                          J-{job.id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 font-bold text-foreground">
                            <div
                              className={`p-1.5 rounded ${theme.badgeClass.split(" ")[0]}`}
                            >
                              <JobIcon
                                className={`w-3.5 h-3.5 ${theme.textClass}`}
                              />
                            </div>
                            <span className="capitalize">{displayName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {clientName !== "-" ? (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm text-foreground font-medium">
                                {clientName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs font-bold text-foreground">
                          {job.quantity?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 rounded bg-secondary text-xs font-mono inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary-550" />
                            {formatDate(job.due_date)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30">
                              <ShieldCheck className="w-3.5 h-3.5" />✅
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/25 dark:text-blue-400 dark:border-blue-900/30">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                              🔄 {Math.round(job.completion_percentage)}% In
                              Progress
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleDelete(job, jobName)}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete Job Schedule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Scheduler Form (Right Column) */}
      <div className="space-y-4">
        <JobForm />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { X, Calendar, Settings, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/dateFormatter';
import { JOB_THEMES } from '../../utils/constants';
import { Spinner } from '../Common/LoadingSpinner';

export default function JobDetailsModal() {
  const { selectedJob, setSelectedJob } = useApp();
  const { updateJobProgress } = useApi();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedJob) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Use direct api call since we want the detailed schedules
        const response = await fetch(`http://localhost:8000/api/jobs/${selectedJob.job_id || selectedJob.id}`);
        if (response.ok) {
          const data = await response.json();
          setJobDetails(data);
          setProgressVal(data.completion_percentage);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedJob]);

  if (!selectedJob) return null;

  const handleProgressChange = (e) => {
    setProgressVal(parseFloat(e.target.value));
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    const jobId = selectedJob.job_id || selectedJob.id;
    const success = await updateJobProgress(jobId, progressVal);
    if (success) {
      // Refresh local state
      setJobDetails(prev => ({
        ...prev,
        completion_percentage: progressVal,
        status: progressVal >= 100 ? 'completed' : progressVal > 0 ? 'in_progress' : 'pending'
      }));
    }
    setSaving(false);
  };

  const jobName = selectedJob.job_name || (jobDetails?.template_id ? 'Job' : '');
  const jobNameLower = jobName.toLowerCase();
  const theme = JOB_THEMES[jobNameLower] || JOB_THEMES.default;
  const ThemeIcon = theme.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel-heavy border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme.badgeClass.split(' ')[0]}`}>
              <ThemeIcon className={`w-5 h-5 ${theme.textClass}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground capitalize">
                {jobName} Details
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Job #{selectedJob.job_id || selectedJob.id} • Created {formatDate(selectedJob.created_at || jobDetails?.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedJob(null)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <Spinner text="Fetching job routing schedules..." />
          ) : jobDetails ? (
            <>
              {/* Job Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-secondary/40 border rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Quantity</span>
                  <span className="text-lg font-extrabold text-foreground">
                    {jobDetails.quantity?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="bg-secondary/40 border rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Due Date</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-primary-550" />
                    {formatDate(jobDetails.due_date)}
                  </span>
                </div>
                <div className="bg-secondary/40 border rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Current Status</span>
                  <span className="text-sm font-bold capitalize mt-0.5 flex items-center gap-1">
                    {jobDetails.status === 'completed' && <span className="text-emerald-550">✅ Completed</span>}
                    {jobDetails.status === 'in_progress' && <span className="text-blue-500 animate-pulse">🔄 In Progress</span>}
                    {jobDetails.status === 'pending' && <span className="text-slate-500">⏱️ Pending</span>}
                  </span>
                </div>
              </div>

              {/* Progress Slider (Interactive Update) */}
              <div className="border border-border rounded-xl p-5 bg-secondary/20">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary-550" />
                  Adjust Job Completion Progress
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressVal}
                    onChange={handleProgressChange}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary-550"
                  />
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="px-3 py-1.5 rounded-lg border font-mono text-sm bg-card text-foreground font-bold min-w-[3.5rem] text-center">
                      {progressVal}%
                    </span>
                    <button
                      onClick={handleSaveProgress}
                      disabled={saving || progressVal === jobDetails.completion_percentage}
                      className="px-4 py-1.5 bg-primary-550 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {saving ? 'Saving...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline Steps (Route details) */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary-550 animate-spin-slow" />
                  Manufacturing Routing Sequences
                </h4>
                
                {jobDetails.schedule && jobDetails.schedule.length > 0 ? (
                  <div className="relative border-l-2 border-border pl-6 ml-3 space-y-6 py-2">
                    {jobDetails.schedule.map((step, idx) => {
                      const isStepCompleted = step.completed || jobDetails.status === 'completed';
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Dot marker */}
                          <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isStepCompleted
                              ? 'bg-emerald-550 border-emerald-550 text-white dark:bg-emerald-600 dark:border-emerald-600'
                              : 'bg-card border-slate-300 text-muted-foreground'
                          }`}>
                            {isStepCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-secondary/35 rounded-xl border border-border/80">
                            <div>
                              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                                <span>Step {step.process_step}: Process Booking</span>
                                {isStepCompleted && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono dark:bg-emerald-950/30 dark:text-emerald-400">
                                    Done
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Assigned to <span className="font-bold text-foreground">{step.machine_name}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground font-mono bg-card px-2.5 py-1 border rounded">
                              <Calendar className="w-3.5 h-3.5 text-primary-550 mr-1.5" />
                              {formatDate(step.assigned_date)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No schedules defined for this job run.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Failed to load detailed job data.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-secondary/10 flex justify-end">
          <button
            onClick={() => setSelectedJob(null)}
            className="px-5 py-2 bg-secondary border border-border text-foreground font-semibold rounded-xl text-sm hover:bg-secondary-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

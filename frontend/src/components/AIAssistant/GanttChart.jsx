import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Calendar, Layout, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { formatShortDate } from '../../utils/dateFormatter';
import { JOB_THEMES } from '../../utils/constants';

export default function GanttChart() {
  const { visualization, jobs, jobTemplates, setSelectedJob } = useApp();
  const [cellWidth, setCellWidth] = useState(120); // Zoom scale width

  if (!visualization || visualization.type !== 'gantt') return null;

  const { machines, dates, schedule_data } = visualization;

  const handleZoomIn = () => setCellWidth(prev => Math.min(200, prev + 20));
  const handleZoomOut = () => setCellWidth(prev => Math.max(90, prev - 20));
  const handleResetZoom = () => setCellWidth(120);

  // Helper to find job template name
  const getTemplateName = (templateId) => {
    const template = jobTemplates.find(t => t.id === templateId);
    return template ? template.name : '';
  };

  // Click handler to select and open details modal
  const handleCellClick = (jobInfoStr) => {
    // jobInfoStr is "brakes (Step 1)"
    const match = jobInfoStr.match(/^([a-zA-Z0-9_-]+)\s+\(Step\s+(\d+)\)$/i);
    if (!match) return;

    const templateName = match[1].toLowerCase();
    
    // Find job that matches template
    const foundJob = jobs.find(j => {
      const name = getTemplateName(j.template_id);
      return name.toLowerCase() === templateName;
    });

    if (foundJob) {
      // Map job schema to dashboard schema for modal compatibility
      setSelectedJob({
        job_id: foundJob.id,
        job_name: templateName,
        assigned_machine: foundJob.schedule?.map(s => s.machine_name).join(', ') || '',
        progress: foundJob.completion_percentage,
        delivery_date: foundJob.due_date,
        status: foundJob.status,
        created_at: foundJob.created_at
      });
    }
  };

  const getJobTheme = (jobInfoStr) => {
    const match = jobInfoStr.match(/^([a-zA-Z0-9_-]+)/i);
    if (!match) return JOB_THEMES.default;
    const name = match[1].toLowerCase();
    return JOB_THEMES[name] || JOB_THEMES.default;
  };

  return (
    <div className="border border-border/80 rounded-2xl bg-card shadow-sm p-4 w-full flex flex-col gap-4 text-left">
      {/* Chart Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border/60">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layout className="w-4.5 h-4.5 text-primary-550" />
            Interactive Production Scheduler Gantt Matrix
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Visual tracking of booked dates and routing slots across all assembly machinery
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleZoomOut}
            disabled={cellWidth <= 90}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono font-bold text-muted-foreground w-12 text-center select-none bg-secondary/40 py-1 border rounded-md">
            {Math.round((cellWidth / 120) * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={cellWidth >= 200}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-border/70 shadow-inner bg-secondary/5">
        <div
          className="gantt-grid min-w-full divide-y divide-border/60"
          style={{
            gridTemplateColumns: `180px repeat(${dates.length}, minmax(${cellWidth}px, 1fr))`,
            width: `calc(180px + ${dates.length * cellWidth}px)`
          }}
        >
          {/* Header row (Sticky Dates) */}
          <div className="flex items-center bg-secondary/70 border-b py-3 px-4 font-bold text-xs text-muted-foreground font-sans sticky left-0 z-20 border-r border-border/80 shadow-[2px_0_5px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.15)] uppercase tracking-wider">
            Machine Name
          </div>
          {dates.map((dateStr, idx) => (
            <div
              key={idx}
              className="bg-secondary/50 border-b border-r border-border/60 py-3 px-2 text-center font-bold font-mono text-xs text-foreground flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-[10px] text-muted-foreground font-sans uppercase">
                {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span>{formatShortDate(dateStr)}</span>
            </div>
          ))}

          {/* Machine rows */}
          {machines.map((machineName, macIdx) => {
            return (
              <React.Fragment key={macIdx}>
                {/* Sticky Left Machine Name */}
                <div className="flex items-center bg-card border-r border-border/80 font-bold text-sm text-foreground py-4 px-4 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.12)]">
                  <div className="truncate">{machineName}</div>
                </div>

                {/* X-axis date cells */}
                {dates.map((dateStr, dateIdx) => {
                  const items = schedule_data[machineName]?.[dateStr] || [];
                  const hasItems = items.length > 0;

                  return (
                    <div
                      key={dateIdx}
                      className={`grid-cell-border p-2 flex items-center justify-center min-h-[52px] transition-colors relative group border-r border-border/40 last:border-r-0 ${
                        hasItems ? 'bg-secondary/15 hover:bg-secondary/35' : 'hover:bg-secondary/15'
                      }`}
                    >
                      {hasItems ? (
                        <div className="w-full flex flex-col gap-1 z-0">
                          {/* Render First item badge */}
                          {(() => {
                            const firstJob = items[0];
                            const theme = getJobTheme(firstJob);
                            const badgeTheme = theme.badgeClass.split(' ');
                            
                            return (
                              <button
                                onClick={() => handleCellClick(firstJob)}
                                className={`w-full px-2 py-1.5 rounded-lg border text-[10px] font-bold text-center capitalize transition-transform hover:scale-105 active:scale-95 leading-tight truncate ${theme.badgeClass} ${theme.borderClass}`}
                                title={`Click to view job details for ${firstJob}`}
                              >
                                {firstJob}
                              </button>
                            );
                          })()}

                          {/* Extra jobs count badge */}
                          {items.length > 1 && (
                            <div className="group/tooltip relative w-full">
                              <span className="w-full block py-0.5 rounded text-[8px] font-extrabold text-center bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-350 cursor-help uppercase tracking-wide">
                                +{items.length - 1} More Job(s)
                              </span>
                              {/* Custom Hover tooltip showing other jobs */}
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 hidden group-hover/tooltip:block bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-[10px] shadow-lg leading-relaxed z-50">
                                <span className="font-bold text-slate-400 block border-b border-slate-800 pb-1 mb-1">
                                  All Scheduled Jobs:
                                </span>
                                <ul className="list-disc pl-3.5 space-y-1">
                                  {items.map((it, i) => (
                                    <li key={i} className="capitalize">{it}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-250 dark:bg-slate-800" />
                      )}

                      {/* Tooltip on empty hover */}
                      {!hasItems && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-28 hidden group-hover:block bg-slate-900 border border-slate-700 text-white rounded-lg py-1 px-2 text-[9px] text-center shadow-md leading-none z-30 font-mono">
                          Idle • Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Caption Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground border-t border-border/40 pt-3">
        <span className="font-bold uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-500 border border-blue-600" />
          <span>Brakes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-600" />
          <span>Wheels</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-600" />
          <span>Pedals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 border border-indigo-600" />
          <span>Seats</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-pink-500 border border-pink-650" />
          <span>Steering</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-250 dark:bg-slate-850" />
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Click any job badge to open the Details Modal</span>
        </div>
      </div>
    </div>
  );
}

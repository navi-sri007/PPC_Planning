import React from 'react';
import { Cpu, Briefcase, AlertTriangle, CalendarRange } from 'lucide-react';

export default function QuickActions({ onSelect, disabled }) {
  const actions = [
    {
      icon: Cpu,
      label: 'Available Machines',
      question: 'What are the available machines today?',
      color: 'border-cyan-200 text-cyan-700 bg-cyan-50/50 hover:bg-cyan-50 dark:border-cyan-900/35 dark:text-cyan-400 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/30'
    },
    {
      icon: Briefcase,
      label: 'Pending Jobs',
      question: 'What are the pending jobs?',
      color: 'border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/35 dark:text-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
    },
    {
      icon: AlertTriangle,
      label: 'Near Due Jobs',
      question: 'Which jobs are near their due date?',
      color: 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-50 dark:border-amber-900/35 dark:text-amber-400 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
    },
    {
      icon: CalendarRange,
      label: 'Schedule Timetable',
      question: 'Show me the schedule timetable',
      color: 'border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 dark:border-indigo-900/35 dark:text-indigo-400 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full my-4">
      {actions.map((act, index) => {
        const Icon = act.icon;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(act.question)}
            className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 hover:shadow disabled:opacity-50 disabled:translate-y-0 disabled:shadow-sm ${act.color}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-bold font-sans tracking-wide">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import { 
  ShieldAlert, 
  CircleDot, 
  Component, 
  Armchair, 
  Compass, 
  Wrench,
  Cpu,
  Layers,
  Flame,
  Boxes,
  Activity
} from 'lucide-react';

export const JOB_THEMES = {
  brakes: {
    name: 'Brakes',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-600 dark:text-blue-400',
    barClass: 'bg-blue-600',
    icon: ShieldAlert
  },
  wheels: {
    name: 'Wheels',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-700/10 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-400/20',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    barClass: 'bg-emerald-500',
    icon: CircleDot
  },
  pedals: {
    name: 'Pedals',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-700/10 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-400/20',
    borderClass: 'border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-600 dark:text-amber-400',
    barClass: 'bg-amber-500',
    icon: Component
  },
  seats: {
    name: 'Seats',
    color: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-400/20',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    barClass: 'bg-indigo-600',
    icon: Armchair
  },
  steering: {
    name: 'Steering',
    color: 'pink',
    badgeClass: 'bg-pink-50 text-pink-700 ring-pink-700/10 dark:bg-pink-900/30 dark:text-pink-400 dark:ring-pink-400/20',
    borderClass: 'border-pink-200 dark:border-pink-800',
    textClass: 'text-pink-600 dark:text-pink-400',
    barClass: 'bg-pink-500',
    icon: Compass
  },
  default: {
    name: 'Job',
    color: 'slate',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-700/10 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-400/20',
    borderClass: 'border-slate-200 dark:border-slate-800',
    textClass: 'text-slate-600 dark:text-slate-400',
    barClass: 'bg-slate-500',
    icon: Wrench
  }
};

export const MACHINE_TYPE_THEMES = {
  cutting: {
    name: 'Cutting',
    color: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-700 ring-cyan-700/10 dark:bg-cyan-900/30 dark:text-cyan-400 dark:ring-cyan-400/20',
    icon: Cpu
  },
  grinding: {
    name: 'Grinding',
    color: 'teal',
    badgeClass: 'bg-teal-50 text-teal-700 ring-teal-700/10 dark:bg-teal-900/30 dark:text-teal-400 dark:ring-teal-400/20',
    icon: Layers
  },
  melting: {
    name: 'Melting',
    color: 'red',
    badgeClass: 'bg-red-50 text-red-700 ring-red-700/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20',
    icon: Flame
  },
  molding: {
    name: 'Molding',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-400/20',
    icon: Boxes
  },
  assembling: {
    name: 'Assembling',
    color: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-400/20',
    icon: Activity
  },
  default: {
    name: 'Machine',
    color: 'slate',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-700/10 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-400/20',
    icon: Wrench
  }
};

export const QUICK_ACTIONS = [
  {
    icon: '🏭',
    label: 'Available Machines',
    question: 'What are the available machines today?'
  },
  {
    icon: '📋',
    label: 'Pending Jobs',
    question: 'What are the pending jobs?'
  },
  {
    icon: '⚠️',
    label: 'Near Due Jobs',
    question: 'Which jobs are near their due date?'
  },
  {
    icon: '📅',
    label: 'Schedule Timetable',
    question: 'Show me the schedule timetable'
  }
];

import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { darkMode, setDarkMode } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 text-white p-2 rounded-lg shadow-md pulsing-indicator">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground m-0 text-left flex items-center gap-2">
            PPC Control Center
          </h1>
          <p className="text-xs text-muted-foreground text-left font-mono">
            Manufacturing Production Planning & Control
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Grok Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-850">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Grok AI Agent Active</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}

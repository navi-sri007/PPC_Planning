import React from 'react';
import { LayoutDashboard, Settings, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Production Dashboard',
      icon: LayoutDashboard,
      description: 'Real-time jobs & machines'
    },
    {
      id: 'admin',
      label: 'Database Control',
      icon: Settings,
      description: 'Manage machines & jobs'
    },
    {
      id: 'ai',
      label: 'Grok AI Assistant',
      icon: MessageSquare,
      description: 'AI chat & Gantt planner'
    }
  ];

  return (
    <div className="w-full px-6 py-4 bg-background border-b border-border">
      <nav className="flex flex-col sm:flex-row gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-start gap-3.5 p-3 rounded-xl border text-left transition-all duration-300 w-full sm:w-64 ${
                isActive
                  ? 'bg-primary-550 border-primary-550 text-white shadow-lg shadow-primary-550/20 dark:shadow-primary-950/40'
                  : 'bg-card border-border hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-foreground'}`}>
                  {tab.label}
                </div>
                <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

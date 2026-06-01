import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Common/Navbar';
import TabNavigation from './components/Common/TabNavigation';
import DashboardTable from './components/Dashboard/DashboardTable';
import MachinesTab from './components/Admin/MachinesTab';
import JobsTab from './components/Admin/JobsTab';
import ChatInterface from './components/AIAssistant/ChatInterface';
import JobDetailsModal from './components/Dashboard/JobDetailsModal';

function AppContent() {
  const { activeTab, adminSubtab, setAdminSubtab } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-all duration-300">
      {/* Top Banner Navigation */}
      <Navbar />

      {/* Primary Tab Bar */}
      <TabNavigation />

      {/* Page Content panels */}
      <main className="flex-1 w-full pb-12">
        {activeTab === 'dashboard' && <DashboardTable />}

        {activeTab === 'admin' && (
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Sub-navigation tabs for database tables */}
            <div className="flex border-b border-border gap-2">
              <button
                onClick={() => setAdminSubtab('machines')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all leading-none ${
                  adminSubtab === 'machines'
                    ? 'border-primary-550 text-primary-550'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Machines Control
              </button>
              <button
                onClick={() => setAdminSubtab('jobs')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all leading-none ${
                  adminSubtab === 'jobs'
                    ? 'border-primary-550 text-primary-550'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Jobs Scheduler
              </button>
            </div>

            {/* Sub-panel render */}
            <div className="mt-4 animate-fade-in duration-200">
              {adminSubtab === 'machines' ? <MachinesTab /> : <JobsTab />}
            </div>
          </div>
        )}

        {activeTab === 'ai' && <ChatInterface />}
      </main>

      {/* Global Details Modal (trigged from cells or rows) */}
      <JobDetailsModal />

      {/* Toast Notification Container */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000,
          className: 'dark:bg-slate-900 dark:text-white dark:border-slate-800'
        }} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

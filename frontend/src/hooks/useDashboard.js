import { useEffect, useState } from 'react';
import { useApi } from './useApi';
import { useApp } from '../context/AppContext';

export const useDashboard = () => {
  const { fetchDashboard } = useApi();
  const { dashboardData, loadingStates, selectedJob, setSelectedJob } = useApp();

  useEffect(() => {
    // Initial fetch on mount
    fetchDashboard();

    // Set up auto-refresh interval of 30 seconds
    const interval = setInterval(() => {
      fetchDashboard(true); // pass true for silent polling refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    jobs: dashboardData,
    isLoading: loadingStates.dashboard,
    selectedJob,
    setSelectedJob,
    refetch: () => fetchDashboard(false)
  };
};

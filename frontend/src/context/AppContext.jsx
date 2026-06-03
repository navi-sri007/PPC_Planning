import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminSubtab, setAdminSubtab] = useState("machines");

  // Data States
  const [dashboardData, setDashboardData] = useState([]);
  const [machines, setMachines] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [jobTemplates, setJobTemplates] = useState([]);

  const [jobClientMap, setJobClientMap] = useState(() => {
    // Load from localStorage on initial load
    const saved = localStorage.getItem("jobClientMap");
    return saved ? JSON.parse(saved) : {};
  });

  // Loading States
  const [loadingStates, setLoadingStates] = useState({
    dashboard: false,
    machines: false,
    jobs: false,
    machineTypes: false,
    jobTemplates: false,
    ai: false,
    forms: false,
  });

  // Selected Job for details modal
  const [selectedJob, setSelectedJob] = useState(null);

  // AI Assistant Chat History
  const [aiMessages, setAiMessages] = useState([
    {
      id: "welcome",
      sender: "grok",
      text: "Hello! I am your AI Production Assistant. I can check available machines, list pending or near due jobs, or visualize our active schedules on a Gantt chart. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  // Visualization State (Gantt)
  const [visualization, setVisualization] = useState(null);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true; // Default to dark mode for rich aesthetics
  });

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Set loading state helper
  const setLoading = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        adminSubtab,
        setAdminSubtab,
        dashboardData,
        setDashboardData,
        machines,
        setMachines,
        jobs,
        setJobs,
        jobClientMap,
        setJobClientMap,
        machineTypes,
        setMachineTypes,
        jobTemplates,
        setJobTemplates,
        loadingStates,
        setLoading,
        selectedJob,
        setSelectedJob,
        aiMessages,
        setAiMessages,
        visualization,
        setVisualization,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;

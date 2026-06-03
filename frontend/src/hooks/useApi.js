import { useCallback } from "react";
import api from "../utils/api";
import { useApp } from "../context/AppContext";
import { toast } from "react-hot-toast";

export const useApi = () => {
  const {
    setDashboardData,
    setMachines,
    setJobs,
    setMachineTypes,
    setJobTemplates,
    setLoading,
    setVisualization,
  } = useApp();

  // Fetch Dashboard Data
  const fetchDashboard = useCallback(
    async (silent = false) => {
      if (!silent) setLoading("dashboard", true);
      try {
        const response = await api.get("/dashboard/");
        setDashboardData(response.data.jobs || []);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        if (!silent) setLoading("dashboard", false);
      }
    },
    [setDashboardData, setLoading],
  );

  // Fetch Machines List
  const fetchMachines = useCallback(
    async (silent = false) => {
      if (!silent) setLoading("machines", true);
      try {
        const response = await api.get("/machines/");
        setMachines(response.data || []);
      } catch (error) {
        console.error("Error fetching machines:", error);
      } finally {
        if (!silent) setLoading("machines", false);
      }
    },
    [setMachines, setLoading],
  );

  // Fetch Machine Types
  const fetchMachineTypes = useCallback(async () => {
    setLoading("machineTypes", true);
    try {
      const response = await api.get("/machines/types");
      setMachineTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching machine types:", error);
    } finally {
      setLoading("machineTypes", false);
    }
  }, [setMachineTypes, setLoading]);

  // Create Machine
  const createMachine = useCallback(
    async (data) => {
      setLoading("forms", true);
      try {
        const response = await api.post("/machines/", data);
        toast.success("Machine registered successfully!");
        fetchMachines(true);
        return response.data;
      } catch (error) {
        console.error("Error creating machine:", error);
        throw error;
      } finally {
        setLoading("forms", false);
      }
    },
    [fetchMachines, setLoading],
  );

  // Update Machine
  const updateMachine = useCallback(
    async (id, data) => {
      setLoading("forms", true);
      try {
        const response = await api.put(`/machines/${id}`, data);
        toast.success("Machine updated successfully!");
        fetchMachines(true);
        return response.data;
      } catch (error) {
        console.error("Error updating machine:", error);
        throw error;
      } finally {
        setLoading("forms", false);
      }
    },
    [fetchMachines, setLoading],
  );

  // Delete Machine
  const deleteMachine = useCallback(
    async (id) => {
      try {
        await api.delete(`/machines/${id}`);
        toast.success("Machine deleted successfully!");
        fetchMachines(true);
        return true;
      } catch (error) {
        console.error("Error deleting machine:", error);
        return false;
      }
    },
    [fetchMachines],
  );

  // In useApi.js, update the fetchJobs function:

  const fetchJobs = useCallback(
    async (silent = false) => {
      if (!silent) setLoading("jobs", true);
      try {
        const response = await api.get("/jobs/");
        console.log("Raw jobs response:", response.data);

        // Log each job's client name for debugging
        response.data.forEach((job) => {
          console.log(`Job ${job.id}: client_name = "${job.client_name}"`);
        });

        setJobs(response.data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        if (!silent) setLoading("jobs", false);
      }
    },
    [setJobs, setLoading],
  );

  // Fetch Job Templates
  const fetchJobTemplates = useCallback(async () => {
    setLoading("jobTemplates", true);
    try {
      const response = await api.get("/jobs/templates");
      setJobTemplates(response.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading("jobTemplates", false);
    }
  }, [setJobTemplates, setLoading]);

  // Create Job
  const createJob = useCallback(
    async (data) => {
      setLoading("forms", true);
      try {
        const response = await api.post("/jobs/", data);
        toast.success("Job created successfully!");
        fetchJobs(true);
        fetchDashboard(true);
        return response.data;
      } catch (error) {
        console.error("Error creating job:", error);
        throw error;
      } finally {
        setLoading("forms", false);
      }
    },
    [fetchJobs, fetchDashboard, setLoading],
  );

  // Delete Job
  const deleteJob = useCallback(
    async (id) => {
      try {
        await api.delete(`/jobs/${id}`);
        toast.success("Job deleted successfully!");
        fetchJobs(true);
        fetchDashboard(true);
        return true;
      } catch (error) {
        console.error("Error deleting job:", error);
        return false;
      }
    },
    [fetchJobs, fetchDashboard],
  );

  // Update Job Progress
  const updateJobProgress = useCallback(
    async (id, percentage) => {
      try {
        await api.put(`/jobs/${id}/progress?percentage=${percentage}`);
        toast.success(`Progress updated to ${percentage}%`);
        fetchJobs(true);
        fetchDashboard(true);
        return true;
      } catch (error) {
        console.error("Error updating progress:", error);
        return false;
      }
    },
    [fetchJobs, fetchDashboard],
  );

  // Query AI Assistant
  const askAI = useCallback(
    async (question) => {
      setLoading("ai", true);
      try {
        const response = await api.post("/ai/ask", { question });
        return response.data;
      } catch (error) {
        console.error("Error in AI query:", error);
        throw error;
      } finally {
        setLoading("ai", false);
      }
    },
    [setLoading],
  );

  return {
    fetchDashboard,
    fetchMachines,
    fetchMachineTypes,
    createMachine,
    updateMachine,
    deleteMachine,
    fetchJobs,
    fetchJobTemplates,
    createJob,
    deleteJob,
    updateJobProgress,
    askAI,
  };
};

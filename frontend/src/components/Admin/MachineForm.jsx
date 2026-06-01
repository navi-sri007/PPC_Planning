import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../context/AppContext";
import { PlusCircle } from "lucide-react";

export default function MachineForm() {
  const { createMachine, fetchMachineTypes } = useApi();
  const { machineTypes, loadingStates } = useApp();

  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMachineTypes();
  }, [fetchMachineTypes]);

  // If machineTypes changes and is loaded, set default select value
  useEffect(() => {
    if (machineTypes.length > 0 && !typeId) {
      setTypeId(machineTypes[0].id.toString());
    }
  }, [machineTypes, typeId]);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) {
      tempErrors.name = "Machine name is required";
    } else if (name.trim().length < 2) {
      tempErrors.name = "Machine name must be at least 2 characters";
    }

    if (!typeId) {
      tempErrors.typeId = "Machine type is required";
    }

    const effNum = parseInt(efficiency);
    if (!efficiency) {
      tempErrors.efficiency = "Efficiency is required";
    } else if (isNaN(effNum) || effNum <= 0) {
      tempErrors.efficiency = "Efficiency must be a positive integer";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMachine({
        name: name.trim(),
        machine_type_id: parseInt(typeId),
        efficiency: parseInt(efficiency),
        status: "idle",
      });

      // Clear Form on success
      setName("");
      setEfficiency("");
      setErrors({});
    } catch (err) {
      // Errors handled by Axios interceptor toast
    }
  };

  const isFormLoading = loadingStates.forms;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-left">
      <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-primary-550" />
        Register New Machine
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Machine Name */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Machine Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isFormLoading}
            placeholder="e.g., Cutter_Alpha"
            className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
              errors.name
                ? "border-red-500 ring-2 ring-red-500/10"
                : "border-border"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 font-semibold">
              {errors.name}
            </p>
          )}
        </div>

        {/* Machine Type */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Machine Type <span className="text-red-500">*</span>
          </label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            disabled={isFormLoading}
            className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
              errors.typeId
                ? "border-red-500 ring-2 ring-red-500/10"
                : "border-border"
            }`}
          >
            {machineTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </option>
            ))}
          </select>
          {errors.typeId && (
            <p className="text-xs text-red-500 mt-1 font-semibold">
              {errors.typeId}
            </p>
          )}
        </div>

        {/* Efficiency */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Machine Efficiency (Units/Day){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={efficiency}
            onChange={(e) => setEfficiency(e.target.value)}
            disabled={isFormLoading}
            placeholder="Units per day (e.g., 5000)"
            min="100"
            step="1"
            className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
              errors.efficiency
                ? "border-red-500 ring-2 ring-red-500/10"
                : "border-border"
            }`}
          />
          {errors.efficiency && (
            <p className="text-xs text-red-500 mt-1 font-semibold">
              {errors.efficiency}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isFormLoading}
          className="w-full py-2 px-4 bg-primary-550 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center disabled:opacity-50"
        >
          {isFormLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Add Machine"
          )}
        </button>
      </form>
    </div>
  );
}

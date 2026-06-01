import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useApp } from '../../context/AppContext';

export default function EditMachineModal({ machine, onClose }) {
  const { updateMachine } = useApi();
  const { machineTypes, loadingStates } = useApp();

  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (machine) {
      setName(machine.name || '');
      setTypeId(machine.machine_type_id?.toString() || '');
      setEfficiency(machine.efficiency?.toString() || '');
    }
  }, [machine]);

  if (!machine) return null;

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) {
      tempErrors.name = 'Machine name is required';
    } else if (name.trim().length < 2) {
      tempErrors.name = 'Machine name must be at least 2 characters';
    }

    if (!typeId) {
      tempErrors.typeId = 'Machine type is required';
    }

    const effNum = parseInt(efficiency);
    if (!efficiency) {
      tempErrors.efficiency = 'Efficiency is required';
    } else if (isNaN(effNum) || effNum <= 0) {
      tempErrors.efficiency = 'Efficiency must be a positive integer';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await updateMachine(machine.id, {
        name: name.trim(),
        machine_type_id: parseInt(typeId),
        efficiency: parseInt(efficiency),
        status: machine.status || 'idle'
      });
      onClose();
    } catch (err) {
      // Handled by Axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-heavy border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-secondary/10">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary-550" />
            Edit Machine Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Machine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cutter_Alpha"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
                errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>
            )}
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Machine Type <span className="text-red-500">*</span>
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
                errors.typeId ? 'border-red-500 ring-2 ring-red-500/10' : 'border-border'
              }`}
            >
              {machineTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </option>
              ))}
            </select>
            {errors.typeId && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.typeId}</p>
            )}
          </div>

          {/* Efficiency */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Machine Efficiency (Units/Day) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              placeholder="e.g., 5000"
              min="1"
              step="100"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
                errors.efficiency ? 'border-red-500 ring-2 ring-red-500/10' : 'border-border'
              }`}
            />
            {errors.efficiency && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.efficiency}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary-550 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

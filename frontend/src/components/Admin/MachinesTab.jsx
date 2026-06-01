import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useApp } from '../../context/AppContext';
import { MACHINE_TYPE_THEMES } from '../../utils/constants';
import { Edit2, Trash2, ShieldCheck, Activity, Cpu } from 'lucide-react';
import MachineForm from './MachineForm';
import EditMachineModal from './EditMachineModal';
import { TableSkeleton } from '../Common/LoadingSpinner';

export default function MachinesTab() {
  const { fetchMachines, deleteMachine, fetchMachineTypes } = useApi();
  const { machines, loadingStates } = useApp();
  
  const [editingMachine, setEditingMachine] = useState(null);

  useEffect(() => {
    fetchMachines();
    fetchMachineTypes();
  }, [fetchMachines, fetchMachineTypes]);

  const handleDelete = async (machine) => {
    if (window.confirm(`Are you sure you want to delete ${machine.name}?`)) {
      await deleteMachine(machine.id);
    }
  };

  const getMachineStatus = (machine) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isBookedToday = machine.booked_dates?.includes(todayStr);
    return isBookedToday ? 'Active' : 'Idle';
  };

  const isLoading = loadingStates.machines;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Machines List Table (Left 2 Columns) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-foreground text-left">Registered Equipment</h3>
            <p className="text-xs text-muted-foreground text-left">
              Manage machinery efficiency capacities and workflow bookings
            </p>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : machines.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-12 bg-card text-center flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-secondary rounded-full text-muted-foreground">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">No Machines Registered</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Use the registration form on the right to add manufacturing hardware to the line.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Machine ID</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Machine Name</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Efficiency</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {machines.map((machine) => {
                    const status = getMachineStatus(machine);
                    const typeLower = machine.machine_type?.name?.toLowerCase() || '';
                    const theme = MACHINE_TYPE_THEMES[typeLower] || MACHINE_TYPE_THEMES.default;
                    const TypeIcon = theme.icon;

                    return (
                      <tr key={machine.id} className="hover:bg-secondary/20 transition-colors duration-150">
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-muted-foreground">
                          M-{machine.id}
                        </td>
                        <td className="py-4 px-6 font-bold text-foreground">
                          {machine.name}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${theme.badgeClass}`}>
                            <TypeIcon className="w-3 h-3" />
                            {machine.machine_type?.name}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs font-bold text-foreground">
                          {machine.efficiency?.toLocaleString()} units/day
                        </td>
                        <td className="py-4 px-6">
                          {status === 'Active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/25 dark:text-blue-400 dark:border-blue-900/30 pulsing-indicator">
                              <Activity className="w-3.5 h-3.5 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Idle
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMachine(machine)}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary-550 hover:bg-secondary transition-colors"
                              title="Edit Machine"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(machine)}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete Machine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Register Form (Right 1 Column) */}
      <div className="space-y-4">
        <MachineForm />
      </div>

      {/* Edit Modal */}
      {editingMachine && (
        <EditMachineModal
          machine={editingMachine}
          onClose={() => {
            setEditingMachine(null);
            fetchMachines(true);
          }}
        />
      )}
    </div>
  );
}

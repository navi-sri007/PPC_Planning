import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../context/AppContext";
import { Calendar, PlusCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";

export default function JobForm() {
  const { createJob, fetchJobTemplates } = useApi();
  const { jobTemplates, loadingStates } = useApp();

  const [templateId, setTemplateId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetchJobTemplates();
  }, [fetchJobTemplates]);

  // Set default template once loaded
  useEffect(() => {
    if (jobTemplates.length > 0 && !templateId) {
      setTemplateId(jobTemplates[0].id.toString());
    }
  }, [jobTemplates, templateId]);

  const selectedTemplate = jobTemplates.find(
    (t) => t.id.toString() === templateId,
  );

  // Minimum date is tomorrow
  const getMinDateStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const validate = () => {
    const tempErrors = {};
    if (!templateId) {
      tempErrors.templateId = "Job template is required";
    }

    const qtyNum = parseInt(quantity);
    if (!quantity) {
      tempErrors.quantity = "Quantity is required";
    } else if (isNaN(qtyNum) || qtyNum <= 0) {
      tempErrors.quantity = "Quantity must be a positive integer";
    }

    if (!dueDate) {
      tempErrors.dueDate = "Due date is required";
    } else {
      const selected = new Date(dueDate);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (selected < tomorrow) {
        tempErrors.dueDate = "Due date must be in the future";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessData(null);
    if (!validate()) return;

    try {
      const result = await createJob({
        template_id: parseInt(templateId),
        quantity: parseInt(quantity),
        due_date: dueDate,
      });

      // Show success details
      setSuccessData(result);

      // Clear Form inputs
      setQuantity("");
      setDueDate("");
      setErrors({});
    } catch (err) {
      // Handled by Axios interceptor toast
    }
  };

  const isFormLoading = loadingStates.forms;

  return (
    <div className="space-y-4 text-left">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-primary-550" />
          Schedule New Job
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Template */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Select Job Template <span className="text-red-500">*</span>
            </label>
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setSuccessData(null); // Clear success message on change
              }}
              disabled={isFormLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
                errors.templateId
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-border"
              }`}
            >
              {jobTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name.charAt(0).toUpperCase() +
                    template.name.slice(1)}
                </option>
              ))}
            </select>
            {errors.templateId && (
              <p className="text-xs text-red-500 mt-1 font-semibold">
                {errors.templateId}
              </p>
            )}

            {/* Read-only process flow */}
            {selectedTemplate && selectedTemplate.processes && (
              <div className="mt-3 p-3 bg-secondary/30 rounded-lg border border-border/80">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-2">
                  Routing Sequence
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedTemplate.processes.map((proc, index) => (
                    <React.Fragment key={index}>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-900 border border-border text-foreground capitalize">
                        {proc.machine_type}
                      </span>
                      {index < selectedTemplate.processes.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Quantity */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Production Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isFormLoading}
              placeholder="e.g., 5000"
              min="100"
              step="1"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
                errors.quantity
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-border"
              }`}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1 font-semibold">
                {errors.quantity}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Delivery Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              min={getMinDateStr()}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isFormLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-550 focus:border-transparent ${
                errors.dueDate
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : "border-border"
              }`}
            />
            {errors.dueDate && (
              <p className="text-xs text-red-500 mt-1 font-semibold">
                {errors.dueDate}
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
              "Create & Schedule Job"
            )}
          </button>
        </form>
      </div>

      {/* Success scheduling timetable card */}
      {successData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-5 dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-450 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-250">
                Job Created Successfully!
              </h4>
              <p className="text-xs mt-0.5 text-emerald-700 dark:text-emerald-400">
                Job #{successData.id} has been entered into the active
                scheduler.
              </p>

              <div className="mt-4 space-y-2 border-t border-emerald-200 dark:border-emerald-900/50 pt-3">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-emerald-800 dark:text-emerald-350">
                  Planned Schedule Route
                </span>

                {successData.schedule &&
                  successData.schedule.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs bg-emerald-100/40 dark:bg-emerald-950/40 border border-emerald-250/30 dark:border-emerald-900/30 p-2 rounded-lg"
                    >
                      <div>
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                          Step {step.process_step}:{" "}
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-300">
                          {step.machine_name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-emerald-750 dark:text-emerald-400">
                        {formatDate(step.assigned_date)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

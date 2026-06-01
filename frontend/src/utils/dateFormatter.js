/**
 * Utility functions for date formatting and comparison
 */

/**
 * Formats an ISO date string (YYYY-MM-DD) or Date object into 'MMM DD, YYYY' format
 * @param {string|Date} dateVal - Date to format
 * @returns {string} Formatted date string (e.g., 'Jun 20, 2026')
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    
    // Formatting: MMM DD, YYYY
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateVal);
  }
};

/**
 * Formats an ISO date string into 'MMM DD' format for the Gantt header
 * @param {string} dateStr 
 * @returns {string} Formatted date (e.g., 'Jun 20')
 */
export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Checks if a date is in the past compared to today (overdue)
 * @param {string|Date} dateVal 
 * @returns {boolean}
 */
export const isOverdue = (dateVal) => {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  d.setHours(23, 59, 59, 999); // End of due date
  return d < new Date();
};

/**
 * Checks if a date is within 3 days from now
 * @param {string|Date} dateVal 
 * @returns {boolean}
 */
export const isDueSoon = (dateVal) => {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  const today = new Date();
  const diffTime = d - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
};

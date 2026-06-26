/**
 * Get current date in Local Timezone ISO format (YYYY-MM-DD)
 */
export function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Subtract N days from an ISO date string
 */
export function subtractDays(dateStr, numDays) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - numDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate difference in days between two YYYY-MM-DD dates
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format a specific year, month, day into YYYY-MM-DD
 */
export function formatISO(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Generate dates for a calendar grid for a specific month
 */
export function generateCalendarMonth(year, month, completedDays, startDate) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = getTodayISO();
  
  const days = [];
  
  // Padding at start (how many days from prev month to fill the first week row)
  // getDay() is 0 (Sunday) to 6 (Saturday).
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    days.push({ type: "padding" });
  }
  
  // Fill the days of the month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = formatISO(year, month, d);
    const isBeforeStart = dateStr < startDate;
    const isFuture = dateStr > today;
    const isToday = dateStr === today;
    const isDone = completedDays.includes(dateStr);
    const isMissed = !isFuture && !isDone && !isBeforeStart && dateStr !== today;
    
    days.push({
      type: "day",
      date: dateStr,
      day: d,
      isToday,
      isDone,
      isMissed,
      isFuture,
      isBeforeStart,
    });
  }
  
  return days;
}

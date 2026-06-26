import { subtractDays, daysBetween } from './dateUtils';

/**
 * Calculate current streak from array of completedDays (YYYY-MM-DD strings)
 * Streak can start from today or yesterday (if today has not been logged yet)
 */
export function calculateCurrentStreak(completedDays, today) {
  if (!completedDays || completedDays.length === 0) return 0;
  
  // Sort descending
  const sorted = [...completedDays].sort().reverse();
  
  let streak = 0;
  let checkDate = today;

  // If the most recent completed day is not today, check if it was yesterday.
  // If it's not even yesterday, streak is broken.
  if (sorted[0] !== today) {
    const yesterday = subtractDays(today, 1);
    if (sorted[0] !== yesterday) {
      return 0;
    }
    checkDate = yesterday;
  }

  for (const day of sorted) {
    if (day === checkDate) {
      streak++;
      checkDate = subtractDays(checkDate, 1);
    } else if (day > checkDate) {
      // Skip duplicates or future dates if any anomalous data
      continue;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Calculate longest streak from all completedDays
 */
export function calculateLongestStreak(completedDays) {
  if (!completedDays || completedDays.length === 0) return 0;
  
  // Sort ascending
  const sorted = [...new Set(completedDays)].sort();
  
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1], sorted[i]);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

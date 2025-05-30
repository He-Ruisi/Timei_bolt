/**
 * Format hours to 12-hour format with AM/PM
 */
export const formatTime = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
};

/**
 * Format duration in minutes to hours and minutes format
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Parse a duration string like "1.5h" or "30m" to minutes
 */
export const parseDuration = (durationStr: string): number => {
  if (durationStr.includes('h') && durationStr.includes('m')) {
    // Format: "1h 30m"
    const parts = durationStr.split(' ');
    const hours = parseFloat(parts[0].replace('h', ''));
    const minutes = parseFloat(parts[1].replace('m', ''));
    return hours * 60 + minutes;
  } else if (durationStr.endsWith('h')) {
    // Format: "1.5h"
    const hours = parseFloat(durationStr.replace('h', ''));
    return hours * 60;
  } else if (durationStr.endsWith('m')) {
    // Format: "30m"
    return parseFloat(durationStr.replace('m', ''));
  }
  
  return 0;
};

/**
 * Format milliseconds to HH:MM:SS.ss format for stopwatch
 */
export const formatStopwatchTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const centiseconds = Math.floor((milliseconds % 1000) / 10);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

/**
 * Format seconds to MM:SS format for countdown timer
 */
export const formatCountdownTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
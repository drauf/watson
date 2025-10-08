import Thread from '../types/Thread';

/**
 * Utility functions for regex-based thread filtering
 */

/**
 * Tests if a thread matches both name and stack trace filters
 */
export const matchesRegexFilters = (
  thread: Thread,
  nameFilter: string,
  stackFilter: string
): boolean => {
  return matchesNameFilter(thread, nameFilter) && matchesStackFilter(thread, stackFilter);
};

/**
 * Tests if a thread name matches the provided regex pattern
 */
export const matchesNameFilter = (thread: Thread, nameFilter: string): boolean => {
  if (!nameFilter) {
    return true;
  }

  try {
    const regex = new RegExp(nameFilter, 'i');
    return regex.test(thread.name);
  } catch {
    // ignore invalid regex
    return true;
  }
};

/**
 * Tests if any line in a thread's stack trace matches the provided regex pattern.
 * For negative lookahead patterns, tests against the entire stack trace as one string.
 */
export const matchesStackFilter = (thread: Thread, stackFilter: string): boolean => {
  if (!stackFilter) {
    return true;
  }

  try {
    const regex = new RegExp(stackFilter, 'i');
    
    // For negative lookahead patterns, test against entire stack trace
    if (stackFilter.includes('(?!')) {
      const fullStackTrace = thread.stackTrace.join('\n');
      return regex.test(fullStackTrace);
    }
    
    // For normal patterns, test individual lines
    return thread.stackTrace.some(line => regex.test(line));
  } catch {
    // ignore invalid regex
    return true;
  }
};
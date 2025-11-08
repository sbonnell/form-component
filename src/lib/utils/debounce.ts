/**
 * Debounce utility for delaying function execution
 * 
 * Delays function execution until after a specified wait time has elapsed
 * since the last invocation. Useful for search inputs and calculations.
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Debounce for search inputs (300ms)
 */
export const debounceSearch = <T extends (...args: any[]) => any>(func: T) =>
  debounce(func, 300);

/**
 * Debounce for calculations (100ms)
 */
export const debounceCalculation = <T extends (...args: any[]) => any>(func: T) =>
  debounce(func, 100);

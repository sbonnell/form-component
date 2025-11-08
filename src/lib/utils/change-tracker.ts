/**
 * Change tracker for detecting modified fields
 * 
 * Compares current form state with initial state to identify dirty fields.
 * Essential for edit mode to send only changed data to the server.
 */

import { getValue } from './dot-notation';

/**
 * Compare two values for equality
 * Handles primitives, arrays, and objects
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => isEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Track which fields have been modified
 */
export class ChangeTracker {
  private initialData: Record<string, any>;
  private fieldPaths: string[];

  constructor(initialData: Record<string, any>, fieldPaths: string[]) {
    this.initialData = structuredClone(initialData);
    this.fieldPaths = fieldPaths;
  }

  /**
   * Get map of changed fields
   * Returns { [fieldPath]: true } for fields that changed
   */
  getChangedFields(currentData: Record<string, any>): Record<string, boolean> {
    const changed: Record<string, boolean> = {};

    for (const path of this.fieldPaths) {
      const initialValue = getValue(this.initialData, path);
      const currentValue = getValue(currentData, path);

      if (!isEqual(initialValue, currentValue)) {
        changed[path] = true;
      }
    }

    return changed;
  }

  /**
   * Check if any field has changed
   */
  hasChanges(currentData: Record<string, any>): boolean {
    const changed = this.getChangedFields(currentData);
    return Object.keys(changed).length > 0;
  }

  /**
   * Check if specific field has changed
   */
  isFieldChanged(currentData: Record<string, any>, path: string): boolean {
    const initialValue = getValue(this.initialData, path);
    const currentValue = getValue(currentData, path);
    return !isEqual(initialValue, currentValue);
  }

  /**
   * Reset initial data (e.g., after successful save)
   */
  reset(newInitialData: Record<string, any>): void {
    this.initialData = structuredClone(newInitialData);
  }
}

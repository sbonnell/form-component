/**
 * Dot-notation utilities for nested object access
 * 
 * Enables accessing and setting nested object properties using string paths
 * like "user.address.city" instead of obj.user?.address?.city
 */

/**
 * Get value from nested object using dot-notation path
 * 
 * @example
 * const obj = { user: { name: 'Alice', address: { city: 'London' } } };
 * getValue(obj, 'user.address.city') // 'London'
 * getValue(obj, 'user.phone') // undefined
 */
export function getValue<T = any>(obj: any, path: string): T | undefined {
  if (!obj || !path) return undefined;

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[key];
  }

  return result as T;
}

/**
 * Set value in nested object using dot-notation path
 * Creates intermediate objects as needed
 * 
 * @example
 * const obj = {};
 * setValue(obj, 'user.address.city', 'London');
 * // obj = { user: { address: { city: 'London' } } }
 */
export function setValue(obj: any, path: string, value: any): void {
  if (!obj || !path) return;

  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * Delete value from nested object using dot-notation path
 * 
 * @example
 * const obj = { user: { name: 'Alice', email: 'alice@example.com' } };
 * deleteValue(obj, 'user.email');
 * // obj = { user: { name: 'Alice' } }
 */
export function deleteValue(obj: any, path: string): boolean {
  if (!obj || !path) return false;

  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return false;

  let current = obj;

  for (const key of keys) {
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }

  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }

  return false;
}

/**
 * Check if path exists in nested object
 * 
 * @example
 * const obj = { user: { name: 'Alice' } };
 * hasPath(obj, 'user.name') // true
 * hasPath(obj, 'user.email') // false
 */
export function hasPath(obj: any, path: string): boolean {
  if (!obj || !path) return false;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

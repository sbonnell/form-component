/**
 * Dependency Tracker for Calculated Fields
 * 
 * Tracks dependencies between calculated fields and determines
 * the correct evaluation order to handle nested calculations.
 */

import type { CalculatedField } from '@/types/schema';

/**
 * Build a dependency graph for calculated fields
 * 
 * @param calculatedFields - Array of calculated field definitions
 * @returns Map of target field to its dependencies
 */
export function buildDependencyGraph(
  calculatedFields: CalculatedField[]
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  
  for (const calc of calculatedFields) {
    graph.set(calc.target, new Set(calc.dependsOn));
  }
  
  return graph;
}

/**
 * Get topological sort order for calculated fields
 * 
 * This ensures that fields are calculated in the correct order,
 * with dependencies calculated before dependent fields.
 * 
 * @param calculatedFields - Array of calculated field definitions
 * @returns Ordered array of calculated fields
 * @throws Error if circular dependency detected
 */
export function getEvaluationOrder(
  calculatedFields: CalculatedField[]
): CalculatedField[] {
  const graph = buildDependencyGraph(calculatedFields);
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: CalculatedField[] = [];
  
  // Map for quick lookup
  const calcMap = new Map(calculatedFields.map(c => [c.target, c]));
  
  function visit(target: string) {
    if (visited.has(target)) {
      return;
    }
    
    if (visiting.has(target)) {
      throw new Error(`Circular dependency detected: ${target}`);
    }
    
    visiting.add(target);
    
    const deps = graph.get(target);
    if (deps) {
      for (const dep of deps) {
        // Only visit if dependency is also a calculated field
        if (calcMap.has(dep)) {
          visit(dep);
        }
      }
    }
    
    visiting.delete(target);
    visited.add(target);
    
    const calc = calcMap.get(target);
    if (calc) {
      order.push(calc);
    }
  }
  
  // Visit all calculated fields
  for (const calc of calculatedFields) {
    if (!visited.has(calc.target)) {
      visit(calc.target);
    }
  }
  
  return order;
}

/**
 * Get all fields affected by a change to a specific field
 * 
 * @param changedField - Field that changed
 * @param calculatedFields - Array of calculated field definitions
 * @returns Set of calculated field targets that need recalculation
 */
export function getAffectedCalculations(
  changedField: string,
  calculatedFields: CalculatedField[]
): Set<string> {
  const affected = new Set<string>();
  
  // Direct dependencies
  for (const calc of calculatedFields) {
    if (calc.dependsOn.includes(changedField)) {
      affected.add(calc.target);
    }
  }
  
  // Transitive dependencies (calculated fields that depend on affected fields)
  let changed = true;
  while (changed) {
    changed = false;
    for (const calc of calculatedFields) {
      if (!affected.has(calc.target)) {
        // Check if this field depends on any affected fields
        const dependsOnAffected = calc.dependsOn.some(dep => affected.has(dep));
        if (dependsOnAffected) {
          affected.add(calc.target);
          changed = true;
        }
      }
    }
  }
  
  return affected;
}

/**
 * Validate that calculated field dependencies exist
 * 
 * @param calculatedFields - Array of calculated field definitions
 * @param allFieldPaths - All available field paths in schema
 * @returns Array of validation errors
 */
export function validateDependencies(
  calculatedFields: CalculatedField[],
  allFieldPaths: string[]
): string[] {
  const errors: string[] = [];
  const fieldSet = new Set(allFieldPaths);
  
  for (const calc of calculatedFields) {
    for (const dep of calc.dependsOn) {
      if (!fieldSet.has(dep)) {
        errors.push(`Calculated field "${calc.target}" depends on non-existent field "${dep}"`);
      }
    }
  }
  
  return errors;
}

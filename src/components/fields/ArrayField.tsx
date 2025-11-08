/**
 * ArrayField component
 * 
 * Repeater field for array values (add/remove items)
 */

'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import TextField from './TextField';
import NumberField from './NumberField';
import CheckboxField from './CheckboxField';
import type { FieldDefinition } from '@/types/schema';

export interface ArrayFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function ArrayField({ name, field, required, disabled }: ArrayFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name, control });
  
  const error = errors[name]?.message as string | undefined;
  
  // Get item schema
  const itemSchema = field.items;
  
  if (!itemSchema) {
    console.error(`ArrayField: No items schema defined for field "${name}"`);
    return null;
  }
  
  const handleAddItem = () => {
    // Add empty item based on schema type
    let defaultValue: any = '';
    
    if (itemSchema.type === 'object') {
      defaultValue = {};
    } else if (itemSchema.type === 'number') {
      defaultValue = 0;
    } else if (itemSchema.type === 'boolean') {
      defaultValue = false;
    }
    
    append(defaultValue);
  };
  
  const handleRemoveItem = (index: number) => {
    remove(index);
  };
  
  // Get min/max constraints
  const minItems = field.minItems ?? 0;
  const maxItems = field.maxItems;
  const canAdd = !maxItems || fields.length < maxItems;
  const canRemove = fields.length > minItems;

  return (
    <FieldWrapper
      id={name}
      label={field.title}
      required={required}
      description={field.description}
      error={error}
      width={field.ui?.width}
    >
      <div className="space-y-3">
        {fields.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">No items added yet</p>
          </div>
        )}
        
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="relative border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            {/* Item header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Item {index + 1}
              </span>
              
              {canRemove && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled || field.readOnly}
                  className="text-red-600 hover:text-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Item field */}
            <div>
              {itemSchema.type === 'string' && (
                <TextField
                  name={`${name}.${index}`}
                  field={itemSchema}
                  disabled={disabled || field.readOnly}
                />
              )}
              {itemSchema.type === 'number' && (
                <NumberField
                  name={`${name}.${index}`}
                  field={itemSchema}
                  disabled={disabled || field.readOnly}
                />
              )}
              {itemSchema.type === 'boolean' && (
                <CheckboxField
                  name={`${name}.${index}`}
                  field={itemSchema}
                  disabled={disabled || field.readOnly}
                />
              )}
              {itemSchema.type === 'object' && (
                <div className="p-3 border border-gray-200 rounded bg-white">
                  <p className="text-xs text-gray-500">Object fields not yet supported in arrays</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add button */}
        {canAdd && (
          <button
            type="button"
            onClick={handleAddItem}
            disabled={disabled || field.readOnly}
            className="w-full py-2.5 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        )}
        
        {/* Constraints info */}
        {!error && (minItems > 0 || maxItems) && (
          <p className="text-xs text-gray-500">
            {minItems > 0 && maxItems
              ? `Add between ${minItems} and ${maxItems} items`
              : minItems > 0
              ? `Minimum ${minItems} item${minItems === 1 ? '' : 's'} required`
              : `Maximum ${maxItems} item${maxItems === 1 ? '' : 's'} allowed`}
          </p>
        )}
      </div>
    </FieldWrapper>
  );
}

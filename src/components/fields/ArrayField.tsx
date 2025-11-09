/**
 * ArrayField component
 * 
 * Repeater field for array values (add/remove items)
 * Migrated to use shadcn/ui components.
 */

'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import TextField from './TextField';
import NumberField from './NumberField';
import CheckboxField from './CheckboxField';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';

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
      offset={field.ui?.offset}
    >
      <div className="space-y-3">
        {fields.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed rounded-lg border-muted">
            <p className="text-sm text-muted-foreground">No items added yet</p>
          </div>
        )}
        
        {fields.map((item, index) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Item {index + 1}
              </span>
              
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled || field.readOnly}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            
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
                <div className="p-3 border rounded bg-muted">
                  <p className="text-xs text-muted-foreground">Object fields not yet supported in arrays</p>
                </div>
              )}
            </div>
          </Card>
        ))}
        
        {canAdd && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAddItem}
            disabled={disabled || field.readOnly}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
        
        {!error && (minItems > 0 || maxItems) && (
          <p className="text-xs text-muted-foreground">
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

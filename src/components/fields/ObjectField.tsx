/**
 * ObjectField component
 * 
 * Nested object field group with collapsible UI
 * Migrated to use shadcn/ui components.
 */

'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import TextField from './TextField';
import NumberField from './NumberField';
import CheckboxField from './CheckboxField';
import SelectField from './SelectField';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';

export interface ObjectFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Hidden fields set */
  hiddenFields?: Set<string>;
  
  /** Conditionally required fields set */
  conditionallyRequiredFields?: Set<string>;
  
  /** Read-only fields set */
  readOnlyFields?: Set<string>;
}

export default function ObjectField({ 
  name, 
  field, 
  required, 
  disabled,
  hiddenFields = new Set(),
  conditionallyRequiredFields = new Set(),
  readOnlyFields = new Set()
}: ObjectFieldProps) {
  const { formState: { errors } } = useFormContext();
  const [isExpanded, setIsExpanded] = useState(field.ui?.collapsed === true ? false : true);
  
  const error = errors[name]?.message as string | undefined;
  
  // Get nested properties
  const properties = field.properties || {};
  const requiredFields = field.required || [];
  
  if (Object.keys(properties).length === 0) {
    console.error(`ObjectField: No properties defined for field "${name}"`);
    return null;
  }
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
      <Card>
        <CardHeader className="p-0">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleExpanded}
            className="w-full justify-between rounded-none h-auto px-4 py-3"
          >
            <span className="text-sm font-medium">
              {field.title}
            </span>
            
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-4 space-y-4">
            {Object.entries(properties).map(([key, nestedField]) => {
              const fieldPath = `${name}.${key}`;
              
              if (hiddenFields.has(fieldPath)) {
                return null;
              }
              
              const isFieldRequired = requiredFields.includes(key) || conditionallyRequiredFields.has(fieldPath);
              const isFieldDisabled = disabled || readOnlyFields.has(fieldPath) || field.readOnly;
              
              return (
                <div key={key}>
                  {nestedField.type === 'string' && !nestedField.enum && (
                    <TextField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'string' && nestedField.enum && (
                    <SelectField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'number' && (
                    <NumberField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'boolean' && (
                    <CheckboxField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'object' && (
                    <ObjectField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                      hiddenFields={hiddenFields}
                      conditionallyRequiredFields={conditionallyRequiredFields}
                      readOnlyFields={readOnlyFields}
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>
      
      {!error && field.ui?.help && (
        <p className="mt-2 text-xs text-muted-foreground">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}

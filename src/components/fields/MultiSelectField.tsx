/**
 * MultiSelectField component
 * 
 * Multi-select dropdown field with search and dynamic options (US3).
 * Supports multiple selection with checkboxes and badge display.
 * Migrated to use shadcn/ui Badge component for selected items.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFormContext as useRHFContext, useController } from 'react-hook-form';
import { useFormContext } from '@/components/form-component/FormContext';
import { useDynamicOptions } from '@/lib/options/fetcher';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';
import type { FieldDefinition } from '@/types/schema';
import type { Option } from '@/lib/options/types';
import { cn } from '@/lib/utils';

export interface MultiSelectFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function MultiSelectField({ name, field, required, disabled }: MultiSelectFieldProps) {
  const { control, formState: { errors }, watch } = useRHFContext();
  const formContext = useFormContext();
  
  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: [],
  });
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || 'Select options';
  
  // Check if this is a dynamic select (has optionsSource)
  const isDynamic = !!field.ui?.optionsSource;
  
  // State for search input and dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current field value (array of selected values)
  const currentValue = controllerField.value as string[] || [];
  
  // Fetch dynamic options if needed
  const { 
    options: dynamicOptions, 
    isLoading, 
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error: fetchError,
    refetch
  } = useDynamicOptions({
    sourceName: field.ui?.optionsSource || '',
    searchQuery,
    dependsOn: field.ui?.dependsOn || [],
    context: formContext.context,
    onOptions: formContext.callbacks.onOptions,
    enabled: isDynamic,
  });
  
  // Convert static enum options to Option format
  const staticOptions = useMemo<Option[]>(() => {
    if (isDynamic) return [];
    const enumValues = field.enum || [];
    return enumValues.map(value => ({
      value: String(value),
      label: String(value),
    }));
  }, [field.enum, isDynamic]);
  
  // Use dynamic or static options
  const options = isDynamic ? dynamicOptions : staticOptions;
  
  // Filter options based on search query (for static options)
  const filteredOptions = useMemo(() => {
    if (isDynamic) return options; // Dynamic options already filtered server-side
    if (!searchQuery) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery, isDynamic]);
  
  // Get labels for selected values
  const selectedLabels = useMemo(() => {
    return currentValue
      .map(val => options.find(opt => opt.value === val))
      .filter((opt): opt is Option => opt !== undefined)
      .map(opt => opt.label);
  }, [currentValue, options]);
  
  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Handle option toggle
  const handleToggleOption = useCallback((value: string) => {
    const newValue = currentValue.includes(value)
      ? currentValue.filter(v => v !== value)
      : [...currentValue, value];
    
    controllerField.onChange(newValue);
  }, [currentValue, controllerField]);
  
  // Handle clear all
  const handleClearAll = useCallback(() => {
    controllerField.onChange([]);
  }, [controllerField]);
  
  // Handle scroll to bottom (for pagination)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Watch dependent fields and reset search when they change
  const dependentFields = field.ui?.dependsOn || [];
  const dependentValues = watch(dependentFields);
  useEffect(() => {
    if (dependentFields.length > 0) {
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dependentValues)]);
  
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
      <div ref={dropdownRef} className="relative">
        {/* Trigger button with selected badges */}
        <Button
          type="button"
          variant="outline"
          role="combobox"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled || field.readOnly}
          className={cn(
            'w-full min-h-[42px] justify-between',
            error && 'border-destructive'
          )}
        >
          <div className="flex items-center flex-wrap gap-1.5 flex-1">
            {currentValue.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedLabels.map((label, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const valueToRemove = currentValue[index];
                      handleToggleOption(valueToRemove);
                    }}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        
        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
            {/* Search input and clear button */}
            <div className="p-2 border-b border-border space-y-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="h-9"
                autoFocus
              />
              {currentValue.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearAll}
                  className="w-full h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear all ({currentValue.length})
                </Button>
              )}
            </div>
            
            {/* Options list */}
            <div 
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
            >
              {isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading options...
                </div>
              )}
              
              {fetchError && (
                <div className="p-4">
                  <p className="text-sm text-destructive mb-2">Failed to load options</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => refetch()}
                    className="h-auto p-0 text-sm"
                  >
                    Retry
                  </Button>
                </div>
              )}
              
              {!isLoading && !fetchError && filteredOptions.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              )}
              
              {filteredOptions.map((option) => {
                const isSelected = currentValue.includes(String(option.value));
                
                return (
                  <label
                    key={String(option.value)}
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm cursor-pointer hover:bg-accent',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      isSelected && 'bg-accent'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={option.disabled}
                      onCheckedChange={() => handleToggleOption(String(option.value))}
                      className="mr-3"
                    />
                    <span className={cn(isSelected && 'font-medium')}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
              
              {isFetchingNextPage && (
                <div className="p-2 text-center text-sm text-gray-500">
                  Loading more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

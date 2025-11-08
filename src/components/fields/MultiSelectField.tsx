/**
 * MultiSelectField component
 * 
 * Multi-select dropdown field with search and dynamic options (US3).
 * Supports multiple selection with checkboxes and badge display.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFormContext as useRHFContext, useController } from 'react-hook-form';
import { useFormContext } from '@/components/form-component/FormContext';
import { useDynamicOptions } from '@/lib/options/fetcher';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';
import type { Option } from '@/lib/options/types';

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
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled || field.readOnly}
          className={`w-full min-h-[42px] px-4 py-2 text-sm text-left border rounded-lg shadow-sm transition-all duration-150 bg-white flex items-center flex-wrap gap-1.5
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
        >
          {currentValue.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <>
              {selectedLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const valueToRemove = currentValue[index];
                      handleToggleOption(valueToRemove);
                    }}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </>
          )}
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search input and clear button */}
            <div className="p-2 border-b border-gray-200 space-y-2">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {currentValue.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  Clear all ({currentValue.length})
                </button>
              )}
            </div>
            
            {/* Options list */}
            <div 
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
            >
              {isLoading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading options...
                </div>
              )}
              
              {fetchError && (
                <div className="p-4">
                  <p className="text-sm text-red-600 mb-2">Failed to load options</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {!isLoading && !fetchError && filteredOptions.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No options found
                </div>
              )}
              
              {filteredOptions.map((option) => {
                const isSelected = currentValue.includes(String(option.value));
                
                return (
                  <label
                    key={String(option.value)}
                    className={`flex items-center w-full px-4 py-2 text-sm cursor-pointer hover:bg-gray-100
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={option.disabled}
                      onChange={() => handleToggleOption(String(option.value))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={isSelected ? 'font-medium text-blue-700' : ''}>
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

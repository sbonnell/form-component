/**
 * SelectField component
 * 
 * Dropdown select field with static options (US1).
 * Enhanced with remote options, search, and dependencies (US3).
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFormContext as useRHFContext } from 'react-hook-form';
import { useFormContext } from '@/components/form-component/FormContext';
import { useDynamicOptions } from '@/lib/options/fetcher';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';
import type { Option } from '@/lib/options/types';

export interface SelectFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function SelectField({ name, field, required, disabled }: SelectFieldProps) {
  const { register, formState: { errors }, watch } = useRHFContext();
  const formContext = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || 'Select an option';
  
  // Check if this is a dynamic select (has optionsSource)
  const isDynamic = !!field.ui?.optionsSource;
  const hasSearch = isDynamic; // Enable search for dynamic selects
  
  // State for search input
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current field value
  const currentValue = watch(name);
  
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
  
  // Find selected option label
  const selectedLabel = useMemo(() => {
    const selected = options.find(opt => opt.value === currentValue);
    return selected?.label || placeholder;
  }, [options, currentValue, placeholder]);
  
  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);
  
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
  
  // For simple static selects without search, use native select
  if (!hasSearch) {
    return (
      <FieldWrapper
        id={name}
        label={field.title}
        required={required}
        description={field.description}
        error={error}
        width={field.ui?.width}
      >
        <select
          {...register(name)}
          id={name}
          disabled={disabled || field.readOnly}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg shadow-sm transition-all duration-150 bg-white
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="">{placeholder}</option>
          {filteredOptions.map((option) => (
            <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
  
  // For dynamic selects with search, use custom dropdown
  return (
    <FieldWrapper
      id={name}
      label={field.title}
      required={required}
      description={field.description}
      error={error}
      width={field.ui?.width}
    >
      <div ref={dropdownRef} className="relative">
        {/* Hidden input for form state */}
        <input type="hidden" {...register(name)} />
        
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled || field.readOnly}
          className={`w-full px-4 py-2.5 text-sm text-left border rounded-lg shadow-sm transition-all duration-150 bg-white flex items-center justify-between
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
        >
          <span className={currentValue ? '' : 'text-gray-400'}>{selectedLabel}</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
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
              
              {filteredOptions.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    const event = {
                      target: { name, value: option.value },
                    };
                    register(name).onChange(event);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                    ${String(option.value) === String(currentValue) ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  {option.label}
                </button>
              ))}
              
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

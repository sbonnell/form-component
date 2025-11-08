/**
 * TabLayout component
 * 
 * Tab-based navigation for organizing form sections.
 * Shows validation error indicators on tab headers.
 */

'use client';

import React, { useState } from 'react';
import type { FieldErrors } from 'react-hook-form';

export interface TabSection {
  /** Tab identifier */
  id: string;
  
  /** Tab label */
  title: string;
  
  /** Optional icon identifier */
  icon?: string;
  
  /** Field keys in this tab */
  fields: string[];
  
  /** Tab content */
  content: React.ReactNode;
}

export interface TabLayoutProps {
  /** Array of tab sections */
  tabs: TabSection[];
  
  /** Form errors for validation indicators */
  errors?: FieldErrors;
  
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  
  /** Additional CSS classes */
  className?: string;
}

export default function TabLayout({
  tabs,
  errors = {},
  onTabChange,
  className = '',
}: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  /**
   * Check if a tab has any validation errors
   */
  const hasTabErrors = (tab: TabSection): boolean => {
    return tab.fields.some((fieldKey) => {
      // Check for direct field errors
      if (errors[fieldKey]) return true;
      
      // Check for nested field errors (e.g., "contact.email")
      const nestedKeys = Object.keys(errors).filter((key) =>
        key.startsWith(fieldKey + '.')
      );
      return nestedKeys.length > 0;
    });
  };

  /**
   * Count errors in a tab
   */
  const getTabErrorCount = (tab: TabSection): number => {
    return tab.fields.reduce((count, fieldKey) => {
      if (errors[fieldKey]) count++;
      
      // Count nested errors
      const nestedKeys = Object.keys(errors).filter((key) =>
        key.startsWith(fieldKey + '.')
      );
      return count + nestedKeys.length;
    }, 0);
  };

  if (tabs.length === 0) {
    return null;
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="border-b border-gray-200 bg-white overflow-x-auto">
        <nav className="@container flex flex-wrap @sm:flex-nowrap space-x-2 @md:space-x-4 @lg:space-x-6 px-2 @md:px-4 @lg:px-6 min-w-min" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const hasErrors = hasTabErrors(tab);
            const errorCount = getTabErrorCount(tab);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`
                  relative whitespace-nowrap py-4 px-1 @md:px-2 @lg:px-3 border-b-2 font-medium text-xs @sm:text-sm
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                aria-selected={isActive}
              >
                <span className="flex items-center space-x-1 @md:space-x-2">
                  {tab.icon && <span className="text-xs @md:text-sm">{tab.icon}</span>}
                  <span className="hidden @sm:inline">{tab.title}</span>
                  <span className="@sm:hidden text-xs">{tab.title.substring(0, 3)}</span>
                  
                  {/* Error indicator */}
                  {hasErrors && (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 @md:w-5 @md:h-5 text-xs font-semibold text-white bg-red-500 rounded-full"
                      title={`${errorCount} error${errorCount === 1 ? '' : 's'}`}
                    >
                      {errorCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-2 @md:py-4 @lg:py-6">
        {activeTabData && (
          <div
            key={activeTabData.id}
            role="tabpanel"
            aria-labelledby={`tab-${activeTabData.id}`}
          >
            {activeTabData.content}
          </div>
        )}
      </div>
    </div>
  );
}

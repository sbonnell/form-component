/**
 * TabLayout component
 * 
 * Tab-based navigation for organizing form sections.
 * Shows validation error indicators on tab headers.
 * Migrated to use shadcn/ui components.
 */

'use client';

import React, { useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    <Tabs value={activeTab} onValueChange={handleTabClick} className={cn("w-full", className)}>
      <TabsList className="@container w-full justify-start overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const hasErrors = hasTabErrors(tab);
          const errorCount = getTabErrorCount(tab);

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative flex items-center gap-1 @md:gap-2"
            >
              {tab.icon && <span className="text-xs @md:text-sm">{tab.icon}</span>}
              <span className="hidden @sm:inline">{tab.title}</span>
              <span className="@sm:hidden text-xs">{tab.title.substring(0, 3)}</span>
              
              {hasErrors && (
                <Badge 
                  variant="destructive" 
                  className="w-4 h-4 @md:w-5 @md:h-5 p-0 flex items-center justify-center text-xs"
                  title={`${errorCount} error${errorCount === 1 ? '' : 's'}`}
                >
                  {errorCount}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="py-2 @md:py-4 @lg:py-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * Mock onOptions callback
 * 
 * Simulates remote API for dynamic select options with:
 * - Search filtering
 * - Pagination
 * - Dependent field filtering
 * 
 * User Story 3: Dynamic Options
 */

import type { OnOptionsCallback, OnOptionsResponse } from '@/types/callbacks';

// Mock data sets
const COUNTRIES = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
];

const INSTRUMENTS_BY_ASSET_CLASS: Record<string, Array<{ value: string; label: string }>> = {
  equity: [
    { value: 'AAPL', label: 'Apple Inc. (AAPL)' },
    { value: 'MSFT', label: 'Microsoft Corporation (MSFT)' },
    { value: 'GOOGL', label: 'Alphabet Inc. (GOOGL)' },
    { value: 'AMZN', label: 'Amazon.com Inc. (AMZN)' },
    { value: 'TSLA', label: 'Tesla Inc. (TSLA)' },
    { value: 'META', label: 'Meta Platforms Inc. (META)' },
    { value: 'NVDA', label: 'NVIDIA Corporation (NVDA)' },
    { value: 'JPM', label: 'JPMorgan Chase & Co. (JPM)' },
    { value: 'V', label: 'Visa Inc. (V)' },
    { value: 'WMT', label: 'Walmart Inc. (WMT)' },
  ],
  fixedIncome: [
    { value: 'US10Y', label: 'US 10-Year Treasury' },
    { value: 'US30Y', label: 'US 30-Year Treasury' },
    { value: 'DE10Y', label: 'German 10-Year Bund' },
    { value: 'GB10Y', label: 'UK 10-Year Gilt' },
    { value: 'JP10Y', label: 'Japan 10-Year JGB' },
  ],
  forex: [
    { value: 'EURUSD', label: 'EUR/USD' },
    { value: 'GBPUSD', label: 'GBP/USD' },
    { value: 'USDJPY', label: 'USD/JPY' },
    { value: 'AUDUSD', label: 'AUD/USD' },
    { value: 'USDCAD', label: 'USD/CAD' },
  ],
  commodity: [
    { value: 'GC', label: 'Gold' },
    { value: 'SI', label: 'Silver' },
    { value: 'CL', label: 'Crude Oil (WTI)' },
    { value: 'NG', label: 'Natural Gas' },
    { value: 'HG', label: 'Copper' },
  ],
};

const ASSET_CLASSES = [
  { value: 'equity', label: 'Equity' },
  { value: 'fixedIncome', label: 'Fixed Income' },
  { value: 'forex', label: 'Foreign Exchange' },
  { value: 'commodity', label: 'Commodity' },
];

const COUNTERPARTIES = Array.from({ length: 50 }, (_, i) => ({
  value: `CP${String(i + 1).padStart(3, '0')}`,
  label: `Counterparty ${i + 1}`,
}));

// Page size for pagination
const PAGE_SIZE = 10;

/**
 * Mock onOptions implementation with search and pagination
 */
export const mockOnOptions: OnOptionsCallback = async (params) => {
  const { name, query, dependsOn, pageToken } = params;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Get appropriate data set
  let data: Array<{ value: string; label: string }> = [];
  
  switch (name) {
    case 'countries':
      data = COUNTRIES;
      break;
      
    case 'assetClasses':
      data = ASSET_CLASSES;
      break;
      
    case 'instruments':
      // Dependent on assetClass field
      const assetClass = dependsOn.assetClass;
      if (typeof assetClass === 'string' && INSTRUMENTS_BY_ASSET_CLASS[assetClass]) {
        data = INSTRUMENTS_BY_ASSET_CLASS[assetClass];
      } else {
        // If no asset class selected, show all instruments
        data = Object.values(INSTRUMENTS_BY_ASSET_CLASS).flat();
      }
      break;
      
    case 'counterparties':
      data = COUNTERPARTIES;
      break;
      
    default:
      data = [];
  }
  
  // Filter by search query
  let filtered = data;
  if (query) {
    const queryLower = query.toLowerCase();
    filtered = data.filter(
      item => 
        item.label.toLowerCase().includes(queryLower) ||
        item.value.toLowerCase().includes(queryLower)
    );
  }
  
  // Handle pagination
  const page = pageToken ? parseInt(pageToken, 10) : 0;
  const startIndex = page * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filtered.slice(startIndex, endIndex);
  const hasMore = endIndex < filtered.length;
  
  const response: OnOptionsResponse = {
    options: paginatedData,
    nextPageToken: hasMore ? String(page + 1) : undefined,
  };
  
  return response;
};

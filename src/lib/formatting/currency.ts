/**
 * Currency Formatting Utilities
 * 
 * Implements en-GB locale currency formatting:
 * - Comma for thousands separator (1,000)
 * - Period for decimal separator (1,000.50)
 * - £ symbol for GBP
 * - € symbol for EUR
 * - $ symbol for USD
 */

export interface CurrencyFormatOptions {
  /** Currency code (GBP, EUR, USD, etc.) */
  currency?: string;
  
  /** Locale (default: en-GB) */
  locale?: string;
  
  /** Number of decimal places (default: 2) */
  decimals?: number;
  
  /** Whether to show currency symbol (default: true) */
  showSymbol?: boolean;
  
  /** Minimum value allowed */
  min?: number;
  
  /** Maximum value allowed */
  max?: number;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'GBP',
    locale = 'en-GB',
    decimals = 2,
    showSymbol = true,
  } = options;
  
  // Handle empty values
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  // Parse value to number
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  
  if (isNaN(numValue)) {
    return '';
  }
  
  // Use Intl.NumberFormat for proper locale formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(numValue);
}

/**
 * Parse a formatted currency string to a number
 */
export function parseCurrency(value: string): number | null {
  if (!value || value.trim() === '') {
    return null;
  }
  
  // Remove currency symbols, spaces, and thousand separators
  // Keep only digits, decimal point, and minus sign
  const cleaned = value
    .replace(/[£€$]/g, '')
    .replace(/,/g, '') // Remove commas (thousand separators)
    .replace(/\s/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Format currency as user types (progressive formatting)
 */
export function formatCurrencyInput(
  value: string,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'GBP',
    decimals = 2,
    showSymbol = true,
  } = options;
  
  if (!value || value === '') {
    return '';
  }
  
  // Get currency symbol
  const symbol = showSymbol ? getCurrencySymbol(currency) : '';
  
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^0-9.-]/g, '');
  
  // Handle negative sign
  const isNegative = cleaned.startsWith('-');
  const absolute = cleaned.replace('-', '');
  
  // Split into integer and decimal parts
  const parts = absolute.split('.');
  let integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Add thousand separators to integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Limit decimal places
  const limitedDecimal = decimalPart.slice(0, decimals);
  
  // Construct formatted value
  let result = integerPart;
  
  if (parts.length > 1) {
    result += '.' + limitedDecimal;
  }
  
  if (isNegative) {
    result = '-' + result;
  }
  
  if (showSymbol && result && result !== '-') {
    result = symbol + result;
  }
  
  return result;
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    JPY: '¥',
    CHF: 'CHF ',
    AUD: 'A$',
    CAD: 'C$',
    NZD: 'NZ$',
  };
  
  return symbols[currency.toUpperCase()] || currency + ' ';
}

/**
 * Validate currency value against constraints
 */
export function validateCurrency(
  value: number | null,
  options: CurrencyFormatOptions = {}
): { valid: boolean; error?: string } {
  const { min, max, decimals = 2 } = options;
  
  if (value === null) {
    return { valid: true }; // Null is valid (will be checked by required validator)
  }
  
  // Check minimum
  if (min !== undefined && value < min) {
    return {
      valid: false,
      error: `Value must be at least ${formatCurrency(min, options)}`,
    };
  }
  
  // Check maximum
  if (max !== undefined && value > max) {
    return {
      valid: false,
      error: `Value must not exceed ${formatCurrency(max, options)}`,
    };
  }
  
  // Check decimal places
  const decimalCount = (value.toString().split('.')[1] || '').length;
  if (decimalCount > decimals) {
    return {
      valid: false,
      error: `Value cannot have more than ${decimals} decimal place${decimals === 1 ? '' : 's'}`,
    };
  }
  
  return { valid: true };
}

/**
 * Round to specified decimal places
 */
export function roundCurrency(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

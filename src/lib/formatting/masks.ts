/**
 * Input Masks for Formatted Fields
 * 
 * Defines mask patterns for specialized input types:
 * - IBAN (International Bank Account Number)
 * - UK Postcode
 * - UK Sort Code
 * - Phone Number (E.164 format)
 */

export interface InputMask {
  /** Mask pattern (9 = digit, A = letter, * = alphanumeric) */
  mask: string | ((value: string) => string);
  
  /** Character to show in unfilled positions */
  placeholder?: string;
  
  /** Whether to show mask when field is empty */
  alwaysShowMask?: boolean;
  
  /** Characters to allow (regex) */
  formatChars?: Record<string, string>;
}

/**
 * IBAN Mask
 * Format: GB82 WEST 1234 5698 7654 32
 * - 2 country code letters
 * - 2 check digits
 * - Up to 30 alphanumeric characters
 */
export const IBAN_MASK: InputMask = {
  mask: (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const parts: string[] = [];
    
    // First 4 characters (country + check digits)
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
    
    // Remaining characters in groups of 4
    for (let i = 4; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    
    return parts.join(' ');
  },
  placeholder: '_',
  formatChars: {
    '9': '[0-9]',
    'A': '[A-Z]',
    '*': '[A-Z0-9]',
  },
};

/**
 * UK Postcode Mask
 * Formats: A9 9AA, A99 9AA, AA9 9AA, AA99 9AA, A9A 9AA, AA9A 9AA
 * Examples: SW1A 1AA, EC1A 1BB, W1A 0AX
 */
export const UK_POSTCODE_MASK: InputMask = {
  mask: (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    
    // Split into outward and inward codes
    const outward = cleaned.slice(0, -3);
    const inward = cleaned.slice(-3);
    
    return `${outward} ${inward}`;
  },
  placeholder: '_',
  formatChars: {
    '9': '[0-9]',
    'A': '[A-Z]',
  },
};

/**
 * UK Sort Code Mask
 * Format: 12-34-56
 * - 6 digits in XX-XX-XX pattern
 */
export const UK_SORT_CODE_MASK: InputMask = {
  mask: '99-99-99',
  placeholder: '_',
  formatChars: {
    '9': '[0-9]',
  },
};

/**
 * Phone Number Mask (E.164 format)
 * Format: +44 20 1234 5678
 * - + prefix
 * - Country code (1-3 digits)
 * - Number with spaces for readability
 */
export const PHONE_E164_MASK: InputMask = {
  mask: (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+')) {
      return cleaned ? `+${cleaned}` : '';
    }
    
    const digits = cleaned.slice(1);
    const parts: string[] = ['+'];
    
    // Country code (up to 3 digits)
    if (digits.length > 0) {
      const countryCode = digits.slice(0, Math.min(3, digits.length));
      parts.push(countryCode);
    }
    
    // Area code and number (group remaining digits)
    if (digits.length > 3) {
      const remaining = digits.slice(3);
      const groups: string[] = [];
      
      for (let i = 0; i < remaining.length; i += 4) {
        groups.push(remaining.slice(i, i + 4));
      }
      
      parts.push(...groups);
    }
    
    return parts.join(' ');
  },
  placeholder: '_',
  formatChars: {
    '9': '[0-9]',
    '+': '[+]',
  },
};

/**
 * Apply a mask to a raw value
 */
export function applyMask(value: string, mask: InputMask): string {
  if (typeof mask.mask === 'function') {
    return mask.mask(value);
  }
  
  // Simple pattern-based masking
  let result = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.mask.length && valueIndex < value.length; i++) {
    const maskChar = mask.mask[i];
    const formatChar = mask.formatChars?.[maskChar];
    
    if (formatChar) {
      // This position expects a specific character type
      const regex = new RegExp(formatChar);
      const valueChar = value[valueIndex];
      
      if (regex.test(valueChar)) {
        result += valueChar;
        valueIndex++;
      } else {
        // Skip invalid character
        valueIndex++;
        i--; // Retry this mask position
      }
    } else {
      // Literal character from mask
      result += maskChar;
    }
  }
  
  return result;
}

/**
 * Remove mask formatting to get raw value
 */
export function unmask(value: string, mask: InputMask): string {
  if (!mask.formatChars) {
    return value;
  }
  
  // Remove all non-data characters
  const dataChars = Object.keys(mask.formatChars).join('');
  const dataRegex = new RegExp(`[${dataChars}]`, 'g');
  
  return value.match(dataRegex)?.join('') || '';
}

/**
 * Validate if a masked value is complete
 */
export function isCompleteMask(value: string, mask: InputMask): boolean {
  if (typeof mask.mask === 'function') {
    // For dynamic masks, check if there are no placeholder characters
    return !value.includes(mask.placeholder || '_');
  }
  
  // For pattern masks, check if length matches expected length
  return value.length === mask.mask.length;
}

/**
 * Get mask patterns by type
 */
export const MASKS = {
  iban: IBAN_MASK,
  ukPostcode: UK_POSTCODE_MASK,
  ukSortCode: UK_SORT_CODE_MASK,
  phoneE164: PHONE_E164_MASK,
} as const;

export type MaskType = keyof typeof MASKS;

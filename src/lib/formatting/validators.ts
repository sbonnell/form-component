/**
 * Format Validation Utilities
 * 
 * Validates formatted input values:
 * - IBAN format validation
 * - UK postcode validation
 * - UK sort code validation
 * - E.164 phone number validation
 */

/**
 * IBAN validation
 * Supports all SEPA countries with proper length validation
 */
export function validateIBAN(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true }; // Empty is valid (handled by required)
  }
  
  // Remove spaces and convert to uppercase
  const cleaned = value.replace(/\s/g, '').toUpperCase();
  
  // IBAN length by country code
  const ibanLengths: Record<string, number> = {
    AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22,
    BH: 22, BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22,
    DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27,
    GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21, HU: 28,
    IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
    LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22,
    MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28,
    PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SE: 24, SI: 19,
    SK: 24, SM: 27, TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
  };
  
  // Must start with 2 letters (country code)
  if (!/^[A-Z]{2}/.test(cleaned)) {
    return { valid: false, error: 'IBAN must start with a 2-letter country code' };
  }
  
  const countryCode = cleaned.substring(0, 2);
  const expectedLength = ibanLengths[countryCode];
  
  // Check if country code is valid
  if (!expectedLength) {
    return { valid: false, error: `Unknown country code: ${countryCode}` };
  }
  
  // Check length
  if (cleaned.length !== expectedLength) {
    return {
      valid: false,
      error: `IBAN for ${countryCode} must be ${expectedLength} characters long`,
    };
  }
  
  // Must be followed by 2 check digits
  if (!/^[A-Z]{2}[0-9]{2}/.test(cleaned)) {
    return { valid: false, error: 'IBAN must have 2 check digits after country code' };
  }
  
  // Must contain only alphanumeric characters
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, error: 'IBAN must contain only letters and numbers' };
  }
  
  // Validate check digits using mod-97 algorithm
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
  
  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  const numeric = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    })
    .join('');
  
  // Calculate mod 97
  let remainder = numeric;
  while (remainder.length > 2) {
    const block = remainder.substring(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.substring(block.length);
  }
  
  const checksum = parseInt(remainder, 10) % 97;
  
  if (checksum !== 1) {
    return { valid: false, error: 'Invalid IBAN check digits' };
  }
  
  return { valid: true };
}

/**
 * UK Postcode validation
 * Supports all valid UK postcode formats
 */
export function validateUKPostcode(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true };
  }
  
  // Remove spaces and convert to uppercase
  const cleaned = value.replace(/\s/g, '').toUpperCase();
  
  // UK postcode patterns:
  // A9 9AA, A99 9AA, AA9 9AA, AA99 9AA, A9A 9AA, AA9A 9AA
  const postcodeRegex = /^([A-Z]{1,2}[0-9]{1,2}[A-Z]?)\s*([0-9][A-Z]{2})$/;
  
  const match = value.trim().toUpperCase().match(postcodeRegex);
  
  if (!match) {
    return { valid: false, error: 'Invalid UK postcode format' };
  }
  
  // Additional validation: check for invalid area codes
  const outward = match[1];
  
  // These letter combinations are not used in UK postcodes
  const invalidFirstLetters = ['Q', 'V', 'X'];
  const invalidSecondLetters = ['I', 'J', 'Z'];
  
  if (invalidFirstLetters.includes(outward[0])) {
    return { valid: false, error: 'Invalid postcode: first letter cannot be Q, V, or X' };
  }
  
  if (outward.length >= 2 && invalidSecondLetters.includes(outward[1])) {
    return { valid: false, error: 'Invalid postcode: second letter cannot be I, J, or Z' };
  }
  
  return { valid: true };
}

/**
 * UK Sort Code validation
 * Format: XX-XX-XX (6 digits)
 */
export function validateUKSortCode(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true };
  }
  
  // Remove hyphens and spaces
  const cleaned = value.replace(/[-\s]/g, '');
  
  // Must be exactly 6 digits
  if (!/^[0-9]{6}$/.test(cleaned)) {
    return { valid: false, error: 'Sort code must be 6 digits (format: XX-XX-XX)' };
  }
  
  // Additional validation: sort codes starting with 00 are invalid
  if (cleaned.startsWith('00')) {
    return { valid: false, error: 'Invalid sort code: cannot start with 00' };
  }
  
  return { valid: true };
}

/**
 * E.164 Phone Number validation
 * Format: +[country code][number]
 */
export function validateE164Phone(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true };
  }
  
  // Remove spaces and hyphens
  const cleaned = value.replace(/[\s-]/g, '');
  
  // Must start with +
  if (!cleaned.startsWith('+')) {
    return { valid: false, error: 'Phone number must start with + (country code)' };
  }
  
  // Remove + and check if all remaining characters are digits
  const digits = cleaned.substring(1);
  
  if (!/^[0-9]+$/.test(digits)) {
    return { valid: false, error: 'Phone number must contain only digits after +' };
  }
  
  // E.164 allows 1-15 digits after the +
  if (digits.length < 1 || digits.length > 15) {
    return { valid: false, error: 'Phone number must be between 1 and 15 digits (excluding +)' };
  }
  
  // Common country code validation
  const commonCountryCodes = [
    '1',    // US, Canada
    '7',    // Russia, Kazakhstan
    '20',   // Egypt
    '27',   // South Africa
    '30',   // Greece
    '31',   // Netherlands
    '32',   // Belgium
    '33',   // France
    '34',   // Spain
    '36',   // Hungary
    '39',   // Italy
    '40',   // Romania
    '41',   // Switzerland
    '43',   // Austria
    '44',   // UK
    '45',   // Denmark
    '46',   // Sweden
    '47',   // Norway
    '48',   // Poland
    '49',   // Germany
    '51',   // Peru
    '52',   // Mexico
    '53',   // Cuba
    '54',   // Argentina
    '55',   // Brazil
    '56',   // Chile
    '57',   // Colombia
    '58',   // Venezuela
    '60',   // Malaysia
    '61',   // Australia
    '62',   // Indonesia
    '63',   // Philippines
    '64',   // New Zealand
    '65',   // Singapore
    '66',   // Thailand
    '81',   // Japan
    '82',   // South Korea
    '84',   // Vietnam
    '86',   // China
    '90',   // Turkey
    '91',   // India
    '92',   // Pakistan
    '93',   // Afghanistan
    '94',   // Sri Lanka
    '95',   // Myanmar
    '98',   // Iran
    '212',  // Morocco
    '213',  // Algeria
    '216',  // Tunisia
    '218',  // Libya
    '220',  // Gambia
    '221',  // Senegal
    '222',  // Mauritania
    '223',  // Mali
    '224',  // Guinea
    '225',  // Ivory Coast
    '226',  // Burkina Faso
    '227',  // Niger
    '228',  // Togo
    '229',  // Benin
    '230',  // Mauritius
    '231',  // Liberia
    '232',  // Sierra Leone
    '233',  // Ghana
    '234',  // Nigeria
    '235',  // Chad
    '236',  // Central African Republic
    '237',  // Cameroon
    '238',  // Cape Verde
    '239',  // São Tomé and Príncipe
    '240',  // Equatorial Guinea
    '241',  // Gabon
    '242',  // Republic of the Congo
    '243',  // Democratic Republic of the Congo
    '244',  // Angola
    '245',  // Guinea-Bissau
    '246',  // British Indian Ocean Territory
    '247',  // Ascension Island
    '248',  // Seychelles
    '249',  // Sudan
    '250',  // Rwanda
    '251',  // Ethiopia
    '252',  // Somalia
    '253',  // Djibouti
    '254',  // Kenya
    '255',  // Tanzania
    '256',  // Uganda
    '257',  // Burundi
    '258',  // Mozambique
    '260',  // Zambia
    '261',  // Madagascar
    '262',  // Réunion
    '263',  // Zimbabwe
    '264',  // Namibia
    '265',  // Malawi
    '266',  // Lesotho
    '267',  // Botswana
    '268',  // Swaziland
    '269',  // Comoros
    '290',  // Saint Helena
    '291',  // Eritrea
    '297',  // Aruba
    '298',  // Faroe Islands
    '299',  // Greenland
    '350',  // Gibraltar
    '351',  // Portugal
    '352',  // Luxembourg
    '353',  // Ireland
    '354',  // Iceland
    '355',  // Albania
    '356',  // Malta
    '357',  // Cyprus
    '358',  // Finland
    '359',  // Bulgaria
    '370',  // Lithuania
    '371',  // Latvia
    '372',  // Estonia
    '373',  // Moldova
    '374',  // Armenia
    '375',  // Belarus
    '376',  // Andorra
    '377',  // Monaco
    '378',  // San Marino
    '380',  // Ukraine
    '381',  // Serbia
    '382',  // Montenegro
    '383',  // Kosovo
    '385',  // Croatia
    '386',  // Slovenia
    '387',  // Bosnia and Herzegovina
    '389',  // North Macedonia
    '420',  // Czech Republic
    '421',  // Slovakia
    '423',  // Liechtenstein
    '500',  // Falkland Islands
    '501',  // Belize
    '502',  // Guatemala
    '503',  // El Salvador
    '504',  // Honduras
    '505',  // Nicaragua
    '506',  // Costa Rica
    '507',  // Panama
    '508',  // Saint Pierre and Miquelon
    '509',  // Haiti
    '590',  // Guadeloupe
    '591',  // Bolivia
    '592',  // Guyana
    '593',  // Ecuador
    '594',  // French Guiana
    '595',  // Paraguay
    '596',  // Martinique
    '597',  // Suriname
    '598',  // Uruguay
    '599',  // Netherlands Antilles
    '670',  // East Timor
    '672',  // Norfolk Island
    '673',  // Brunei
    '674',  // Nauru
    '675',  // Papua New Guinea
    '676',  // Tonga
    '677',  // Solomon Islands
    '678',  // Vanuatu
    '679',  // Fiji
    '680',  // Palau
    '681',  // Wallis and Futuna
    '682',  // Cook Islands
    '683',  // Niue
    '684',  // American Samoa
    '685',  // Samoa
    '686',  // Kiribati
    '687',  // New Caledonia
    '688',  // Tuvalu
    '689',  // French Polynesia
    '690',  // Tokelau
    '691',  // Micronesia
    '692',  // Marshall Islands
    '850',  // North Korea
    '852',  // Hong Kong
    '853',  // Macau
    '855',  // Cambodia
    '856',  // Laos
    '880',  // Bangladesh
    '886',  // Taiwan
    '960',  // Maldives
    '961',  // Lebanon
    '962',  // Jordan
    '963',  // Syria
    '964',  // Iraq
    '965',  // Kuwait
    '966',  // Saudi Arabia
    '967',  // Yemen
    '968',  // Oman
    '970',  // Palestine
    '971',  // United Arab Emirates
    '972',  // Israel
    '973',  // Bahrain
    '974',  // Qatar
    '975',  // Bhutan
    '976',  // Mongolia
    '977',  // Nepal
    '992',  // Tajikistan
    '993',  // Turkmenistan
    '994',  // Azerbaijan
    '995',  // Georgia
    '996',  // Kyrgyzstan
    '998',  // Uzbekistan
  ];
  
  // Check if starts with a valid country code
  const hasValidCountryCode = commonCountryCodes.some(code => digits.startsWith(code));
  
  if (!hasValidCountryCode) {
    // Don't fail validation, just warn it might be uncommon
    // This allows for valid but less common country codes
  }
  
  return { valid: true };
}

/**
 * Validate time format (HH:MM or HH:MM:SS)
 */
export function validateTime(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true };
  }
  
  // Format: HH:MM or HH:MM:SS
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  
  if (!timeRegex.test(value.trim())) {
    return { valid: false, error: 'Invalid time format. Use HH:MM or HH:MM:SS (24-hour)' };
  }
  
  return { valid: true };
}

/**
 * Validate datetime format (ISO 8601)
 */
export function validateDateTime(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true };
  }
  
  // Try to parse as Date
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date/time format' };
  }
  
  return { valid: true };
}

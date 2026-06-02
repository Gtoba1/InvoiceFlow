export interface Country {
  name: string;
  code: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  // Africa — prioritised
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'Egypt', code: 'EG', dialCode: '+20' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255' },
  { name: 'Uganda', code: 'UG', dialCode: '+256' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250' },
  { name: 'Senegal', code: 'SN', dialCode: '+221' },
  { name: "Côte d'Ivoire", code: 'CI', dialCode: '+225' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237' },
  { name: 'Angola', code: 'AO', dialCode: '+244' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263' },
  { name: 'Malawi', code: 'MW', dialCode: '+265' },
  { name: 'Botswana', code: 'BW', dialCode: '+267' },
  { name: 'Namibia', code: 'NA', dialCode: '+264' },
  { name: 'Benin', code: 'BJ', dialCode: '+229' },
  { name: 'Togo', code: 'TG', dialCode: '+228' },
  { name: 'Mali', code: 'ML', dialCode: '+223' },
  { name: 'Morocco', code: 'MA', dialCode: '+212' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213' },
  { name: 'Libya', code: 'LY', dialCode: '+218' },
  { name: 'Sudan', code: 'SD', dialCode: '+249' },
  // Americas
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
  { name: 'Argentina', code: 'AR', dialCode: '+54' },
  { name: 'Colombia', code: 'CO', dialCode: '+57' },
  // Europe
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Portugal', code: 'PT', dialCode: '+351' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Sweden', code: 'SE', dialCode: '+46' },
  { name: 'Norway', code: 'NO', dialCode: '+47' },
  { name: 'Denmark', code: 'DK', dialCode: '+45' },
  { name: 'Poland', code: 'PL', dialCode: '+48' },
  { name: 'Ireland', code: 'IE', dialCode: '+353' },
  // Middle East
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Qatar', code: 'QA', dialCode: '+974' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965' },
  // Asia Pacific
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'South Korea', code: 'KR', dialCode: '+82' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64' },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getDialCode(countryCode: string): string {
  return getCountryByCode(countryCode)?.dialCode || '';
}

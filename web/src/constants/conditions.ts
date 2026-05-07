// Single source of truth for all health-condition / vulnerability-group data.
// Import from here — never inline these lists in components.

export const STANDARD_CONDITIONS: string[] = [
  'Allergic Rhinitis',
  'Asthma',
  'Bronchiectasis',
  'Chronic Bronchitis',
  'COPD',
  'Cystic Fibrosis',
  'Emphysema',
  'Hypersensitivity Pneumonitis',
  'Pulmonary Fibrosis',
  'Sleep Apnea',
];

// Pinned at bottom of the selector (vulnerability groups)
export const VULNERABILITY_GROUPS: string[] = [
  'Child (under 12)',
  'Elderly (60+)',
  'Pregnant',
];

// Conditions that trigger stricter AQI warnings
export const SENSITIVE_CONDITIONS: string[] = [
  'Asthma',
  'COPD',
  'Elderly (60+)',
  'Child (under 12)',
  'Pregnant',
];

// Full merged list (standard + vulnerability) for convenience
export const ALL_CONDITIONS: string[] = [
  ...STANDARD_CONDITIONS,
  ...VULNERABILITY_GROUPS,
];

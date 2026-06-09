export const AUTOMOTIVE = {
  id: 'automotive',
  name: 'Automotive & Car Dealerships',
  detection_signals: ['car', 'vehicle', 'automotive', 'dealership', 'MOT', 'garage', 'car finance', 'used cars', 'new cars', 'servicing'],
  checks: [
    { id: 'motor_finance_fca', label: 'FCA authorisation (motor finance)', severity: 'high', law: 'FSMA 2000 s.21 / FCA Consumer Credit Regulations', category: 'sector_specific', jurisdictions: ['uk'], conditional: true, condition_flag: 'takes_payments', guidance: 'If arranging car finance, must display FCA authorisation. Look for "FCA regulated" or reference number.' },
    { id: '30_day_rejection_right', label: '30-day right to reject (used cars)', severity: 'high', law: 'Consumer Rights Act 2015 s.48C', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Consumers have 30 days to reject faulty used cars. Look for "30-day" or "right to reject" in T&Cs.' },
    { id: 'used_car_disclosure', label: 'Used car pre-purchase information', severity: 'high', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'For used cars, must disclose: mileage, service history, previous owners, accident history, MOT status.' },
    { id: 'distance_selling_automotive', label: 'Distance selling cancellation rights (if online)', severity: 'high', law: 'Consumer Contracts Regulations 2013', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Online car sales have 14-day cancellation rights. Look for cancellation policy or "14-day" in T&Cs.' },
    { id: 'warranty_terms', label: 'Warranty & after-sales terms', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must state warranty period and coverage. Look for "warranty" duration or coverage details.' },
    { id: 'pricing_transparency_automotive', label: 'Price transparency (RRP vs dealer pricing)', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Prices must include all mandatory charges. Look for full price upfront or itemized costs.' },
    { id: 'vehicle_safety_info', label: 'Vehicle safety & compliance information', severity: 'medium', law: 'Road Traffic Act 1988', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should disclose vehicle safety specs or emissions compliance. Look for safety features or "Euro" standard.' }
  ]
};

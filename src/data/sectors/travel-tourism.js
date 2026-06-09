export const TRAVEL_TOURISM = {
  id: 'travel-tourism',
  name: 'Travel & Tourism',
  detection_signals: ['holiday', 'travel', 'tour', 'flight', 'hotel', 'booking', 'vacation', 'cruise', 'ATOL', 'ABTA'],
  checks: [
    { id: 'atol_protection', label: 'ATOL protection (if package holidays)', severity: 'high', law: 'Package Travel and Linked Travel Arrangements Regulations 2018 / ATOL scheme', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If selling package holidays, must display ATOL licence. Look for "ATOL protected" or ATOL certificate badge.' },
    { id: 'abta_membership', label: 'ABTA membership (travel agents)', severity: 'medium', law: 'ABTA Code of Conduct', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Travel agents should be ABTA members. Look for "ABTA member" or membership badge.' },
    { id: 'package_travel_info', label: 'Package travel pre-contract info', severity: 'high', law: 'Package Travel and Linked Travel Arrangements Regulations 2018', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Package holidays must include pre-purchase info: destination, dates, accommodation, meals, activities, price.' },
    { id: 'cancellation_travel_policy', label: 'Cancellation and refund policy', severity: 'high', law: 'Package Travel Regulations 2018 / Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Clear cancellation deadlines and refund terms must be stated. Look for cancellation policy.' },
    { id: 'price_breakdown_travel', label: 'Price breakdown (base + extras + taxes)', severity: 'medium', law: 'Consumer Contracts Regulations 2013', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Prices must show all components. Look for price breakdowns on booking pages.' },
    { id: 'travel_insurance_disclosure', label: 'Travel insurance disclosure', severity: 'medium', law: 'Insurance Distribution Directive', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If offering travel insurance, must be optional and clearly disclosed.' },
    { id: 'travel_documentation_guidance', label: 'Travel documentation & visa guidance', severity: 'low', law: 'Consumer Rights Act 2015 / Good Practice', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Best practice to disclose visa/passport requirements. Look for destination guides or documentation info.' }
  ]
};

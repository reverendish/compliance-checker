export const CONSTRUCTION_TRADES = {
  id: 'construction-trades',
  name: 'Construction & Trades',
  detection_signals: ['builder', 'contractor', 'plumber', 'electrician', 'gas', 'construction', 'renovation', 'roofing', 'tradesman', 'Gas Safe'],
  checks: [
    { id: 'gas_safe_registration', label: 'Gas Safe Register certification', severity: 'high', law: 'Gas Safety (Installation and Use) Regulations 1998', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Any gas work requires Gas Safe registration. Look for "Gas Safe registered" or registration number.' },
    { id: 'niceic_registration', label: 'NICEIC / NAPIT electrical registration', severity: 'high', law: 'Building Regulations / Competent Person Schemes', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Electrical installers should be NICEIC or NAPIT registered. Look for certification badge or registration number.' },
    { id: 'public_liability_insurance', label: 'Public liability insurance evidence', severity: 'high', law: 'Consumer Rights Act 2015 / Good Practice', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Tradespeople should have public liability insurance. Look for insurance certificate link or provider name.' },
    { id: 'competent_person_scheme', label: 'Competent Person Scheme certification', severity: 'high', law: 'Building Regulations 2016 / Competent Person Schemes', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'For work requiring Building Regulations sign-off, must be Competent Person registered. Look for scheme badge or registration number.' },
    { id: 'hse_compliance_statement', label: 'HSE/Health & Safety compliance', severity: 'medium', law: 'Health and Safety at Work etc. Act 1974', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should state compliance with health & safety standards. Look for H&S compliant statement or safety policy.' },
    { id: 'guarantees_warranties', label: 'Work guarantees & warranties offered', severity: 'medium', law: 'Supply of Goods and Services Act 1982', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should offer work guarantees. Look for "guarantee", warranty terms, or defect remedy clauses.' },
    { id: 'pricing_transparency', label: 'Transparent pricing & quotes', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must offer transparent pricing and quotes. Look for quote request process or price ranges.' },
    { id: 'dbs_check_clearance', label: 'DBS check clearance (if home access)', severity: 'high', law: 'Safeguarding requirements / DBS scheme', category: 'sector_specific', jurisdictions: ['uk'], conditional: true, condition_flag: 'may_process_children_data', guidance: 'Tradespeople accessing homes with children should have DBS clearance. Look for DBS badge.' }
  ]
};

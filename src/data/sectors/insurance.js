export const INSURANCE = {
  id: 'insurance',
  name: 'Insurance',
  detection_signals: ['insurance', 'policy', 'cover', 'premium', 'claim', 'underwriter', 'broker', 'indemnity', 'FCA regulated'],
  checks: [
    { id: 'fca_insurance_authorisation', label: 'FCA authorisation (insurance intermediary)', severity: 'high', law: 'FSMA 2000 s.21 / Insurance Distribution Directive (UK retained)', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Insurance brokers/intermediaries must display FCA authorisation. Look for "FCA regulated" or FCA reference number.' },
    { id: 'insurance_product_information', label: 'Insurance Product Information Documents (IPID)', severity: 'high', law: 'Insurance Distribution Directive', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'For regulated insurance products, IPIDs must be provided. Look for "IPID" or "Product Information".' },
    { id: 'ipt_disclosure', label: 'Insurance Premium Tax (IPT) disclosure', severity: 'medium', law: 'Finance Act 1994', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If IPT is charged, must be clearly shown in price breakdown. Look for "IPT" or "Insurance Premium Tax".' },
    { id: 'complaints_insurance', label: 'Complaints procedure & Financial Ombudsman', severity: 'medium', law: 'FCA COBS 2.1R', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain complaints handling and reference Financial Ombudsman Service.' },
    { id: 'renewal_transparency', label: 'Renewal terms & price transparency', severity: 'high', law: 'Insurance Distribution Directive', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Renewal terms and prices must be clear before auto-renewal. Look for renewal notice templates.' },
    { id: 'data_protection_insurance', label: 'Data security & privacy statement', severity: 'high', law: 'UK GDPR / FCA rules', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain how customer data is protected. Look for privacy policy or data security statement.' },
    { id: 'claims_process_transparency', label: 'Claims process clearly documented', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain how to make claims. Look for "How to claim" page or claims procedure.' }
  ]
};

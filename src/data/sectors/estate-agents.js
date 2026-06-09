export const ESTATE_AGENTS = {
  id: 'estate-agents',
  name: 'Estate Agents',
  detection_signals: ['estate agent', 'property for sale', 'buy property', 'house for sale', 'lettings', 'SSTC', 'property search', 'NAEA', 'Propertymark'],
  checks: [
    { id: 'property_ombudsman_membership', label: 'Property Ombudsman / TPOS membership', severity: 'high', law: 'Estate Agents Act 1979', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Estate agents must be members of a redress scheme. Look for ombudsman badge, membership number, or scheme statement.' },
    { id: 'aml_policy', label: 'Anti-money laundering policy', severity: 'high', law: 'AML Regulations 2017', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Estate agents are money laundering supervisors. Look for an AML Policy or Money Laundering Reporting Officer section.' },
    { id: 'naea_membership', label: 'NAEA / Propertymark membership', severity: 'medium', law: 'Estate Agents Act 1979', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Many agents are members of professional bodies. Look for "NAEA member" or "Propertymark registered" badges.' },
    { id: 'material_information_disclosure', label: 'Material information disclosed', severity: 'high', law: 'Consumer Protection from Unfair Trading 2008 / Estate Agents Act 1979', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'All material information about properties must be disclosed. Look for comprehensive property descriptions.' },
    { id: 'fees_transparency', label: 'Fees and charges clearly stated', severity: 'high', law: 'Estate Agents Act 1979 s.18', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Fees must be published before engagement. Look for fees page or commission statements.' },
    { id: 'client_money_protection', label: 'Client money handling & protection', severity: 'high', law: 'Estate Agents Act 1979', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Agents must explain how client money is protected. Look for "client account" or "trust account" references.' },
    { id: 'complaints_procedure', label: 'Complaints procedure published', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain how complaints are handled and reference the ombudsman.' }
  ]
};

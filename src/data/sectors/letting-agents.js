export const LETTING_AGENTS = {
  id: 'letting-agents',
  name: 'Letting Agents',
  detection_signals: ['letting agent', 'to let', 'rental', 'tenant', 'landlord', 'tenancy', 'ARLA', 'deposit', 'rent'],
  checks: [
    { id: 'client_money_protection', label: 'Client Money Protection scheme', severity: 'high', law: 'Estate Agents Act 1979', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'All letting agents must hold client money in a Client Money Protection scheme. Look for scheme name/badge.' },
    { id: 'tenant_fees_act_compliance', label: 'Tenant Fees Act 2019 compliance', severity: 'high', law: 'Tenant Fees Act 2019', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Most fees to tenants are banned. Look for "no upfront fees" or compliant fee structures.' },
    { id: 'how_to_rent_guide', label: '"How to Rent" guide provided', severity: 'high', law: 'Housing Act 2004 s.150A', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Agents must provide the statutory "How to Rent" guide to tenants. Look for guide download link.' },
    { id: 'arla_membership', label: 'ARLA / Propertymark membership', severity: 'high', law: 'Redress Schemes for Lettings Agency Work in England Regs 2013', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Letting agents must be members of an approved redress scheme. Look for scheme badge or membership statement.' },
    { id: 'deposit_scheme_membership', label: 'Deposit protection scheme membership', severity: 'high', law: 'Housing Act 2004 s.213-215', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If agents handle deposits, must use an authorized scheme. Look for scheme name or logo.' },
    { id: 'prescribed_information', label: 'Prescribed deposit information provided', severity: 'high', law: 'Housing Act 2004 s.213-215', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Agents must provide prescribed information to tenants. Look for deposit protection detail statements.' },
    { id: 'landlord_insurance_disclosure', label: 'Landlord insurance / legal compliance', severity: 'medium', law: 'Housing Act 2004', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Agents should disclose landlord responsibilities and insurance requirements.' },
    { id: 'complaints_procedure', label: 'Complaints procedure published', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain complaints process and reference the redress scheme.' }
  ]
};

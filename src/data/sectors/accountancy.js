export const ACCOUNTANCY = {
  id: 'accountancy',
  name: 'Accountancy & Tax Services',
  detection_signals: ['accountant', 'accounting', 'bookkeeping', 'tax return', 'HMRC', 'ICAEW', 'ACCA', 'payroll', 'VAT return', 'audit'],
  checks: [
    { id: 'professional_body_membership', label: 'Professional body membership (ICAEW/ACCA)', severity: 'high', law: 'Accountancy professional body requirements', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Accountants should be members of recognized bodies (ICAEW, ACCA, CIMA, AAT). Look for membership badge.' },
    { id: 'aml_accountancy_policy', label: 'Anti-money laundering (AML) policy', severity: 'high', law: 'AML Regulations 2017', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Accountants are supervised entities under AML regs. Look for "AML policy" or "anti-money laundering".' },
    { id: 'hmrc_agent_registration', label: 'HMRC Agent registration', severity: 'high', law: 'HMRC / Tax Agents Ethics Standard', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If providing tax agent services, must be HMRC registered. Look for "HMRC registered agent" or registration number.' },
    { id: 'pi_insurance_accountancy', label: 'Professional indemnity insurance', severity: 'high', law: 'Professional body requirements', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must have professional indemnity insurance and disclose it. Look for insurance provider name or coverage amount.' },
    { id: 'client_money_accountancy', label: 'Client money handling & segregation', severity: 'high', law: 'AML Regulations 2017', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If handling client money, must segregate it. Look for "segregated client accounts".' },
    { id: 'confidentiality_statement', label: 'Confidentiality & GDPR compliance', severity: 'high', law: 'UK GDPR / AML Regulations 2017', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must reference client confidentiality and GDPR compliance. Look for privacy policy or data protection statement.' },
    { id: 'fees_transparency_accountancy', label: 'Fees and services clearly stated', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must clearly state fees before engagement. Look for fee structure or pricing page.' }
  ]
};

export const LEGAL_SERVICES = {
  id: 'legal-services',
  name: 'Legal Services',
  detection_signals: ['solicitor', 'barrister', 'legal advice', 'law firm', 'conveyancing', 'litigation', 'legal services', 'SRA', 'regulated'],
  checks: [
    { id: 'sra_authorisation', label: 'SRA authorisation displayed', severity: 'high', law: 'Legal Services Act 2007 / SRA Handbook', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Law firms must display SRA authorisation. Look for "SRA authorised", firm name, SRA reference number, or link to SRA register.' },
    { id: 'bsb_barrister', label: 'Bar Standards Board registration (barristers)', severity: 'high', law: 'Bar Standards Board Code of Conduct', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Barristers must display BSB registration. Look for "BSB registered" or link to BSB register.' },
    { id: 'complaints_procedure', label: 'Complaints procedure published', severity: 'high', law: 'SRA Code of Conduct / Legal Services Act 2007', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Law firms must publish a complaints procedure explaining how clients can complain and reference to the Legal Ombudsman.' },
    { id: 'legal_costs_transparency', label: 'Legal costs & fees clearly stated', severity: 'high', law: 'SRA Transparency Rules', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Solicitors must clearly disclose fees, hourly rates, and cost structures before engagement. Look for a Fees page.' },
    { id: 'professional_indemnity_disclosure', label: 'Professional indemnity insurance disclosed', severity: 'high', law: 'SRA Indemnity Insurance Rules', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Law firms must have professional indemnity insurance and disclose it. Look for insurance provider name or coverage limits.' },
    { id: 'reserved_activities_notice', label: 'Reserved legal activities clearly identified', severity: 'medium', law: 'Legal Services Act 2007 s.13', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Reserved activities must be clearly identified. If offering these, must be clear the firm is SRA-regulated.' },
    { id: 'client_money_protection', label: 'Client money handling disclosed', severity: 'high', law: 'SRA Code of Conduct / Client Money Rules', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If handling client money, firms must explain safeguards. Look for "segregated client accounts" or similar.' },
    { id: 'data_protection_special_category', label: 'Special category data protection notice', severity: 'high', law: 'UK GDPR Art. 9 / SRA Handbook', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Legal services process sensitive data. Privacy policy must explicitly address special category data.' }
  ]
};

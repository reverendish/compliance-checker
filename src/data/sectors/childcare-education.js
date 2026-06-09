export const CHILDCARE_EDUCATION = {
  id: 'childcare-education',
  name: 'Childcare & Education',
  detection_signals: ['nursery', 'childcare', 'school', 'tutor', 'children', 'Ofsted', 'EYFS', 'safeguarding', 'DBS', 'educational'],
  checks: [
    { id: 'ofsted_registration', label: 'Ofsted registration displayed', severity: 'high', law: 'Childcare Act 2006', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Childcare providers must be Ofsted registered. Look for "Ofsted registered", registration number, or rating.' },
    { id: 'safeguarding_policy', label: 'Safeguarding policy published', severity: 'high', law: 'Safeguarding Vulnerable Groups Act 2006', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must have a safeguarding policy protecting children. Look for "Safeguarding Policy" or "Child Protection Policy".' },
    { id: 'dbs_check_statement', label: 'DBS check statement for staff', severity: 'high', law: 'Safeguarding Vulnerable Groups Act 2006', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must confirm all staff have DBS checks. Look for "DBS checked" or "all staff vetted".' },
    { id: 'eyfs_compliance', label: 'EYFS compliance (if under 5s)', severity: 'high', law: 'Childcare Act 2006 / EYFS framework', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If providing early years childcare, must follow EYFS. Look for "EYFS compliant".' },
    { id: 'child_protection_contact', label: 'Safeguarding/child protection contact', severity: 'high', law: 'Childcare Act 2006', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must publish safeguarding officer contact details. Look for "Safeguarding Officer" contact.' },
    { id: 'parental_involvement', label: 'Parental communication & involvement', severity: 'medium', law: 'Childcare Act 2006 / EYFS framework', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should explain how parents are involved in their child\'s care. Look for parental involvement policy.' },
    { id: 'child_data_protection', label: 'Child data protection & privacy policy', severity: 'high', law: 'UK GDPR / Childcare Act 2006', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Privacy policy must address how children\'s data is protected.' },
    { id: 'staff_qualifications', label: 'Staff qualifications disclosed', severity: 'medium', law: 'Childcare Act 2006 / EYFS framework', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should state staff qualifications/certifications. Look for "qualified staff" or qualification levels.' }
  ]
};

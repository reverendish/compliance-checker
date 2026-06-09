export const RECRUITMENT = {
  id: 'recruitment',
  name: 'Recruitment & Employment',
  detection_signals: ['recruitment', 'jobs', 'vacancies', 'staffing', 'agency', 'candidates', 'hiring', 'employment agency', 'temp agency'],
  checks: [
    { id: 'employment_agency_act_compliance', label: 'Employment Agencies Act 1973 compliance', severity: 'high', law: 'Employment Agencies Act 1973', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Recruitment agencies must comply with the Act. Look for compliance statement or license info.' },
    { id: 'awr_compliance', label: 'Agency Workers Regulations (AWR) 2010', severity: 'high', law: 'Agency Workers Regulations 2010', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Agencies must comply with AWR rules. Look for AWR compliance statement or worker rights disclosure.' },
    { id: 'rec_membership', label: 'REC membership (Recruitment & Employment Confederation)', severity: 'medium', law: 'Recruitment & Employment Confederation Code of Practice', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Reputable agencies are REC members. Look for "REC member" badge or registration link.' },
    { id: 'candidate_data_retention', label: 'Candidate data retention policy', severity: 'high', law: 'UK GDPR / Data Protection Act 2018', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain how long candidate data is retained. Look for "data retention" or GDPR compliance statement.' },
    { id: 'fee_transparency_recruitment', label: 'Placement fees clearly stated', severity: 'high', law: 'Employment Agencies Act 1973', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Agency fees must be transparent. Look for "fees", "commission", or "no fee to candidates".' },
    { id: 'worker_rights_disclosure', label: 'Worker rights & contract terms', severity: 'high', law: 'Employment Agencies Act 1973', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain worker rights, contract terms, and payment. Look for "worker rights" information.' },
    { id: 'complaints_recruitment', label: 'Complaints procedure', severity: 'medium', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain how candidates/workers can complain. Look for "Complaints" section.' }
  ]
};

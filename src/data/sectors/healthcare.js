export const HEALTHCARE = {
  id: 'healthcare',
  name: 'Healthcare & Medical Services',
  detection_signals: ['patient', 'clinic', 'medical', 'doctor', 'GP', 'treatment', 'health', 'therapy', 'prescription', 'NHS'],
  checks: [
    { id: 'cqc_registration', label: 'CQC registration displayed', severity: 'high', law: 'Health and Social Care Act 2008 (Regulated Activities) Regs 2014', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Healthcare providers must be registered with the Care Quality Commission. Look for CQC logo, registration number, or link to CQC profile.' },
    { id: 'medicine_advertising_compliance', label: 'Medicine advertising rules complied with', severity: 'high', law: 'Medicines Act 1968 / MHRA', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If advertising medicines, follow MHRA rules: no making prescription-only medicines sound like you can buy them, no exaggerated health claims.' },
    { id: 'healthcare_claims', label: 'Health claims substantiated', severity: 'high', law: 'Human Medicines Regulations 2012 / MHRA', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Health claims must be substantiated by evidence. Look for absolute claims without backing.' },
    { id: 'gphc_registration', label: 'GPhC registration (if online pharmacy)', severity: 'high', law: 'General Pharmaceutical Council (GPhC) registration', category: 'sector_specific', jurisdictions: ['uk'], conditional: true, condition_flag: 'processes_special_category_data', guidance: 'Online pharmacies must display GPhC registration. Look for GPhC logo, registration number, or pharmacy name.' },
    { id: 'professional_registration', label: 'Healthcare professional registration transparent', severity: 'high', law: 'HCPC / NMC / GMC registration', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Practitioners must display their professional registration. Look for registration numbers or badges.' },
    { id: 'data_confidentiality', label: 'Patient data confidentiality assurance', severity: 'high', law: 'UK GDPR / NHS Data Security Protection Toolkit', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Healthcare sites must reference confidentiality/privacy. Look for privacy policy or data protection statements.' },
    { id: 'regulatory_notices', label: 'Regulatory approval notices', severity: 'medium', law: 'MHRA / CQC / Medicines Act', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If offering regulated treatments/products, display relevant approvals. Look for MHRA approval notices or CE marks.' }
  ]
};

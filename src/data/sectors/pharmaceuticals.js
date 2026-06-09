export const PHARMACEUTICALS = {
  id: 'pharmaceuticals',
  name: 'Pharmaceuticals & Online Pharmacies',
  detection_signals: ['pharmacy', 'medicine', 'prescription', 'medication', 'drug', 'pharmaceutical', 'GPhC', 'dispensing', 'online pharmacy'],
  checks: [
    { id: 'mhra_pharmacy_logo', label: 'MHRA internet pharmacy logo displayed', severity: 'high', law: 'Human Medicines Regulations 2012 / MHRA guidance', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Online pharmacies must display the MHRA logo. Look for MHRA badge or pharmacy identification mark.' },
    { id: 'gphc_registration_number', label: 'GPhC registration number & details', severity: 'high', law: 'General Pharmaceutical Council (GPhC) registration', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must display GPhC registration. Look for GPhC number or link to GPhC register.' },
    { id: 'prescription_medicine_rules', label: 'Prescription-only medicine rules observed', severity: 'high', law: 'Human Medicines Regulations 2012 / Medicines Act 1968', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'POM (prescription-only medicines) cannot be sold online. Look for clear labeling of POMs.' },
    { id: 'pharmacy_superintendent', label: 'Superintendent Pharmacist details', severity: 'high', law: 'Human Medicines Regulations 2012 / GPhC requirements', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must display superintendent pharmacist name and qualifications. Look for "Superintendent Pharmacist" name.' },
    { id: 'medicines_advertising_compliance', label: 'Medicines advertising compliance', severity: 'high', law: 'Medicines Act 1968 / MHRA Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Medicine claims must follow MHRA rules. Look for no therapeutic claims on POM adverts.' },
    { id: 'medicine_safety_info', label: 'Medicine safety information & leaflets', severity: 'high', law: 'Human Medicines Regulations 2012', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must provide patient information leaflets (PIL). Look for downloadable leaflets or safety information.' },
    { id: 'consultation_availability', label: 'Pharmacist consultation availability', severity: 'medium', law: 'GPhC standards for internet pharmacy', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Online pharmacies should offer pharmacist consultation. Look for "speak to pharmacist" or consultation contact.' }
  ]
};

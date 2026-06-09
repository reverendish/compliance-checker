export const COSMETICS = {
  id: 'cosmetics',
  name: 'Cosmetics & Beauty',
  detection_signals: ['cosmetic', 'beauty', 'skincare', 'makeup', 'fragrance', 'haircare', 'salon', 'serum', 'cream', 'beauty products'],
  checks: [
    { id: 'responsible_person_cosmetics', label: 'Responsible Person details disclosed', severity: 'high', law: 'UK Cosmetics Regulation (Retained EU Reg 1223/2009)', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Cosmetics manufacturers must appoint a UK Responsible Person. Look for name and address.' },
    { id: 'scpn_notification', label: 'SCPN notification confirmation', severity: 'medium', law: 'UK Cosmetics Regulation', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Cosmetics must be notified to the SCPN portal. Look for "SCPN registered" or compliance statement.' },
    { id: 'ingredient_labelling', label: 'Ingredient labelling (INCI names)', severity: 'high', law: 'UK Cosmetics Regulation Annex IV-VI', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Products must list ingredients in INCI format. Look for ingredient lists on product pages.' },
    { id: 'safety_assessment_cosmetics', label: 'Safety assessment / product safety data', severity: 'high', law: 'UK Cosmetics Regulation Art. 15', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Products must have safety assessment. Look for "safety assessed" or "dermatologically tested".' },
    { id: 'claims_substantiation_cosmetics', label: 'Claims substantiation (not medicinal)', severity: 'high', law: 'UK Cosmetics Regulation', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Cannot make medicinal claims. Can claim cosmetic benefits if substantiated. Look for exaggerated health claims.' },
    { id: 'warning_statements', label: 'Required warning statements', severity: 'medium', law: 'UK Cosmetics Regulation', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Products may need warnings like "for external use only". Look for warning statements.' },
    { id: 'animal_testing_statement', label: 'Animal testing declaration', severity: 'medium', law: 'UK Cosmetics Regulation Art. 18', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should declare if animal-tested or cruelty-free. Look for "cruelty-free" or animal testing statement.' }
  ]
};

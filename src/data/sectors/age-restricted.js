export const AGE_RESTRICTED = {
  id: 'age-restricted',
  name: 'Age-Restricted Goods & Services',
  detection_signals: ['alcohol', 'wine', 'beer', 'spirits', 'tobacco', 'vape', 'e-cigarette', 'knife', 'adult', 'over 18'],
  checks: [
    { id: 'age_verification_gate', label: 'Age verification gate (18+)', severity: 'high', law: 'Licensing Act 2003 / Age Verification and Assurance Act 2023', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If selling age-restricted goods, must gate with age verification before access. Look for age gate or date of birth field.' },
    { id: 'challenge_25_policy', label: '"Challenge 25" policy stated', severity: 'high', law: 'Licensing Act 2003 / Best practice', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Best practice is "Challenge 25" policy. Look for "Challenge 25" statement or "proof of age" requirement.' },
    { id: 'age_restricted_delivery_policy', label: 'Age-restricted delivery & signature required', severity: 'high', law: 'Licensing Act 2003 / Distance Selling Regs', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If delivering, must verify recipient age at delivery. Look for "ID required on delivery" statement.' },
    { id: 'tobacco_regulations', label: 'Tobacco Regulations compliance', severity: 'high', law: 'Tobacco and Related Products Regulations 2016', category: 'sector_specific', jurisdictions: ['uk'], conditional: true, condition_flag: 'restricted_goods', guidance: 'If selling tobacco: packaging must follow regulations, cannot advertise health benefits. Look for compliance statement.' },
    { id: 'avaa_2023_compliance', label: 'Age Verification & Assurance Act 2023 compliance', severity: 'high', law: 'Age Verification and Assurance Act 2023', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'For online age-restricted sales, should use robust age verification. Look for certified age verification providers mention.' },
    { id: 'restricted_product_list', label: 'Clear product categorization (restricted goods)', severity: 'medium', law: 'Licensing Act 2003', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Products must be clearly marked. Look for "18+" badges or product type identification.' },
    { id: 'health_warnings', label: 'Health warnings displayed', severity: 'high', law: 'Tobacco Regulations / Licensing Act 2003', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Tobacco/alcohol must show health warnings. Look for "smoking kills" or alcohol units/calorie info.' }
  ]
};

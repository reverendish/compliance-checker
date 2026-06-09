export const CHARITIES = {
  id: 'charities',
  name: 'Charities & Fundraising',
  detection_signals: ['charity', 'donate', 'donation', 'registered charity', 'nonprofit', 'fundraising', 'gift aid', 'charitable'],
  checks: [
    { id: 'charity_number', label: 'Charity registration number displayed', severity: 'high', law: 'Charities Act 2022', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Registered charities must display their charity number (8 digits). Look for "Charity number" or "Registered charity number" in footer.' },
    { id: 'fundraising_regulator', label: 'Fundraising Regulator registration', severity: 'medium', law: 'Fundraising Regulator Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Charities fundraising should be registered with Fundraising Regulator. Look for regulator badge or compliance statement.' },
    { id: 'gift_aid_declaration', label: 'Gift Aid declaration clarity', severity: 'medium', law: 'Charities Act 2022 / Gift Aid rules', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If promoting Gift Aid, must explain eligibility (UK taxpayers only). Look for Gift Aid checkbox with clear explanation.' },
    { id: 'trustee_transparency', label: 'Trustees and governance details', severity: 'high', law: 'Charities Act 2022', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should disclose trustee names/roles and governance structure. Look for trustee list or link to Charity Commission record.' },
    { id: 'charitable_purposes_stated', label: 'Charitable purposes clearly stated', severity: 'high', law: 'Charities Act 2022', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must clearly state what the charity does. Look for mission statement or objectives page.' },
    { id: 'financial_accountability', label: 'Accounts and financial transparency', severity: 'high', law: 'Charities Act 2022', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should publish annual accounts or link to Charity Commission record.' },
    { id: 'donation_security', label: 'Secure donation mechanisms', severity: 'high', law: 'Payment Card Industry / Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If taking donations online, must use secure payment (HTTPS, recognized processors).' },
    { id: 'privacy_donor_data', label: 'Donor privacy & data protection', severity: 'high', law: 'UK GDPR / Charities Act 2022', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Privacy policy must explain how donor data is used and protected.' }
  ]
};

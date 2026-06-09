export const GAMBLING = {
  id: 'gambling',
  name: 'Gambling & Betting',
  detection_signals: ['casino', 'bet', 'gamble', 'slots', 'poker', 'odds', 'wagering', 'sports betting', 'bingo', 'lottery'],
  checks: [
    { id: 'gambling_commission_licence', label: 'Gambling Commission licence displayed', severity: 'high', law: 'Gambling Act 2005', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'UK operators must display Gambling Commission licence. Look for "Licensed by Gambling Commission" or licence number.' },
    { id: 'gamstop_integration', label: 'GamStop self-exclusion scheme offered', severity: 'high', law: 'LCCP Social Responsibility Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Operators must offer access to GamStop. Look for "GamStop" or "Self-Exclusion" in Responsible Gambling section.' },
    { id: 'safer_gambling_tools', label: 'Safer gambling tools (limits, timeout)', severity: 'high', law: 'Gambling Commission Licence Conditions', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must offer deposit limits, time-outs, and reality checks. Look for these tools mentioned.' },
    { id: 'age_verification_gambling', label: 'Age verification & age-gating', severity: 'high', law: 'Gambling Act 2005 / Age Verification and Assurance Act 2023', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must verify user age (18+). Look for age gate on entry or age verification during signup.' },
    { id: 'responsible_gambling_links', label: 'BeGambleAware & responsible gambling info', severity: 'high', law: 'Gambling Commission Licence Conditions', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must link to BeGambleAware and provide support info. Look for helpline numbers or resources.' },
    { id: 'odds_bet_rules_transparency', label: 'Odds and bet rules clearly stated', severity: 'medium', law: 'Gambling Act 2005', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Rules for odds, settlement, and bet acceptance must be clear. Look for odds explanation or bet rules.' },
    { id: 'fund_safety_guarantee', label: 'Funds protection guarantee', severity: 'high', law: 'Gambling Commission Licence Conditions', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Operators must explain how customer funds are protected. Look for "funds segregated" statements.' },
    { id: 'complaints_gambling', label: 'Complaints and dispute resolution', severity: 'medium', law: 'Gambling Commission / ADR Regulations 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain complaints procedure and reference the Gambling Commission. Look for Complaints page.' }
  ]
};

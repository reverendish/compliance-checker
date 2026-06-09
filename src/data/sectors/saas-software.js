export const SAAS_SOFTWARE = {
  id: 'saas-software',
  name: 'SaaS & Software',
  detection_signals: ['software', 'SaaS', 'subscription', 'API', 'platform', 'dashboard', 'app', 'free trial', 'pricing plans', 'enterprise'],
  checks: [
    { id: 'dpa_processor_agreement', label: 'Data Processor Agreement (DPA) available', severity: 'high', law: 'UK GDPR Art. 28', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'If processing customer data, must offer a Data Processing Agreement. Look for "DPA" or "Data Processing Addendum".' },
    { id: 'saas_cancellation_policy', label: 'Cancellation & exit terms clearly stated', severity: 'high', law: 'Consumer Contracts Regulations 2013 (B2C)', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'B2C SaaS must allow easy cancellation (14-day cooling off). Look for "cancel" or "unsubscribe".' },
    { id: 'uptime_sla_transparency', label: 'Uptime/SLA transparency', severity: 'medium', law: 'Consumer Contracts Regulations 2013', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should disclose service availability/uptime guarantees. Look for "SLA" or "uptime" percentage.' },
    { id: 'data_portability_saas', label: 'Data portability & export options', severity: 'high', law: 'UK GDPR Art. 20', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Users have a right to export their data in a portable format. Look for "export data" or "download data".' },
    { id: 'ai_transparency_notice', label: 'AI transparency (if using AI features)', severity: 'high', law: 'UK AI Bill (proposed) / Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], conditional: true, condition_flag: 'has_user_generated_content', guidance: 'If using AI, must disclose this. Look for "AI", "machine learning", or AI feature disclosure.' },
    { id: 'security_statement_saas', label: 'Data security & encryption statement', severity: 'high', law: 'UK GDPR Art. 32', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain security measures. Look for "encrypted", "SSL", "two-factor authentication".' },
    { id: 'pricing_transparency_saas', label: 'Transparent pricing & no hidden fees', severity: 'high', law: 'Consumer Rights Act 2015 / DMCC Act 2024', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Pricing must be clear upfront, including all compulsory charges. Look for clear pricing table.' },
    { id: 'free_trial_terms', label: 'Free trial terms (if offered)', severity: 'medium', law: 'Consumer Contracts Regulations 2013', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Free trials must have clear conversion/cancellation terms. Look for trial duration or cancel option.' }
  ]
};

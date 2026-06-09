export const UNIVERSAL_CHECKS = [
  {
    id: 'cookie_banner',
    label: 'Cookie consent banner',
    severity: 'high',
    law: 'PECR 2003 reg. 6',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'Look for a cookie consent banner or notice that appears on page load. Must offer a way to accept or reject non-essential cookies. A banner that only has "OK" with no reject option is non-compliant. Check for OneTrust, Cookiebot, or custom banner implementations in the HTML.'
  },
  {
    id: 'privacy_policy',
    label: 'Privacy policy present',
    severity: 'high',
    law: 'UK GDPR Art. 13',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'Look for a link to a privacy policy in the footer, navigation, or as a standalone page. The link text may be "Privacy Policy", "Privacy Notice", "Data Protection", or similar. Check page links for hrefs containing "privacy".'
  },
  {
    id: 'cookie_policy',
    label: 'Cookie policy present',
    severity: 'medium',
    law: 'PECR 2003',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'Look for a dedicated cookie policy page or section. May be combined with the privacy policy. Check for links containing "cookie" in the href or anchor text. A PECR-compliant cookie policy lists which cookies are used, their purpose, and duration.'
  },
  {
    id: 'data_controller',
    label: 'Data controller identified',
    severity: 'high',
    law: 'UK GDPR Art. 13(1)(a)',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'The privacy policy or footer must name the data controller (the company or individual responsible for the data). Look for the company name alongside data protection language. "We are the data controller" or similar phrasing in the privacy policy counts.'
  },
  {
    id: 'lawful_basis',
    label: 'Lawful basis for processing stated',
    severity: 'high',
    law: 'UK GDPR Art. 6 / Art. 13(1)(c)',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'The privacy policy must state the lawful basis for processing personal data (e.g. consent, legitimate interests, contract performance). Look for explicit mention of legal bases in the privacy policy text. If the privacy policy page is not in the scraped content, check if a link to it exists.'
  },
  {
    id: 'dsar_rights',
    label: 'Data subject rights explained',
    severity: 'medium',
    law: 'UK GDPR Art. 15-22',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'Look for mention of data subject rights in the privacy policy: right to access, rectification, erasure, restriction, portability, objection. The full list need not appear but at least some rights should be mentioned. Check for phrases like "your rights", "access your data", "right to erasure".'
  },
  {
    id: 'third_party_sharing',
    label: 'Third-party data sharing disclosed',
    severity: 'medium',
    law: 'UK GDPR Art. 13(1)(e)',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'The privacy policy must disclose whether personal data is shared with third parties and who they are (or categories of recipients). Look for sections about "sharing", "third parties", "partners", "processors".'
  },
  {
    id: 'marketing_consent',
    label: 'Marketing consent mechanism',
    severity: 'high',
    law: 'PECR 2003 reg. 22',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'If the site has email signup forms, contact forms, or checkout, look for an opt-in checkbox for marketing emails. Pre-ticked boxes are non-compliant. "By submitting you agree to receive marketing" buried in small print is non-compliant. If no forms are visible in the HTML, mark as null (cannot determine).'
  },
  {
    id: 'ico_registration',
    label: 'ICO registration number',
    severity: 'medium',
    law: 'DPA 2018 s.61',
    category: 'data_protection',
    jurisdictions: ['uk'],
    guidance: 'Look for an ICO registration number, typically in the format ZA followed by 6 digits (e.g. ZA123456) or a number starting with Z. Usually found in the footer or privacy policy. Some sites link to the ICO register instead of displaying the number directly.'
  },
  {
    id: 'dpo_contact',
    label: 'DPO contact details',
    severity: 'medium',
    law: 'UK GDPR Art. 37',
    category: 'data_protection',
    jurisdictions: ['uk'],
    conditional: true,
    condition_flag: 'processes_special_category_data',
    guidance: 'Only evaluate if the site appears to process special category data (health, financial, children\'s data). Look for a Data Protection Officer contact email or name in the privacy policy. Mark null if there is no evidence the site is required to have a DPO.'
  },
  {
    id: 'https',
    label: 'HTTPS / SSL',
    severity: 'high',
    law: 'UK GDPR Art. 32',
    category: 'security_company',
    jurisdictions: ['uk'],
    guidance: 'Check the URL provided. If it starts with https:// the check passes. If it starts with http:// it fails. This is deterministic — do not use null.'
  },
  {
    id: 'company_name',
    label: 'Legal company name displayed',
    severity: 'high',
    law: 'Companies Act 2006 s.82',
    category: 'security_company',
    jurisdictions: ['uk'],
    guidance: 'UK registered companies must display their legal registered name (as it appears at Companies House) on their website. Look for a company name in the footer, About page, or T&Cs. "Ltd", "Limited", "PLC" etc. should be present. Sole traders display their own name. If the site appears to be a UK business and no company name is visible, this fails.'
  },
  {
    id: 'company_number',
    label: 'Company registration number',
    severity: 'high',
    law: 'Companies Act 2006 s.82',
    category: 'security_company',
    jurisdictions: ['uk'],
    guidance: 'UK limited companies must display their Companies House registration number (8 digits, sometimes with leading zeros e.g. 01234567 or OC123456 for LLPs). Usually in the footer or legal pages. Sole traders are exempt — mark null if the site clearly belongs to a sole trader.'
  },
  {
    id: 'registered_address',
    label: 'Registered office address',
    severity: 'high',
    law: 'Companies Act 2006 s.82',
    category: 'security_company',
    jurisdictions: ['uk'],
    guidance: 'UK limited companies must display their registered office address. Look for an address in the footer, Contact page, or legal section. A trading address is not sufficient — it should be labelled as "registered office" or appear alongside company number. Sole traders exempt.'
  },
  {
    id: 'contact_details',
    label: 'Contact information present',
    severity: 'medium',
    law: 'E-Commerce Regulations 2002 / Provision of Services Regs 2009',
    category: 'security_company',
    jurisdictions: ['uk'],
    guidance: 'The site must provide a way to contact the business — email address, phone number, or contact form. Look in the footer, header, or Contact page. A contact form alone is acceptable. A "contact us" link that leads to a page with contact details counts.'
  },
  {
    id: 'lang_attribute',
    label: 'HTML lang attribute set',
    severity: 'low',
    law: 'WCAG 2.1 SC 3.1.1',
    category: 'accessibility',
    jurisdictions: ['uk'],
    guidance: 'Check the langAttr field provided. If it contains a language code (e.g. "en", "en-GB"), this passes. If it is empty or not set, this fails.'
  },
  {
    id: 'img_alt_text',
    label: 'Images have alt text',
    severity: 'low',
    law: 'WCAG 2.1 AA / Equality Act 2010',
    category: 'accessibility',
    jurisdictions: ['uk'],
    guidance: 'Check the imgAltMissing and imgTotal fields. If imgAltMissing is 0 or imgTotal is 0, this passes. If more than 20% of images are missing alt text, this fails. If only 1-2 images are missing alt text on a large site, use medium severity in the explanation but still mark as fail.'
  },
  {
    id: 'accessibility_statement',
    label: 'Accessibility statement',
    severity: 'medium',
    law: 'Equality Act 2010 / PSBAR 2018',
    category: 'accessibility',
    jurisdictions: ['uk'],
    guidance: 'Look for a link to an accessibility statement in the footer or navigation. The link may say "Accessibility", "Accessibility Statement", or "Accessibility Policy". PSBAR 2018 makes this mandatory for public sector bodies — for private sector sites this is best practice.'
  },
  {
    id: 'misleading_claims',
    label: 'No misleading advertising claims',
    severity: 'high',
    law: 'Consumer Protection from Unfair Trading Regulations 2008',
    category: 'marketing',
    jurisdictions: ['uk'],
    guidance: 'Look for absolute superlatives without substantiation: "the cheapest", "guaranteed results", "100% success rate", "number 1 in the UK". Also look for fake urgency: countdown timers for permanently available products, "only 2 left" on digital products. If no such claims are found, this passes. Be specific in the explanation about what you found or did not find.'
  },
  {
    id: 'review_disclosure',
    label: 'Review and testimonial disclosure',
    severity: 'medium',
    law: 'DMCC Act 2024 / CAP Code r. 3.45',
    category: 'marketing',
    jurisdictions: ['uk'],
    guidance: 'If the site displays customer reviews or testimonials, check whether they are verified (e.g. via Trustpilot, Google Reviews widget) or clearly labelled. The DMCC Act 2024 makes fake reviews a criminal offence. Look for review widgets, star ratings, or testimonial sections. If no reviews are present, mark as null.'
  }
];

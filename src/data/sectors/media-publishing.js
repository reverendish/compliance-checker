export const MEDIA_PUBLISHING = {
  id: 'media-publishing',
  name: 'Media & Publishing',
  detection_signals: ['news', 'article', 'editorial', 'journalist', 'publication', 'magazine', 'blog', 'press', 'media', 'publisher'],
  checks: [
    { id: 'ipso_membership', label: 'IPSO membership / Editorial Code', severity: 'high', law: 'Independent Press Standards Organisation Code of Practice', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'News publishers should be IPSO members. Look for "IPSO member" badge or Editorial Code reference.' },
    { id: 'corrections_policy', label: 'Corrections & clarifications policy', severity: 'medium', law: 'IPSO Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should have a published corrections policy. Look for "corrections" or "errata" section.' },
    { id: 'copyright_notice', label: 'Copyright & intellectual property notice', severity: 'medium', law: 'Copyright, Designs and Patents Act 1988', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must display copyright notice (© year). Look for copyright symbol or T&Cs.' },
    { id: 'editorial_standards', label: 'Editorial standards & independence disclosure', severity: 'medium', law: 'IPSO Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should disclose editorial independence and ethical standards. Look for editorial policy.' },
    { id: 'defamation_complaints_process', label: 'Defamation complaints procedure', severity: 'high', law: 'Defamation Act 2013 / IPSO Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Must explain how to report defamatory content. Look for complaints contact or IPSO link.' },
    { id: 'sponsored_content_disclosure', label: 'Sponsored/advertising content clearly marked', severity: 'high', law: 'CAP Code / IPSO Code', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Sponsored articles must be clearly marked. Look for "[Sponsored]" or "[Advertisement]" labels.' },
    { id: 'privacy_journalists', label: 'Source protection & journalist ethics', severity: 'medium', law: 'IPSO Code / Contempt of Court Act 1981', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Should reference source confidentiality/protection. Look for editorial standards mentioning source protection.' }
  ]
};

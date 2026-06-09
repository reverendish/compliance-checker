import { UNIVERSAL_CHECKS } from '../data/universal.js';
import { SECTOR_MAP } from '../data/index.js';

const CATEGORY_LABELS = {
  data_protection: 'Data Protection & Privacy',
  security_company: 'Security & Company Information',
  consumer_law: 'Consumer Law',
  marketing: 'Marketing & Advertising',
  accessibility: 'Accessibility',
  sector_specific: 'Sector-Specific'
};

export function buildManifest(classification) {
  const { primary_sector, secondary_sectors = [], flags } = classification;

  let checks = [...UNIVERSAL_CHECKS];

  // Add primary sector checks
  const primary = SECTOR_MAP[primary_sector];
  if (primary) checks = [...checks, ...primary.checks];

  // Add secondary sector checks (deduplicate by id)
  for (const sectorId of secondary_sectors) {
    const sector = SECTOR_MAP[sectorId];
    if (!sector) continue;
    const existingIds = new Set(checks.map(c => c.id));
    for (const check of sector.checks) {
      if (!existingIds.has(check.id)) checks.push(check);
    }
  }

  // Filter out conditional checks where flag is false
  checks = checks.filter(check => {
    if (!check.conditional) return true;
    return flags[check.condition_flag] === true;
  });

  // Group into batches by category (max 10 per batch)
  const groups = {};
  for (const check of checks) {
    if (!groups[check.category]) groups[check.category] = [];
    groups[check.category].push(check);
  }

  return {
    checks,
    batches: Object.entries(groups).map(([category, batchChecks]) => ({
      category_id: category,
      category_label: CATEGORY_LABELS[category] || category,
      checks: batchChecks
    })),
    total: checks.length,
    sector_name: primary?.name || 'General'
  };
}

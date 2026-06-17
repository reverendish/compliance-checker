import { describe, it, expect } from '@jest/globals';
import { buildManifest } from '../manifest.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeClassification(overrides = {}) {
  return {
    primary_sector: 'general',
    secondary_sectors: [],
    flags: {
      sells_physical_goods: false,
      has_subscription: false,
      restricted_goods: false,
      has_user_generated_content: false,
      may_process_children_data: false,
      processes_special_category_data: false,
      takes_payments: false,
    },
    ...overrides,
  };
}

// ── Universal checks always present ──────────────────────────────────────────

describe('universal checks', () => {
  it('always includes universal checks for any sector', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'general' }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).toContain('cookie_banner');
    expect(ids).toContain('privacy_policy');
    expect(ids).toContain('https');
    expect(ids).toContain('company_name');
    expect(ids).toContain('lang_attribute');
  });

  it('includes universal checks for a known sector too', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'ecommerce' }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).toContain('cookie_banner');
    expect(ids).toContain('privacy_policy');
  });
});

// ── Primary sector checks ─────────────────────────────────────────────────────

describe('primary sector checks', () => {
  it('appends ecommerce checks for ecommerce sector', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'ecommerce' }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).toContain('cancellation_rights');
    expect(ids).toContain('refund_policy');
    expect(ids).toContain('terms_conditions');
  });

  it('appends financial-services checks for financial-services sector', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'financial-services' }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).toContain('fca_authorisation');
    expect(ids).toContain('risk_warnings');
    expect(ids).toContain('financial_ombudsman');
  });

  it('returns only universal checks for unknown sector', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'nonexistent-sector' }));
    // Should not throw — just returns universal checks
    expect(manifest.checks.length).toBeGreaterThan(0);
    expect(manifest.sector_name).toBe('General');
  });

  it('returns sector_name from the sector definition', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'ecommerce' }));
    expect(manifest.sector_name).toBe('E-Commerce & Retail');
  });

  it('returns "General" as sector_name when sector is "general"', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'general' }));
    expect(manifest.sector_name).toBe('General');
  });
});

// ── Secondary sector deduplication ───────────────────────────────────────────

describe('secondary sectors', () => {
  it('adds secondary sector checks without duplicating existing ids', () => {
    const manifest = buildManifest(makeClassification({
      primary_sector: 'ecommerce',
      secondary_sectors: ['saas-software'],
    }));
    const ids = manifest.checks.map(c => c.id);
    // ecommerce checks present
    expect(ids).toContain('cancellation_rights');
    // saas checks present
    expect(ids).toContain('dpa_processor_agreement');
    // no duplicate ids
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('ignores unknown secondary sectors gracefully', () => {
    expect(() =>
      buildManifest(makeClassification({ secondary_sectors: ['does-not-exist'] }))
    ).not.toThrow();
  });
});

// ── Conditional checks ────────────────────────────────────────────────────────

describe('conditional checks', () => {
  it('excludes conditional check when flag is false', () => {
    const manifest = buildManifest(makeClassification({
      primary_sector: 'general',
      flags: { processes_special_category_data: false },
    }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).not.toContain('dpo_contact');
  });

  it('includes conditional check when flag is true', () => {
    const manifest = buildManifest(makeClassification({
      primary_sector: 'general',
      flags: { processes_special_category_data: true },
    }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).toContain('dpo_contact');
  });

  it('excludes subscription_clarity when has_subscription is false', () => {
    const manifest = buildManifest(makeClassification({
      primary_sector: 'ecommerce',
      flags: { has_subscription: false },
    }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).not.toContain('subscription_clarity');
  });

  it('includes subscription_clarity when has_subscription is true', () => {
    const manifest = buildManifest(makeClassification({
      primary_sector: 'ecommerce',
      flags: { has_subscription: true },
    }));
    const ids = manifest.checks.map(c => c.id);
    expect(ids).toContain('subscription_clarity');
  });
});

// ── Manifest shape ────────────────────────────────────────────────────────────

describe('manifest shape', () => {
  it('returns expected top-level keys', () => {
    const manifest = buildManifest(makeClassification());
    expect(manifest).toHaveProperty('checks');
    expect(manifest).toHaveProperty('batches');
    expect(manifest).toHaveProperty('total');
    expect(manifest).toHaveProperty('sector_name');
  });

  it('total equals checks.length', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'ecommerce' }));
    expect(manifest.total).toBe(manifest.checks.length);
  });

  it('batches cover all checks with no overlap', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'healthcare' }));
    const batchCheckIds = manifest.batches.flatMap(b => b.checks.map(c => c.id));
    expect(batchCheckIds.length).toBe(manifest.checks.length);
    expect(batchCheckIds.length).toBe(new Set(batchCheckIds).size);
  });

  it('each batch has category_id and category_label', () => {
    const manifest = buildManifest(makeClassification({ primary_sector: 'ecommerce' }));
    for (const batch of manifest.batches) {
      expect(batch).toHaveProperty('category_id');
      expect(batch).toHaveProperty('category_label');
      expect(batch).toHaveProperty('checks');
    }
  });
});

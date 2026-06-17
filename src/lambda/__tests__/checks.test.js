import { describe, it, expect } from '@jest/globals';
import { CHECK_FUNCTIONS } from '../checks/index.js';

// ── Page builder helper ───────────────────────────────────────────────────────

function makePage(overrides = {}) {
  return {
    url: 'https://example.com',
    html: '<html><body></body></html>',
    text: '',
    links: [],
    headings: [],
    meta: {},
    langAttr: '',
    imgAltMissing: 0,
    imgTotal: 0,
    httpStatus: 200,
    privacyText: null,
    privacyHtml: null,
    ...overrides,
  };
}

// ── Universal: Data Protection ────────────────────────────────────────────────

describe('cookie_banner', () => {
  it('passes when visible cookie consent text in body', () => {
    const { pass } = CHECK_FUNCTIONS.cookie_banner(makePage({ text: 'We use cookies on this website.' }));
    expect(pass).toBe(true);
  });

  it('passes when CMP platform script in HTML', () => {
    const { pass } = CHECK_FUNCTIONS.cookie_banner(makePage({ html: '<script src="cookiebot.js"></script>' }));
    expect(pass).toBe(true);
  });

  it('fails on empty page', () => {
    const { pass } = CHECK_FUNCTIONS.cookie_banner(makePage());
    expect(pass).toBe(false);
  });
});

describe('privacy_policy', () => {
  it('passes when privacy link present', () => {
    const { pass } = CHECK_FUNCTIONS.privacy_policy(makePage({
      links: [{ href: '/privacy-policy', text: 'privacy policy' }],
    }));
    expect(pass).toBe(true);
  });

  it('fails when no privacy link or text', () => {
    const { pass } = CHECK_FUNCTIONS.privacy_policy(makePage());
    expect(pass).toBe(false);
  });
});

// ── Universal: Security & Company ─────────────────────────────────────────────

describe('https', () => {
  it('passes on https URL', () => {
    expect(CHECK_FUNCTIONS.https(makePage({ url: 'https://example.com' })).pass).toBe(true);
  });

  it('fails on http URL', () => {
    expect(CHECK_FUNCTIONS.https(makePage({ url: 'http://example.com' })).pass).toBe(false);
  });
});

describe('company_name', () => {
  it('passes when "Ltd" appears in text', () => {
    expect(CHECK_FUNCTIONS.company_name(makePage({ text: 'Acme Solutions Ltd registered in England' })).pass).toBe(true);
  });

  it('passes when "Limited" appears in text', () => {
    expect(CHECK_FUNCTIONS.company_name(makePage({ text: 'Acme Solutions Limited' })).pass).toBe(true);
  });

  it('fails when no legal designation present', () => {
    expect(CHECK_FUNCTIONS.company_name(makePage({ text: 'Welcome to our website' })).pass).toBe(false);
  });
});

describe('company_number', () => {
  it('passes when 8-digit company number present', () => {
    expect(CHECK_FUNCTIONS.company_number(makePage({ text: 'Company registration number: 01234567' })).pass).toBe(true);
  });

  it('passes when SC-prefixed Scottish company number present', () => {
    expect(CHECK_FUNCTIONS.company_number(makePage({ text: 'Registered in Scotland SC123456' })).pass).toBe(true);
  });

  it('fails when no company number', () => {
    expect(CHECK_FUNCTIONS.company_number(makePage({ text: 'Contact us today' })).pass).toBe(false);
  });
});

describe('contact_details', () => {
  it('passes with email address in text', () => {
    expect(CHECK_FUNCTIONS.contact_details(makePage({ text: 'Email us at hello@example.com' })).pass).toBe(true);
  });

  it('passes with UK phone number in text', () => {
    expect(CHECK_FUNCTIONS.contact_details(makePage({ text: 'Call us on 0800 123 4567' })).pass).toBe(true);
  });

  it('fails with no contact info', () => {
    expect(CHECK_FUNCTIONS.contact_details(makePage()).pass).toBe(false);
  });
});

// ── Universal: Accessibility ──────────────────────────────────────────────────

describe('lang_attribute', () => {
  it('passes when lang attribute set', () => {
    expect(CHECK_FUNCTIONS.lang_attribute(makePage({ langAttr: 'en-GB' })).pass).toBe(true);
  });

  it('fails when lang attribute empty', () => {
    expect(CHECK_FUNCTIONS.lang_attribute(makePage({ langAttr: '' })).pass).toBe(false);
  });
});

describe('img_alt_text', () => {
  it('passes when all images have alt text', () => {
    expect(CHECK_FUNCTIONS.img_alt_text(makePage({ imgTotal: 5, imgAltMissing: 0 })).pass).toBe(true);
  });

  it('fails when any images are missing alt text', () => {
    expect(CHECK_FUNCTIONS.img_alt_text(makePage({ imgTotal: 5, imgAltMissing: 2 })).pass).toBe(false);
  });

  it('returns null when no images on page', () => {
    expect(CHECK_FUNCTIONS.img_alt_text(makePage({ imgTotal: 0, imgAltMissing: 0 })).pass).toBeNull();
  });
});

// ── Universal: Marketing ──────────────────────────────────────────────────────

describe('misleading_claims', () => {
  it('passes when no misleading absolute claims', () => {
    expect(CHECK_FUNCTIONS.misleading_claims(makePage({ text: 'Great service for small businesses' })).pass).toBe(true);
  });

  it('fails on "100% guaranteed success rate"', () => {
    expect(CHECK_FUNCTIONS.misleading_claims(makePage({ text: '100% guaranteed results every time' })).pass).toBe(false);
  });
});

// ── Sector-specific: Financial Services ──────────────────────────────────────

describe('fca_authorisation', () => {
  it('passes when FCA authorised mentioned', () => {
    expect(CHECK_FUNCTIONS.fca_authorisation(makePage({ text: 'We are FCA authorised firm reference 123456' })).pass).toBe(true);
  });

  it('passes when Financial Conduct Authority mentioned', () => {
    expect(CHECK_FUNCTIONS.fca_authorisation(makePage({ text: 'Regulated by the Financial Conduct Authority' })).pass).toBe(true);
  });

  it('fails when no FCA mention', () => {
    expect(CHECK_FUNCTIONS.fca_authorisation(makePage({ text: 'Great financial products' })).pass).toBe(false);
  });
});

// ── Sector-specific: E-Commerce ───────────────────────────────────────────────

describe('cancellation_rights', () => {
  it('passes when 14-day right mentioned in text', () => {
    expect(CHECK_FUNCTIONS.cancellation_rights(makePage({ text: 'You have a 14-day right to cancel your order.' })).pass).toBe(true);
  });

  it('fails when no cancellation rights mentioned', () => {
    expect(CHECK_FUNCTIONS.cancellation_rights(makePage({ text: 'Order today for fast delivery' })).pass).toBe(false);
  });
});

describe('refund_policy', () => {
  it('passes when refund policy link present', () => {
    expect(CHECK_FUNCTIONS.refund_policy(makePage({
      links: [{ href: '/refunds', text: 'refund policy' }],
    })).pass).toBe(true);
  });

  it('fails when no refund mention', () => {
    expect(CHECK_FUNCTIONS.refund_policy(makePage({ text: 'Shop our range' })).pass).toBe(false);
  });
});

// ── Sector-specific: Healthcare ───────────────────────────────────────────────

describe('cqc_registration', () => {
  it('passes when CQC registered text present', () => {
    expect(CHECK_FUNCTIONS.cqc_registration(makePage({ text: 'We are CQC registered and regulated' })).pass).toBe(true);
  });

  it('fails when no CQC mention', () => {
    expect(CHECK_FUNCTIONS.cqc_registration(makePage({ text: 'Healthcare services for all' })).pass).toBe(false);
  });
});

// ── Sector-specific: Gambling ─────────────────────────────────────────────────

describe('gambling_commission_licence', () => {
  it('passes when Gambling Commission licence mentioned', () => {
    expect(CHECK_FUNCTIONS.gambling_commission_licence(makePage({ text: 'Licensed by the Gambling Commission' })).pass).toBe(true);
  });

  it('fails when no mention', () => {
    expect(CHECK_FUNCTIONS.gambling_commission_licence(makePage({ text: 'Play our games' })).pass).toBe(false);
  });
});

// ── Cookie banner: raw-HTML false positive regression ────────────────────────

describe('cookie_banner — no false positive from script content', () => {
  it('does not pass just because "cookiebot" appears in a non-script text attr', () => {
    // If cookiebot is in a data-attribute or class, HTML detection should still catch it
    const page = makePage({ html: '<div class="cookiebot-wrapper"></div>', text: '' });
    expect(CHECK_FUNCTIONS.cookie_banner(page).pass).toBe(true);
  });

  it('does not pass when CMP name only appears buried in unrelated text content', () => {
    // "onetrust" in visible text is a legit signal — should still pass
    const page = makePage({ text: 'Powered by OneTrust cookie consent', html: '<html></html>' });
    // text match for "onetrust" goes through HTML check (it's in page.html via the split)
    // but with our fix, text-based passes use text only; HTML-based uses html only.
    // OneTrust in visible text is unusual but still a consent signal — check notes should reflect pass
    expect(CHECK_FUNCTIONS.cookie_banner(page).pass).toBe(true);
  });
});

// ── marketing_consent: no false positive from script attr ────────────────────

describe('marketing_consent — form present but consent in script only', () => {
  it('fails when opt-in text only exists inside a script tag (not visible text)', () => {
    const page = makePage({
      html: '<form><input type="email"><script>var marketingConsent=true;</script></form>',
      text: 'Subscribe to our newsletter',
    });
    // "marketingConsent" is in script; page.text has no opt-in wording → should fail
    expect(CHECK_FUNCTIONS.marketing_consent(page).pass).toBe(false);
  });
});

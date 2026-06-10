import { describe, it, expect } from '@jest/globals';
import { detectJsShell } from '../detector.js';

// detectJsShell(html, $) takes raw HTML and a cheerio instance.
// We mock the cheerio $ interface rather than importing real cheerio
// to keep tests fast and dependency-free.

// ── Cheerio mock factory ──────────────────────────────────────────────────────
/**
 * Build a minimal mock of the cheerio $ function.
 * @param {object} opts
 * @param {string}  opts.bodyText       - text returned by $('body').text()
 * @param {number}  opts.spaRootCount   - how many SPA root elements (#root, #app, etc.)
 * @param {number}  opts.scriptCount    - script tag count
 * @param {number}  opts.linkCount      - anchor tag count
 * @param {string}  opts.noscriptText   - text content of <noscript>
 */
function makeMockCheerio({ bodyText = '', spaRootCount = 0, scriptCount = 0, linkCount = 10, noscriptText = '' } = {}) {
  return function $(selector) {
    // $('body').text().replace(...).trim()
    if (selector === 'body') {
      return {
        text: () => bodyText,
        length: 1,
      };
    }
    // SPA root detection selectors
    if (selector.includes('root') || selector.includes('app') || selector.includes('next')) {
      return { length: spaRootCount };
    }
    if (selector === 'script') {
      return { length: scriptCount };
    }
    if (selector === 'a') {
      return { length: linkCount };
    }
    if (selector === 'noscript') {
      return {
        text: () => noscriptText,
        length: noscriptText ? 1 : 0,
      };
    }
    return { length: 0, text: () => '' };
  };
}

// ── isShell: false (normal sites) ────────────────────────────────────────────
describe('normal sites (isShell: false)', () => {
  it('returns isShell:false for a content-rich page', () => {
    const $ = makeMockCheerio({ bodyText: 'A'.repeat(1000), scriptCount: 3, linkCount: 20 });
    expect(detectJsShell('<html>', $)).toEqual({ isShell: false, reason: null });
  });

  it('returns isShell:false when body text is short but no SPA root and few scripts', () => {
    // Thin text alone is not enough — needs another signal
    const $ = makeMockCheerio({ bodyText: 'Short text', scriptCount: 2, linkCount: 10 });
    expect(detectJsShell('<html>', $).isShell).toBe(false);
  });

  it('returns isShell:false with SPA root but sufficient body text', () => {
    const $ = makeMockCheerio({ bodyText: 'A'.repeat(500), spaRootCount: 1, scriptCount: 5 });
    expect(detectJsShell('<html>', $).isShell).toBe(false);
  });
});

// ── isShell: true — SPA root + thin text ─────────────────────────────────────
describe('SPA shell detection', () => {
  it('detects React/Next.js shell: thin text + SPA root', () => {
    const $ = makeMockCheerio({ bodyText: 'Loading...', spaRootCount: 1, scriptCount: 5 });
    const result = detectJsShell('<html><div id="root"></div>', $);
    expect(result.isShell).toBe(true);
    expect(result.reason).toMatch(/JS-rendered/i);
  });

  it('detects shell: thin text + many scripts + few links', () => {
    const $ = makeMockCheerio({ bodyText: 'Please wait', scriptCount: 12, linkCount: 1 });
    const result = detectJsShell('<html>', $);
    expect(result.isShell).toBe(true);
    expect(result.reason).toMatch(/JavaScript/i);
  });

  it('detects shell: noscript JS warning + thin text', () => {
    const $ = makeMockCheerio({
      bodyText: '',
      noscriptText: 'You need to enable JavaScript to run this app.',
    });
    const result = detectJsShell('<html>', $);
    expect(result.isShell).toBe(true);
    expect(result.reason).toMatch(/JavaScript/i);
  });
});

// ── Threshold boundary conditions ─────────────────────────────────────────────
describe('threshold boundaries', () => {
  it('body text exactly at threshold (400 chars) is NOT thin', () => {
    // thinText = bodyText.length < 400, so 400 chars is NOT thin
    const text = 'A'.repeat(400);
    const $ = makeMockCheerio({ bodyText: text, spaRootCount: 1, scriptCount: 15, linkCount: 1 });
    expect(detectJsShell('<html>', $).isShell).toBe(false);
  });

  it('body text at 399 chars IS thin', () => {
    const text = 'A'.repeat(399);
    const $ = makeMockCheerio({ bodyText: text, spaRootCount: 1 });
    expect(detectJsShell('<html>', $).isShell).toBe(true);
  });

  it('script count exactly 8 does NOT trigger thin+manyScripts rule', () => {
    // manyScripts = $('script').length > 8, so 8 is NOT "many"
    const $ = makeMockCheerio({ bodyText: 'Short', scriptCount: 8, linkCount: 2 });
    expect(detectJsShell('<html>', $).isShell).toBe(false);
  });

  it('script count 9 with thin text and few links triggers detection', () => {
    const $ = makeMockCheerio({ bodyText: 'Short', scriptCount: 9, linkCount: 2 });
    expect(detectJsShell('<html>', $).isShell).toBe(true);
  });

  it('link count exactly 4 is NOT "few links"', () => {
    // fewLinks = $('a').length < 4, so 4 is NOT few
    const $ = makeMockCheerio({ bodyText: 'Short', scriptCount: 10, linkCount: 4 });
    expect(detectJsShell('<html>', $).isShell).toBe(false);
  });

  it('link count 3 with thin text and many scripts triggers detection', () => {
    const $ = makeMockCheerio({ bodyText: 'Short', scriptCount: 10, linkCount: 3 });
    expect(detectJsShell('<html>', $).isShell).toBe(true);
  });
});

// ── reason is always null for non-shells ─────────────────────────────────────
describe('reason field', () => {
  it('reason is null when isShell is false', () => {
    const $ = makeMockCheerio({ bodyText: 'A'.repeat(1000) });
    expect(detectJsShell('<html>', $).reason).toBeNull();
  });

  it('reason is a non-empty string when isShell is true', () => {
    const $ = makeMockCheerio({ bodyText: 'x', spaRootCount: 1 });
    const { reason } = detectJsShell('<html>', $);
    expect(typeof reason).toBe('string');
    expect(reason.length).toBeGreaterThan(10);
  });
});

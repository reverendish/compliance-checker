import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ── Mock all dependencies before importing handler ────────────────────────────
jest.unstable_mockModule('../scraper.js', () => ({
  scrape: jest.fn(),
}));

jest.unstable_mockModule('../detector.js', () => ({
  detectJsShell: jest.fn().mockReturnValue({ isShell: false, reason: null }),
}));

jest.unstable_mockModule('../classifier.js', () => ({
  classifySector: jest.fn().mockResolvedValue({
    primary_sector: 'general',
    secondary_sectors: [],
    confidence: 'medium',
    flags: {},
  }),
}));

jest.unstable_mockModule('../manifest.js', () => ({
  buildManifest: jest.fn().mockReturnValue({
    sector_name: 'General',
    total: 0,
    batches: [],
  }),
}));

jest.unstable_mockModule('../auditor.js', () => ({
  auditBatch: jest.fn().mockResolvedValue({ checks: [] }),
}));

jest.unstable_mockModule('../scorer.js', () => ({
  calculateScore: jest.fn().mockReturnValue({
    overall_score: 80,
    applicable_count: 10,
    passed_count: 8,
    failed_count: 2,
    critical_count: 0,
  }),
}));

jest.unstable_mockModule('cheerio', () => ({
  load: jest.fn().mockReturnValue(() => ({ length: 0, text: () => '' })),
}));

const { handler } = await import('../handler.js');
const { scrape } = await import('../scraper.js');

// ── Mock scrape return value ──────────────────────────────────────────────────
const MOCK_PAGE = {
  html: '<html><body><p>Test content</p></body></html>',
  siteName: 'example.com',
  pageText: 'Test content',
  pageLinks: [],
  headings: [],
  targetUrl: 'https://example.com',
  fetchWarning: null,
};

beforeEach(() => {
  scrape.mockReset();
  scrape.mockResolvedValue(MOCK_PAGE);
});

function makeEvent(body = {}, method = 'POST') {
  return {
    requestContext: { http: { method } },
    body: JSON.stringify(body),
  };
}

// ── CORS preflight ────────────────────────────────────────────────────────────
describe('OPTIONS preflight', () => {
  it('returns 200 with empty body', async () => {
    const res = await handler({ requestContext: { http: { method: 'OPTIONS' } } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('');
  });

  it('returns CORS headers on preflight', async () => {
    const res = await handler({ requestContext: { http: { method: 'OPTIONS' } } });
    expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(res.headers['Access-Control-Allow-Origin']).toBeTruthy();
  });
});

// ── Input validation ──────────────────────────────────────────────────────────
describe('input validation', () => {
  it('returns 400 on malformed JSON body', async () => {
    const res = await handler({
      requestContext: { http: { method: 'POST' } },
      body: '{ not json',
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/JSON/i);
  });

  it('returns 400 when url is missing', async () => {
    const res = await handler(makeEvent({}));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/URL/i);
  });

  it('returns 400 when url is not a string', async () => {
    const res = await handler(makeEvent({ url: 12345 }));
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when url is an empty string', async () => {
    const res = await handler(makeEvent({ url: '' }));
    expect(res.statusCode).toBe(400);
  });
});

// ── SSRF protection ───────────────────────────────────────────────────────────
describe('SSRF protection', () => {
  const blockedUrls = [
    'http://localhost',
    'http://127.0.0.1',
    'http://127.0.0.1:8080/admin',
    'http://10.0.0.1',
    'http://10.255.255.255',
    'http://172.16.0.1',
    'http://172.31.255.255',
    'http://192.168.1.1',
    'http://169.254.169.254',  // AWS metadata endpoint
    'http://169.254.169.254/latest/meta-data/',
  ];

  for (const url of blockedUrls) {
    it(`blocks ${url}`, async () => {
      const res = await handler(makeEvent({ url }));
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toMatch(/private|internal|not allowed/i);
    });
  }

  it('allows public HTTP URLs', async () => {
    const res = await handler(makeEvent({ url: 'http://example.com' }));
    expect(res.statusCode).toBe(200);
  });

  it('blocks non-http(s) schemes that start with "http" (e.g. http2://)', async () => {
    // Note: ftp:// etc. don't start with "http" so the handler rewrites them to
    // https://ftp://... which the URL parser sees as an https URL — those slip
    // through. This test covers the scheme-validation branch with a URL that
    // does start with "http" but isn't http/https.
    const res = await handler(makeEvent({ url: 'http2://example.com' }));
    expect(res.statusCode).toBe(400);
  });
});

// ── URL normalisation ─────────────────────────────────────────────────────────
describe('URL normalisation', () => {
  it('prepends https:// when scheme is missing', async () => {
    const res = await handler(makeEvent({ url: 'example.com' }));
    // Should reach scraper (not blocked by SSRF) — scrape was called
    expect(res.statusCode).toBe(200);
    expect(scrape).toHaveBeenCalledWith(expect.stringContaining('https://'));
  });
});

// ── Successful audit ──────────────────────────────────────────────────────────
describe('successful audit', () => {
  it('returns 200 with NDJSON body', async () => {
    const res = await handler(makeEvent({ url: 'https://example.com' }));
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toMatch(/text\/plain/);
  });

  it('NDJSON output contains a "done" line with score', async () => {
    const res = await handler(makeEvent({ url: 'https://example.com' }));
    const lines = res.body.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    const doneLine = lines.find(l => l.type === 'done');
    expect(doneLine).toBeTruthy();
    expect(doneLine.overall_score).toBe(80);
  });

  it('NDJSON output contains a "meta" line', async () => {
    const res = await handler(makeEvent({ url: 'https://example.com' }));
    const lines = res.body.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    expect(lines.some(l => l.type === 'meta')).toBe(true);
  });

  it('NDJSON output contains a "classified" line', async () => {
    const res = await handler(makeEvent({ url: 'https://example.com' }));
    const lines = res.body.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    expect(lines.some(l => l.type === 'classified')).toBe(true);
  });

  it('passes scraped content to classifySector', async () => {
    const { classifySector } = await import('../classifier.js');
    await handler(makeEvent({ url: 'https://example.com' }));
    expect(classifySector).toHaveBeenCalledWith(
      expect.objectContaining({ pageText: 'Test content' })
    );
  });
});

// ── Scraper failure ───────────────────────────────────────────────────────────
describe('scraper failure', () => {
  it('streams an error line and returns 200 (NDJSON error)', async () => {
    scrape.mockRejectedValueOnce(new Error('Connection refused'));
    const res = await handler(makeEvent({ url: 'https://unreachable.example.com' }));
    expect(res.statusCode).toBe(200);
    const lines = res.body.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    expect(lines.some(l => l.type === 'error')).toBe(true);
  });
});

// ── CORS always present ───────────────────────────────────────────────────────
describe('CORS headers always present', () => {
  it('includes Access-Control-Allow-Origin on 200', async () => {
    const res = await handler(makeEvent({ url: 'https://example.com' }));
    expect(res.headers['Access-Control-Allow-Origin']).toBeTruthy();
  });

  it('includes Access-Control-Allow-Origin on 400', async () => {
    const res = await handler(makeEvent({}));
    expect(res.headers['Access-Control-Allow-Origin']).toBeTruthy();
  });
});

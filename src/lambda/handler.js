import { scrape } from './scraper.js';
import { detectJsShell } from './detector.js';
import { classifySector } from './classifier.js';
import { buildManifest } from './manifest.js';
import { auditBatch } from './auditor.js';
import { calculateScore } from './scorer.js';

const ALLOWED_ORIGINS = new Set([
  'https://compliance.ishsitotombe.co.uk',
  'https://ishsitotombe.co.uk',
  'https://www.ishsitotombe.co.uk',
]);

function corsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.has(requestOrigin)
    ? requestOrigin
    : 'https://compliance.ishsitotombe.co.uk';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache',
    'Vary': 'Origin',
  };
}

export const handler = async (event) => {
  const requestOrigin = event.headers?.origin || event.headers?.Origin || '';

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(requestOrigin),
      body: ''
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return errorResponse(400, 'Invalid JSON body.', requestOrigin);
  }

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return errorResponse(400, 'A valid URL is required.', requestOrigin);
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

  // SSRF protection
  try {
    validateUrl(targetUrl);
  } catch (e) {
    return errorResponse(400, e.message, requestOrigin);
  }

  // Payment gate (disabled)
  if (process.env.REQUIRE_PAYMENT === 'true') {
    // Stripe verification would go here
    // Left as stub — implement when flipping REQUIRE_PAYMENT=true
  }

  // Build NDJSON stream via async generator
  async function* generate() {
    // 1. Scrape
    let scraped;
    try {
      scraped = await scrape(targetUrl);
    } catch (e) {
      yield JSON.stringify({ type: 'error', message: e.message }) + '\n';
      return;
    }

    const { html } = scraped;
    const pageContent = scraped; // pass full object (incl. html + privacyText) to auditor
    const { load } = await import('cheerio');
    const $ = load(html);
    const jsShell = detectJsShell(html, $);

    // 2. Stream metadata
    yield JSON.stringify({
      type: 'meta',
      site_name: scraped.siteName,
      js_shell: jsShell.isShell,
      js_shell_reason: jsShell.reason,
      fetch_warning: scraped.fetchWarning
    }) + '\n';

    // 3. Classify
    let classification;
    try {
      classification = await classifySector(pageContent);
    } catch (e) {
      console.error('[classifier] Bedrock classification failed:', e?.message ?? e);
      classification = { primary_sector: 'general', secondary_sectors: [], confidence: 'low', flags: {} };
    }

    // 4. Stream classification
    const manifest = buildManifest(classification);
    yield JSON.stringify({
      type: 'classified',
      sector: classification.primary_sector,
      sector_name: manifest.sector_name,
      flags: classification.flags,
      total_checks: manifest.total,
      batch_ids: manifest.batches.map(b => b.category_id),
    }) + '\n';

    // 5. Run batches in parallel, stream each as it completes
    const allChecks = [];
    const batchPromises = manifest.batches.map(batch =>
      auditBatch(pageContent, batch)
        .then(result => ({ batch, result, error: null }))
        .catch(e => ({ batch, result: null, error: e.message }))
    );

    // Await all batches (run in parallel, collect in completion order via allSettled)
    const settled = await Promise.allSettled(batchPromises);
    for (const outcome of settled) {
      const { batch, result, error } = outcome.status === 'fulfilled'
        ? outcome.value
        : { batch: outcome.reason?.batch, result: null, error: outcome.reason?.message ?? String(outcome.reason) };
      if (error) {
        yield JSON.stringify({ type: 'group_error', group_id: batch.category_id, message: error }) + '\n';
        continue;
      }
      const checks = result.checks || [];
      allChecks.push(...checks);
      yield JSON.stringify({
        type: 'group',
        group_id: batch.category_id,
        group_label: batch.category_label,
        checks
      }) + '\n';
    }

    // 6. Score and close
    const score = calculateScore(allChecks);
    yield JSON.stringify({ type: 'done', ...score }) + '\n';
  }

  // Collect all lines (Lambda doesn't support true streaming)
  const resultLines = [];
  for await (const line of generate()) {
    resultLines.push(line);
  }

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders(requestOrigin),
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Accel-Buffering': 'no'
    },
    body: resultLines.join('')
  };
};

function validateUrl(url) {
  const parsed = new URL(url);
  const host = parsed.hostname;
  const PRIVATE = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/;
  if (PRIVATE.test(host)) throw new Error('Private or internal URLs are not allowed.');
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS URLs are allowed.');
}

function errorResponse(status, message, requestOrigin = '') {
  return {
    statusCode: status,
    headers: corsHeaders(requestOrigin),
    body: JSON.stringify({ error: message })
  };
}

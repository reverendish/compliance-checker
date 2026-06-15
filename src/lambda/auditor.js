import { CHECK_FUNCTIONS } from './checks/index.js';

/**
 * Build a normalised page object from the raw scraper output.
 * Check functions use clean field names (url, text, links…).
 */
function buildPage(scraped) {
  return {
    url:          scraped.targetUrl || '',
    html:         scraped.html      || '',
    text:         scraped.pageText  || '',
    links:        scraped.pageLinks || [],
    headings:     scraped.headings  || [],
    meta:         scraped.metaTags  || {},
    langAttr:     scraped.langAttr  || '',
    imgAltMissing: scraped.imgAltMissing ?? 0,
    imgTotal:     scraped.imgTotal  ?? 0,
    httpStatus:   scraped.httpStatus,
    privacyText:  scraped.privacyText  || null,
    privacyHtml:  scraped.privacyHtml  || null,
  };
}

/**
 * Run a batch of compliance checks deterministically — zero AI.
 *
 * @param {object} scraped  Full scraper output (including html, privacyText)
 * @param {object} batch    { category_id, category_label, checks[] }
 * @returns {{ checks: Array<{id,label,pass,severity,law,explanation}> }}
 */
export async function auditBatch(scraped, batch) {
  const page = buildPage(scraped);
  const results = [];

  for (const checkDef of batch.checks) {
    const fn = CHECK_FUNCTIONS[checkDef.id];

    if (!fn) {
      results.push({
        id:          checkDef.id,
        label:       checkDef.label,
        pass:        null,
        severity:    checkDef.severity,
        law:         checkDef.law,
        explanation: 'Check not yet implemented for this category.',
      });
      continue;
    }

    try {
      const { pass, notes } = fn(page);
      results.push({
        id:          checkDef.id,
        label:       checkDef.label,
        pass,
        severity:    checkDef.severity,
        law:         checkDef.law,
        explanation: notes,
      });
    } catch (e) {
      results.push({
        id:          checkDef.id,
        label:       checkDef.label,
        pass:        null,
        severity:    checkDef.severity,
        law:         checkDef.law,
        explanation: `Check error: ${e.message}`,
      });
    }
  }

  return { checks: results };
}

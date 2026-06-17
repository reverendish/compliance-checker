import { load } from 'cheerio';

const PRIVATE_HOST = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1|fc00:|fe80:)/;

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
};

async function fetchPage(url, timeoutMs = 12000) {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
  });
  // Re-validate the effective URL after redirects to prevent SSRF via open redirects
  if (res.url && res.url !== url) {
    try {
      const host = new URL(res.url).hostname;
      if (PRIVATE_HOST.test(host)) throw new Error('Private/internal URLs are not allowed.');
    } catch (e) {
      throw new Error(`Redirect target rejected: ${e.message}`);
    }
  }
  const html = await res.text();
  return { html, status: res.status, ok: res.ok };
}

/**
 * Find the privacy policy URL from the homepage links.
 * Returns the first absolute URL that looks like a privacy policy, or null.
 */
function findPrivacyUrl(baseUrl, pageLinks) {
  const patterns = [/privacy/i, /data.polic/i, /gdpr/i];
  for (const { href } of pageLinks) {
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
    if (patterns.some(p => p.test(href))) {
      try {
        return new URL(href, baseUrl).href;
      } catch {
        // malformed href — skip
      }
    }
  }
  // Also check for text-matched links (e.g. "Privacy Policy" anchor with /legal/ href)
  for (const { href, text } of pageLinks) {
    if (!href || href.startsWith('#')) continue;
    if (patterns.some(p => p.test(text || ''))) {
      try {
        return new URL(href, baseUrl).href;
      } catch { /* skip */ }
    }
  }
  return null;
}

function parseHtml(html) {
  const $ = load(html);
  $('script, style, noscript, svg, iframe').remove();

  const metaTags = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property') || '';
    const content = $(el).attr('content') || '';
    if (name) metaTags[name.toLowerCase()] = content;
  });

  const pageLinks = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim().toLowerCase();
    if (href) pageLinks.push({ href, text });
  });

  const headings = [];
  $('h1, h2, h3').each((_, el) => {
    headings.push({ tag: el.name, text: $(el).text().trim().slice(0, 80) });
  });

  let imgAltMissing = 0, imgTotal = 0;
  $('img').each((_, el) => {
    imgTotal++;
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null) imgAltMissing++;
  });

  const langAttr = $('html').attr('lang') || '';
  const pageText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 16000);
  const siteName = metaTags['og:site_name'] || $('title').text().trim().split(/[|\-–]/)[0].trim() || '';

  return { metaTags, pageLinks, headings, imgAltMissing, imgTotal, langAttr, pageText, siteName };
}

export async function scrape(targetUrl) {
  let html = '';
  let fetchWarning = null;
  let httpStatus = null;

  // ── Fetch homepage ────────────────────────────────────────────────
  try {
    const { html: h, status, ok } = await fetchPage(targetUrl);
    httpStatus = status;
    html = h;

    if (!ok) {
      if (status === 403 || status === 401)
        throw new Error(`The site blocked the scanner (HTTP ${status}). Some sites reject automated requests.`);
      if (status === 404)
        throw new Error('Page not found (HTTP 404). Check the URL and try again.');
      fetchWarning = `The server returned HTTP ${status}. Results may be incomplete.`;
    }
  } catch (e) {
    if (e.name === 'TimeoutError' || e.message?.includes('timeout'))
      throw new Error('The site took too long to respond (12s timeout).');
    if (e.cause?.code === 'ENOTFOUND' || e.message?.includes('ENOTFOUND'))
      throw new Error('Domain not found. Check the URL is correct and the site is live.');
    if (e.cause?.code === 'ECONNREFUSED')
      throw new Error('Connection refused. The site may be down or blocking automated requests.');
    throw new Error(`Could not reach the site: ${e.message}`);
  }

  const parsed = parseHtml(html);
  const siteName = parsed.siteName || new URL(targetUrl).hostname;

  // ── Fetch privacy policy page ─────────────────────────────────────
  let privacyText = null;
  let privacyHtml = null;

  const privacyUrl = findPrivacyUrl(targetUrl, parsed.pageLinks);
  if (privacyUrl) {
    try {
      const { html: ph, ok } = await fetchPage(privacyUrl, 8000);
      if (ok) {
        privacyHtml = ph;
        const privParsed = parseHtml(ph);
        privacyText = privParsed.pageText;
      }
    } catch {
      // Privacy page unavailable — non-fatal, checks handle null privacyText
    }
  }

  return {
    html,
    targetUrl,
    pageText:     parsed.pageText,
    pageLinks:    parsed.pageLinks,
    headings:     parsed.headings,
    metaTags:     parsed.metaTags,
    imgAltMissing: parsed.imgAltMissing,
    imgTotal:     parsed.imgTotal,
    langAttr:     parsed.langAttr,
    httpStatus,
    fetchWarning,
    siteName,
    privacyUrl,
    privacyText,
    privacyHtml,
  };
}

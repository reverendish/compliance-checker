import { load } from 'cheerio';

function validateUrl(url) {
  const parsed = new URL(url);
  const host = parsed.hostname;
  const PRIVATE = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1|fc00:|fe80:)/;
  if (PRIVATE.test(host)) throw new Error('Private/internal URLs are not allowed.');
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS URLs are allowed.');
}

export async function scrape(targetUrl) {
  validateUrl(targetUrl);

  let html = '';
  let fetchWarning = null;
  let httpStatus = null;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });

    httpStatus = res.status;

    if (!res.ok) {
      if (res.status === 403 || res.status === 401)
        throw new Error(`The site blocked the scanner (HTTP ${res.status}). Some sites reject automated requests.`);
      if (res.status === 404)
        throw new Error('Page not found (HTTP 404). Check the URL and try again.');
      fetchWarning = `The server returned HTTP ${res.status}. Results may be incomplete.`;
    }

    html = await res.text();
  } catch (e) {
    if (e.name === 'TimeoutError' || e.message?.includes('timeout'))
      throw new Error('The site took too long to respond (12s timeout).');
    if (e.cause?.code === 'ENOTFOUND' || e.message?.includes('ENOTFOUND'))
      throw new Error('Domain not found. Check the URL is correct and the site is live.');
    if (e.cause?.code === 'ECONNREFUSED')
      throw new Error('Connection refused. The site may be down or blocking automated requests.');
    throw new Error(`Could not reach the site: ${e.message}`);
  }

  // Parse HTML
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
    if (href && text) pageLinks.push({ href, text });
  });

  const headings = [];
  $('h1, h2, h3').each((_, el) => {
    headings.push({ tag: el.name, text: $(el).text().trim().slice(0, 80) });
  });

  let imgAltMissing = 0, imgTotal = 0;
  $('img').each((_, el) => {
    imgTotal++;
    if ($(el).attr('alt') === undefined || $(el).attr('alt') === null) imgAltMissing++;
  });

  const langAttr = $('html').attr('lang') || '';
  const pageText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 16000);

  const siteName = metaTags['og:site_name'] || $('title').text().trim().split(/[|\-–]/)[0].trim() || new URL(targetUrl).hostname;

  return {
    html,
    pageText,
    pageLinks,
    headings,
    metaTags,
    imgAltMissing,
    imgTotal,
    langAttr,
    httpStatus,
    fetchWarning,
    siteName
  };
}

import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'eu-west-2' });

const MODEL_ID = 'amazon.nova-micro-v1:0';
const CH_BASE = 'https://api.company-information.service.gov.uk';

// ── SIC code → sector taxonomy ───────────────────────────────────────────────
// Ordered most-specific first so shorter prefix patterns don't shadow longer ones.
const SIC_MAP = [
  [/^65/,           'insurance'],
  [/^64|^66/,       'financial-services'],
  [/^6820/,         'letting-agents'],
  [/^68/,           'estate-agents'],
  [/^86|^87/,       'healthcare'],
  [/^85/,           'childcare-education'],
  [/^691/,          'legal-services'],
  [/^692/,          'accountancy'],
  [/^9200/,         'gambling'],
  [/^55|^79/,       'travel-tourism'],
  [/^56/,           'food-beverage'],
  [/^78/,           'recruitment'],
  [/^45/,           'automotive'],
  [/^62|^63/,       'saas-software'],
  [/^58|^59|^60/,   'media-publishing'],
  [/^21|^47730|^47740/, 'pharmaceuticals'],
  [/^47750|^2042/,  'cosmetics'],
  [/^4[123]/,       'construction-trades'],
  [/^88|^94/,       'charities'],
  [/^47/,           'ecommerce'],
];

function sicToSector(sicCodes) {
  for (const sic of (sicCodes || [])) {
    const code = String(sic).trim();
    for (const [pattern, sector] of SIC_MAP) {
      if (pattern.test(code)) return sector;
    }
  }
  return null;
}

// ── Companies House lookup ───────────────────────────────────────────────────

function chAuth(apiKey) {
  return 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
}

function normaliseName(s) {
  return s
    .toLowerCase()
    .replace(/\b(the|limited|ltd|plc|llp|uk|group|company|online|digital|solutions)\b/g, '')
    .replace(/\.(com|co\.uk|net|org)$/i, '')
    .replace(/^www\./i, '')
    .replace(/\W+/g, ' ')
    .trim();
}

async function classifyBySIC(siteName, apiKey) {
  if (!apiKey || !siteName) return null;
  try {
    const auth = chAuth(apiKey);
    const cleanName = normaliseName(siteName);
    if (!cleanName) return null;

    const searchRes = await fetch(
      `${CH_BASE}/search/companies?q=${encodeURIComponent(siteName)}&items_per_page=5`,
      { headers: { Authorization: auth }, signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return null;

    const { items = [] } = await searchRes.json();
    const active = items.find(c => c.company_status === 'active');
    if (!active) return null;

    // Require at least one meaningful word from the site name to appear in the CH result.
    const resultNorm = normaliseName(active.title || '');
    const words = cleanName.split(/\s+/).filter(w => w.length > 3);
    if (!words.length || !words.some(w => resultNorm.includes(w))) return null;

    const coRes = await fetch(
      `${CH_BASE}/company/${active.company_number}`,
      { headers: { Authorization: auth }, signal: AbortSignal.timeout(5000) }
    );
    if (!coRes.ok) return null;

    const co = await coRes.json();
    return sicToSector(co.sic_codes);
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function classifySector(pageContent) {
  const chKey = process.env.COMPANIES_HOUSE_API_KEY;

  // 1. Try Companies House SIC codes — fast, authoritative, free
  const chSector = await classifyBySIC(pageContent.siteName, chKey);
  if (chSector) {
    return { primary_sector: chSector, secondary_sectors: [], confidence: 'high', flags: {} };
  }

  // 2. Fall back to Nova Micro for unregistered/overseas/ambiguous sites
  const prompt = buildClassificationPrompt(pageContent);

  const command = new ConverseCommand({
    modelId: MODEL_ID,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 400, temperature: 0 }
  });

  const response = await bedrock.send(command);
  const text = response.output.message.content[0].text.trim();

  const jsonStr = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const result = JSON.parse(jsonStr);

  const VALID = new Set([
    'ecommerce', 'financial-services', 'healthcare', 'legal-services',
    'estate-agents', 'letting-agents', 'food-beverage', 'gambling',
    'travel-tourism', 'charities', 'construction-trades', 'insurance',
    'accountancy', 'childcare-education', 'recruitment', 'pharmaceuticals',
    'cosmetics', 'age-restricted', 'automotive', 'saas-software',
    'media-publishing', 'general'
  ]);
  if (!VALID.has(result.primary_sector)) {
    result.primary_sector = 'general';
  }

  return result;
}

function buildClassificationPrompt({ pageText, pageLinks, headings, targetUrl, metaTags }) {
  const url = targetUrl || '';
  const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();

  const topHeadings = headings.slice(0, 10).map(h => h.text).join(' | ');
  const topLinks = pageLinks.slice(0, 40).map(l => l.text).filter(Boolean).join(', ');
  const snippet = pageText.slice(0, 2000);
  const metaDesc = (metaTags?.['description'] || metaTags?.['og:description'] || metaTags?.['twitter:description'] || '').slice(0, 300);

  return `Classify the primary industry sector of this UK website for compliance auditing.

Domain: ${domain}
URL: ${url}
Meta description: ${metaDesc}
Headings: ${topHeadings}
Nav/link text: ${topLinks}
Page text (first 2000 chars): ${snippet}

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "primary_sector": "<one of the sectors below>",
  "secondary_sectors": [],
  "confidence": "high|medium|low",
  "flags": {
    "sells_physical_goods": false,
    "has_subscription": false,
    "restricted_goods": false,
    "has_user_generated_content": false,
    "may_process_children_data": false,
    "processes_special_category_data": false,
    "takes_payments": false
  }
}

Valid primary_sector values (pick the single best fit):
ecommerce | financial-services | healthcare | legal-services | estate-agents | letting-agents | food-beverage | gambling | travel-tourism | charities | construction-trades | insurance | accountancy | childcare-education | recruitment | pharmaceuticals | cosmetics | age-restricted | automotive | saas-software | media-publishing | general

Use "general" only if the site genuinely does not fit any specific sector.`;
}

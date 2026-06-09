import { load } from "cheerio";

// ─── All UK compliance checks, grouped ───────────────────────────────────────
export const CHECK_GROUPS = [
  {
    id: "data_protection",
    label: "Data Protection & Privacy",
    checks: [
      { id: "cookie_banner",       label: "Cookie consent banner",       severity: "high",   law: "PECR 2003 reg. 6" },
      { id: "privacy_policy",      label: "Privacy policy",              severity: "high",   law: "UK GDPR Art. 13" },
      { id: "cookie_policy",       label: "Cookie policy",               severity: "medium", law: "PECR 2003" },
      { id: "data_controller",     label: "Data controller identified",  severity: "high",   law: "UK GDPR Art. 13(1)(a)" },
      { id: "dsar_rights",         label: "Data subject rights",         severity: "medium", law: "UK GDPR Art. 15–22" },
      { id: "data_retention",      label: "Data retention periods",      severity: "medium", law: "UK GDPR Art. 13(2)(a)" },
      { id: "third_party_sharing", label: "Third-party data sharing",    severity: "medium", law: "UK GDPR Art. 13(1)(e)" },
      { id: "marketing_consent",   label: "Marketing consent mechanism", severity: "high",   law: "PECR 2003 reg. 22" },
      { id: "ico_registration",    label: "ICO registration number",     severity: "medium", law: "DPA 2018 s.61" },
    ],
  },
  {
    id: "security_company",
    label: "Security & Company Information",
    checks: [
      { id: "https",               label: "HTTPS / SSL",                        severity: "high",   law: "UK GDPR Art. 32" },
      { id: "company_name",        label: "Legal company name displayed",       severity: "high",   law: "Companies Act 2006 s.82" },
      { id: "company_number",      label: "Company registration number",        severity: "high",   law: "Companies Act 2006 s.82" },
      { id: "registered_address",  label: "Registered office address",          severity: "high",   law: "Companies Act 2006 s.82" },
      { id: "vat_number",          label: "VAT number (if VAT-registered)",     severity: "medium", law: "VAT Act 1994" },
      { id: "contact_details",     label: "Contact information",                severity: "medium", law: "Provision of Services Regs 2009" },
      { id: "email_address",       label: "Email address published",            severity: "medium", law: "Provision of Services Regs 2009 reg. 7" },
    ],
  },
  {
    id: "consumer_law",
    label: "Consumer Law",
    checks: [
      { id: "terms_conditions",    label: "Terms & conditions",                 severity: "medium", law: "Consumer Rights Act 2015" },
      { id: "refund_policy",       label: "Refund / returns policy",            severity: "medium", law: "Consumer Rights Act 2015 s.20" },
      { id: "cancellation_rights", label: "14-day cancellation right",          severity: "high",   law: "Consumer Contracts Regs 2013 reg. 29" },
      { id: "delivery_info",       label: "Delivery information & timeframes",  severity: "medium", law: "Consumer Contracts Regs 2013 reg. 13" },
      { id: "price_transparency",  label: "Prices shown inc. VAT & all fees",   severity: "medium", law: "Consumer Rights Act 2015 s.11" },
      { id: "pre_contract_info",   label: "Pre-contract information",           severity: "medium", law: "Consumer Contracts Regs 2013 reg. 10" },
      { id: "adr_dispute",         label: "ADR / dispute resolution scheme",    severity: "low",    law: "ADR Regulations 2015" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Advertising",
    checks: [
      { id: "review_disclosure",   label: "Review / testimonial disclosure",    severity: "medium", law: "CMA 2024 / CAP Code r. 3.45" },
      { id: "affiliate_disclosure",label: "Affiliate / paid partnership labels",severity: "medium", law: "CAP Code r. 2.3" },
      { id: "misleading_claims",   label: "No misleading advertising claims",   severity: "high",   law: "Consumer Protection from Unfair Trading 2008" },
      { id: "email_unsubscribe",   label: "Email unsubscribe mechanism",        severity: "medium", law: "PECR 2003 reg. 22" },
      { id: "comparison_ads",      label: "Comparison advertising fair & legal",severity: "low",    law: "Business Protection from Misleading Marketing Regs 2008" },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    checks: [
      { id: "accessibility_statement", label: "Accessibility statement",        severity: "medium", law: "Equality Act 2010 / PSBAR 2018" },
      { id: "img_alt_text",        label: "Images have alt text",               severity: "low",    law: "WCAG 2.1 AA / Equality Act 2010" },
      { id: "lang_attribute",      label: "HTML language attribute set",        severity: "low",    law: "WCAG 2.1 SC 3.1.1" },
      { id: "colour_contrast",     label: "Sufficient colour contrast",         severity: "low",    law: "WCAG 2.1 AA SC 1.4.3" },
      { id: "keyboard_navigation", label: "Keyboard-navigable interface",       severity: "low",    law: "WCAG 2.1 AA SC 2.1.1" },
    ],
  },
  {
    id: "sector_specific",
    label: "Sector-Specific",
    checks: [
      { id: "financial_promotions",label: "FCA authorisation (financial svcs)", severity: "high",   law: "FSMA 2000 s.21" },
      { id: "age_verification",    label: "Age verification (restricted goods)",severity: "high",   law: "Licensing Act 2003 / AVAA 2023" },
      { id: "modern_slavery",      label: "Modern slavery statement",           severity: "medium", law: "Modern Slavery Act 2015 s.54" },
      { id: "professional_regs",   label: "Professional body / SRA disclosure",severity: "medium", law: "SRA Code / relevant professional regs" },
      { id: "healthcare_regs",     label: "Healthcare / medicines compliance",  severity: "high",   law: "Medicines Act 1968 / MHRA regs" },
      { id: "gambling_licence",    label: "Gambling Commission licence (if applicable)", severity: "high", law: "Gambling Act 2005" },
    ],
  },
];

// ─── Score weights ────────────────────────────────────────────────────────────
const SEVERITY_DEDUCTIONS = { high: 15, medium: 8, low: 4 };

function calculateScore(checks) {
  let score = 100;
  let critical = 0;
  for (const c of checks) {
    if (c.pass === false) {
      score -= SEVERITY_DEDUCTIONS[c.severity] ?? 4;
      if (c.severity === "high") critical++;
    }
  }
  return { overall_score: Math.max(0, score), critical_count: critical };
}

// ─── JS-shell detection ───────────────────────────────────────────────────────
function detectJsShell(html, $) {
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const hasSpaRoot = $('[id="root"],[id="app"],[id="__next"],[id="gatsby-focus-wrapper"]').length > 0;
  const thinText = bodyText.length < 400;
  const manyScripts = $("script").length > 8;
  const fewLinks = $("a").length < 4;
  const hasNoscript = $("noscript").text().toLowerCase().includes("javascript");

  if (thinText && hasSpaRoot)          return { isShell: true, reason: "This appears to be a JS-rendered app (React/Vue/Next.js). The server returned a near-empty HTML shell — actual content loads in the browser. Results may be incomplete." };
  if (thinText && manyScripts && fewLinks) return { isShell: true, reason: "Very little readable content found in the page source — the site likely renders content with JavaScript. Results may be incomplete." };
  if (hasNoscript && thinText)         return { isShell: true, reason: "The page requires JavaScript to display content. Static HTML returned is mostly empty. Results may be incomplete." };
  return { isShell: false, reason: null };
}

// ─── Build the page content string sent to every group ───────────────────────
function buildUserContent({ targetUrl, httpStatus, pageText, pageLinks, headings, metaTags, imgAltMissing, imgTotal, langAttr }) {
  return `
URL: ${targetUrl}
HTTPS: ${targetUrl.startsWith("https://") ? "yes" : "no"}
HTTP status: ${httpStatus ?? "unknown"}
HTML lang attribute: ${langAttr || "not set"}

--- PAGE TEXT (first 16 000 chars) ---
${pageText || "(empty — likely JS-rendered or blocked)"}

--- LINKS (href + anchor text) ---
${pageLinks.slice(0, 120).map(l => `${l.text} → ${l.href}`).join("\n") || "none"}

--- HEADINGS ---
${headings.map(h => `${h.tag}: ${h.text}`).join("\n") || "none"}

--- IMAGES ---
Total: ${imgTotal}, missing alt text: ${imgAltMissing}

--- META TAGS ---
${Object.entries(metaTags).slice(0, 30).map(([k, v]) => `${k}: ${v}`).join("\n") || "none"}
`.trim();
}

// ─── Build per-group system prompt ───────────────────────────────────────────
function buildSystemPrompt(group) {
  const checkDefs = group.checks
    .map(c => `  id:"${c.id}"  label:"${c.label}"  severity:"${c.severity}"  law:"${c.law}"`)
    .join("\n");

  return `You are a UK web compliance auditor specialising in ${group.label}.
You will receive scraped content from a website. Analyse it and return ONLY a valid JSON object — no markdown, no preamble.

Return exactly this structure:
{
  "group_id": "${group.id}",
  "checks": [
    {
      "id": "check_id",
      "label": "Check label",
      "pass": true,
      "severity": "high|medium|low",
      "law": "Relevant law",
      "explanation": "1–2 specific sentences: what you found, or exactly what was missing."
    }
  ]
}

Evaluate ALL ${group.checks.length} of these checks:
${checkDefs}

Rules:
- pass: true = compliant  |  false = non-compliant  |  null = not applicable / cannot determine
- Conditional checks (VAT number, cancellation rights, delivery, FCA, age verification, gambling, healthcare, modern slavery, professional regs): use null unless there is clear positive evidence the site is subject to that requirement.
- Explanations must be specific — name exactly what you found or what is missing. Never say "unable to determine" without explaining why.
- Return all ${group.checks.length} checks. Do not skip any.`;
}

// ─── Call DeepSeek for one group ─────────────────────────────────────────────
async function auditGroup(pageContent, group, apiKey) {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: buildSystemPrompt(group) },
        { role: "user",   content: buildUserContent(pageContent) },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(50000),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "DeepSeek error");

  const raw     = data.choices?.[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  const { url } = await request.json();

  if (!url || typeof url !== "string")
    return Response.json({ error: "A valid URL is required." }, { status: 400 });

  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

  // ── 1. Fetch the page ──────────────────────────────────────────────────────
  let html = "";
  let fetchWarning = null;
  let httpStatus = null;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    httpStatus = res.status;

    if (!res.ok) {
      if (res.status === 403 || res.status === 401)
        return Response.json({ error: `The site blocked the scanner (HTTP ${res.status}). Some sites reject automated requests.` }, { status: 422 });
      if (res.status === 404)
        return Response.json({ error: "Page not found (HTTP 404). Check the URL and try again." }, { status: 422 });
      fetchWarning = `The server returned HTTP ${res.status}. Results may be incomplete.`;
    }

    html = await res.text();
  } catch (e) {
    if (e.name === "TimeoutError" || e.message?.includes("timeout"))
      return Response.json({ error: "The site took too long to respond (12s timeout)." }, { status: 422 });
    if (e.cause?.code === "ENOTFOUND" || e.message?.includes("ENOTFOUND"))
      return Response.json({ error: "Domain not found. Check the URL is correct and the site is live." }, { status: 422 });
    if (e.cause?.code === "ECONNREFUSED")
      return Response.json({ error: "Connection refused. The site may be down or blocking automated requests." }, { status: 422 });
    return Response.json({ error: `Could not reach the site: ${e.message}` }, { status: 422 });
  }

  // ── 2. Parse HTML ──────────────────────────────────────────────────────────
  const $ = load(html);
  const jsShell = detectJsShell(html, $);

  $("script, style, noscript, svg, iframe").remove();

  const metaTags = {};
  $("meta").each((_, el) => {
    const name = $(el).attr("name") || $(el).attr("property") || "";
    const content = $(el).attr("content") || "";
    if (name) metaTags[name.toLowerCase()] = content;
  });

  const pageLinks = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim().toLowerCase();
    if (href && text) pageLinks.push({ href, text });
  });

  const headings = [];
  $("h1, h2, h3").each((_, el) => {
    headings.push({ tag: el.name, text: $(el).text().trim().slice(0, 80) });
  });

  let imgAltMissing = 0, imgTotal = 0;
  $("img").each((_, el) => {
    imgTotal++;
    if ($(el).attr("alt") === undefined || $(el).attr("alt") === null) imgAltMissing++;
  });

  const langAttr = $("html").attr("lang") || "";
  const pageText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 16000);

  // ── 3. Extract site name from title/og ────────────────────────────────────
  const siteName = metaTags["og:site_name"] || $("title").text().trim().split(/[|\-–]/)[0].trim() || new URL(targetUrl).hostname;

  // ── 4. Check API key ───────────────────────────────────────────────────────
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey)
    return Response.json({ error: "DEEPSEEK_API_KEY is not set." }, { status: 500 });

  const pageContent = { targetUrl, httpStatus, pageText, pageLinks, headings, metaTags, imgAltMissing, imgTotal, langAttr };

  // ── 5. Stream results as each group completes ─────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send metadata immediately so the frontend can show the site name
      controller.enqueue(encoder.encode(
        JSON.stringify({
          type: "meta",
          site_name: siteName,
          total_groups: CHECK_GROUPS.length,
          total_checks: CHECK_GROUPS.reduce((n, g) => n + g.checks.length, 0),
          js_shell: jsShell.isShell,
          js_shell_reason: jsShell.reason,
          fetch_warning: fetchWarning,
        }) + "\n"
      ));

      let completed = 0;
      const allChecks = [];

      const promises = CHECK_GROUPS.map((group) =>
        auditGroup(pageContent, group, apiKey)
          .then((result) => {
            completed++;
            const checks = result.checks || [];
            allChecks.push(...checks);

            controller.enqueue(encoder.encode(
              JSON.stringify({ type: "group", group_id: group.id, group_label: group.label, checks }) + "\n"
            ));

            // When all groups done, send the final score summary
            if (completed === CHECK_GROUPS.length) {
              const { overall_score, critical_count } = calculateScore(allChecks);
              controller.enqueue(encoder.encode(
                JSON.stringify({ type: "done", overall_score, critical_count }) + "\n"
              ));
              controller.close();
            }
          })
          .catch((err) => {
            completed++;
            controller.enqueue(encoder.encode(
              JSON.stringify({ type: "group_error", group_id: group.id, group_label: group.label, message: err.message }) + "\n"
            ));
            if (completed === CHECK_GROUPS.length) controller.close();
          })
      );

      // Suppress unhandled rejection warnings — errors are handled above
      Promise.all(promises).catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache",
    },
  });
}

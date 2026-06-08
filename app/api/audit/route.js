import { load } from "cheerio";

const SYSTEM_PROMPT = `You are a UK web compliance auditor. You will be given scraped content from a website. Analyse it for UK legal compliance and return ONLY a valid JSON object — no markdown, no preamble, no trailing text.

Use exactly this structure:
{
  "site_name": "Human-readable site name derived from the content",
  "checks": [
    {
      "id": "cookie_banner",
      "label": "Cookie consent",
      "pass": true,
      "severity": "high",
      "law": "PECR 2003",
      "explanation": "1–2 sentences: what you found or specifically did not find."
    }
  ],
  "overall_score": 65,
  "critical_count": 2
}

Evaluate ALL of these checks in order:
1. id: "cookie_banner"      label: "Cookie consent"              severity: "high"   law: "PECR 2003"
2. id: "privacy_policy"     label: "Privacy policy"              severity: "high"   law: "UK GDPR Art. 13"
3. id: "cookie_policy"      label: "Cookie policy"               severity: "medium" law: "PECR 2003"
4. id: "https"              label: "HTTPS / SSL"                 severity: "high"   law: "UK GDPR Art. 32"
5. id: "company_info"       label: "Company information"         severity: "medium" law: "Companies Act 2006 s.82"
6. id: "terms_conditions"   label: "Terms & conditions"          severity: "medium" law: "Consumer Rights Act 2015"
7. id: "refund_policy"      label: "Refund / returns policy"     severity: "medium" law: "Consumer Rights Act 2015"
8. id: "accessibility"      label: "Accessibility basics"        severity: "low"    law: "Equality Act 2010"
9. id: "vat_number"         label: "VAT number"                  severity: "low"    law: "VAT Act 1994"
10. id: "review_disclosure" label: "Review platform disclosure"  severity: "low"    law: "CAP Code / CMA 2024"

Rules:
- pass: true = compliant, false = non-compliant, null = cannot determine or not applicable
- overall_score: 0–100, weighted by severity (each high fail = -15 pts, medium = -8 pts, low = -4 pts, start from 100)
- critical_count: number of high-severity fails only
- For refund_policy: null unless site clearly sells products/services online
- For vat_number: null unless there is clear evidence they are VAT-registered
- For https: base on whether the URL provided starts with https://
- Explanations must be specific — name what you found or exactly what was missing`;

// Heuristics for detecting a JS-rendered shell page.
// Returns an object with { isShell: bool, reason: string }
function detectJsShell(html, $) {
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const linkCount = $("a").length;
  const scriptCount = $("script").length;
  const textLength = bodyText.length;

  // Common SPA shell signals
  const hasSpaRoot =
    $('[id="root"], [id="app"], [id="__next"], [id="gatsby-focus-wrapper"]').length > 0;
  const hasNoscriptFallback = $("noscript").text().toLowerCase().includes("javascript");
  const thinText = textLength < 400;
  const manyScripts = scriptCount > 8;
  const fewLinks = linkCount < 4;

  if (thinText && hasSpaRoot) {
    return {
      isShell: true,
      reason:
        "This site appears to be a JavaScript-rendered app (React, Vue, Angular, etc.). " +
        "The server returned a near-empty HTML shell — the actual content loads in the browser via JS. " +
        "Results below are based on limited static content only and may be incomplete.",
    };
  }

  if (thinText && manyScripts && fewLinks) {
    return {
      isShell: true,
      reason:
        "Very little readable content was found in the page source — this site likely renders its content with JavaScript. " +
        "Results may be incomplete; a headless browser (Puppeteer) would give a full audit.",
    };
  }

  if (hasNoscriptFallback && thinText) {
    return {
      isShell: true,
      reason:
        "The page requires JavaScript to display its content. " +
        "The static HTML returned to the scanner is mostly empty. Results may be incomplete.",
    };
  }

  return { isShell: false, reason: null };
}

export async function POST(request) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return Response.json({ error: "A valid URL is required." }, { status: 400 });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

  // --- 1. Fetch the page ---
  let html = "";
  let fetchError = null;
  let fetchWarning = null; // non-fatal issues shown to user
  let httpStatus = null;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    httpStatus = res.status;

    if (!res.ok) {
      // Surface HTTP errors clearly rather than silently continuing
      if (res.status === 403 || res.status === 401) {
        return Response.json(
          {
            error: `The site blocked the scanner (HTTP ${res.status}). Some sites reject non-browser requests. Try visiting the URL directly to confirm it's accessible.`,
          },
          { status: 422 }
        );
      }
      if (res.status === 404) {
        return Response.json(
          { error: `Page not found (HTTP 404). Check the URL and try again.` },
          { status: 422 }
        );
      }
      // Other non-OK statuses — try to continue with whatever we got
      fetchWarning = `The server returned HTTP ${res.status}. Results may be incomplete.`;
    }

    html = await res.text();
  } catch (e) {
    // Surface network/timeout errors to the user instead of silently continuing
    if (e.name === "TimeoutError" || e.message?.includes("timeout")) {
      return Response.json(
        {
          error:
            "The site took too long to respond (12 s timeout). It may be blocking automated requests or temporarily down.",
        },
        { status: 422 }
      );
    }
    if (e.cause?.code === "ENOTFOUND" || e.message?.includes("ENOTFOUND")) {
      return Response.json(
        { error: "Domain not found. Check the URL is correct and the site is live." },
        { status: 422 }
      );
    }
    if (e.cause?.code === "ECONNREFUSED") {
      return Response.json(
        { error: "Connection refused. The site may be down or blocking automated requests." },
        { status: 422 }
      );
    }
    // Catch-all — still surface it
    return Response.json(
      { error: `Could not reach the site: ${e.message}` },
      { status: 422 }
    );
  }

  // --- 2. Parse HTML with cheerio ---
  let pageText = "";
  let pageLinks = [];
  let metaTags = {};
  let headings = [];
  let imgAltMissing = 0;
  let imgTotal = 0;
  let jsShell = { isShell: false, reason: null };

  const $ = load(html);

  // Detect JS-rendered shell BEFORE stripping scripts
  jsShell = detectJsShell(html, $);

  // Remove noise
  $("script, style, noscript, svg, iframe").remove();

  // Meta tags
  $("meta").each((_, el) => {
    const name = $(el).attr("name") || $(el).attr("property") || "";
    const content = $(el).attr("content") || "";
    if (name) metaTags[name.toLowerCase()] = content;
  });

  // Links (for finding privacy/T&C/cookie policy pages)
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim().toLowerCase();
    if (href && text) pageLinks.push({ href, text });
  });

  // Headings
  $("h1, h2, h3").each((_, el) => {
    headings.push({ tag: el.name, text: $(el).text().trim().slice(0, 80) });
  });

  // Images — alt text audit
  $("img").each((_, el) => {
    imgTotal++;
    const alt = $(el).attr("alt");
    if (alt === undefined || alt === null) imgAltMissing++;
  });

  // Body text (truncated for token budget)
  pageText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 18000);

  // --- 3. Build the prompt ---
  const userContent = `
URL: ${targetUrl}
HTTPS: ${targetUrl.startsWith("https://") ? "yes" : "no"}
HTTP status: ${httpStatus ?? "unknown"}
JS-rendered shell detected: ${jsShell.isShell ? "YES — content may be incomplete" : "no"}
Fetch warning (if any): ${fetchWarning || "none"}

--- PAGE TEXT (first 18,000 chars) ---
${pageText || "(empty — likely JS-rendered or blocked)"}

--- LINKS FOUND ON PAGE (href + anchor text) ---
${pageLinks
  .slice(0, 150)
  .map((l) => `${l.text} → ${l.href}`)
  .join("\n") || "none"}

--- HEADINGS ---
${headings.map((h) => `${h.tag}: ${h.text}`).join("\n") || "none"}

--- IMAGES ---
Total: ${imgTotal}, missing alt text: ${imgAltMissing}

--- META TAGS ---
${Object.entries(metaTags)
  .slice(0, 30)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n") || "none"}

${jsShell.isShell ? "NOTE: This is a JS-rendered site. Mark checks as null (cannot determine) where the static HTML gives insufficient evidence, rather than false." : ""}

Analyse the above for UK compliance and return your JSON report.
`.trim();

  // --- 4. Call DeepSeek ---
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "DEEPSEEK_API_KEY is not set in environment variables." },
      { status: 500 }
    );
  }

  let report;

  try {
    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(40000),
    });

    const dsData = await dsRes.json();

    if (dsData.error) {
      throw new Error(dsData.error.message || "DeepSeek API error");
    }

    const raw = dsData.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    report = JSON.parse(cleaned);
  } catch (e) {
    return Response.json(
      { error: `Analysis failed: ${e.message}` },
      { status: 500 }
    );
  }

  // Attach any warnings so the frontend can display them
  if (jsShell.isShell) report._warning = jsShell.reason;
  if (fetchWarning)    report._fetchWarning = fetchWarning;

  return Response.json(report);
}

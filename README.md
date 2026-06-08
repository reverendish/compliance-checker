# UK Compliance Checker

A portfolio tool for [ishsitotombe.co.uk](https://ishsitotombe.co.uk) — paste any UK website URL to get an instant compliance audit against GDPR, PECR, and consumer law.

## Stack

- **Next.js 14** (App Router)
- **DeepSeek API** (`deepseek-chat`) with JSON mode — fast and cheap
- **Cheerio** for server-side HTML parsing
- No database, no auth, no external services beyond DeepSeek

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your DeepSeek API key

Copy `.env.local.example` to `.env.local` and fill in your key:

```bash
cp .env.local.example .env.local
```

Get a key at [platform.deepseek.com](https://platform.deepseek.com).

### 3. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Deploy to Netlify

This is the recommended deploy target. A `netlify.toml` is already included.

### Option A — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init        # link to a new or existing site
netlify deploy --prod
```

### Option B — Netlify dashboard (drag & drop)

1. `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com) → drag the `.next` folder onto the deploy zone

### Set environment variable

In **Site settings → Environment variables**, add:

```
DEEPSEEK_API_KEY = your_key_here
```

### Custom subdomain

In Netlify → **Domain management**, add `compliance.ishsitotombe.co.uk` as a custom domain, then add a CNAME record in your DNS pointing to your Netlify site URL.


## What it checks

| Check | Law | Severity |
|---|---|---|
| Cookie consent banner | PECR 2003 | High |
| Privacy policy | UK GDPR Art. 13 | High |
| Cookie policy | PECR 2003 | Medium |
| HTTPS / SSL | UK GDPR Art. 32 | High |
| Company information | Companies Act 2006 s.82 | Medium |
| Terms & conditions | Consumer Rights Act 2015 | Medium |
| Refund / returns policy | Consumer Rights Act 2015 | Medium |
| Accessibility basics | Equality Act 2010 | Low |
| VAT number | VAT Act 1994 | Low |
| Review platform disclosure | CAP Code / CMA 2024 | Low |

## Limitations (shown in the UI)

- Scans publicly visible HTML only — JS-rendered content (like many cookie banners) may not be detected
- Cannot verify actual data processing practices
- Not legal advice

## Upgrade path

To detect JS-rendered cookie banners properly, replace the `fetch()` in the API route with a Puppeteer call:

```js
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(targetUrl, { waitUntil: "networkidle2" });
const html = await page.content();
await browser.close();
```

Add `puppeteer` to your dependencies and deploy to a host that supports it (Railway, Render, or a VPS — not Vercel's default edge runtime).

# UK Compliance Checker

A portfolio tool for [ishsitotombe.co.uk](https://ishsitotombe.co.uk) — paste any UK website URL to get an instant compliance audit against GDPR, PECR, and consumer law.

## Stack

- **Next.js 14** (App Router) — frontend
- **AWS Lambda** — serverless backend (300s timeout, 512MB memory, eu-west-2)
- **AWS Bedrock** — AI models (Sonnet 4.6 for classification, Nova Pro for compliance checks)
- **Cheerio** for server-side HTML parsing
- **Companies House API** for business lookup (proxied via Lambda)
- No database, no auth, no self-hosted servers

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Deploy Lambda backend

The compliance checker requires AWS Lambda + Bedrock for the audit engine. Deploy once:

```bash
cd infrastructure
sam build
sam deploy --guided --stack-name ish-compliance-checker --region eu-west-2
```

Copy the `AuditApiUrl` from the CloudFormation outputs.

### 3. Run locally

```bash
NEXT_PUBLIC_AUDIT_API_URL=https://your-api-id.execute-api.eu-west-2.amazonaws.com npm run dev
```

Replace `your-api-id` with the URL from step 2.

Visit [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Deploy to Netlify

The frontend is deployed to Netlify. A `netlify.toml` is already included.

### 1. Deploy Lambda backend first

See "Setup" section above. You need the AWS API Gateway URL.

### 2. Deploy frontend to Netlify

```bash
npm install -g netlify-cli
netlify login
netlify init        # link to a new or existing site
netlify deploy --prod
```

### 3. Set environment variable

In **Site settings → Environment variables**, add:

```
NEXT_PUBLIC_AUDIT_API_URL = https://your-api-id.execute-api.eu-west-2.amazonaws.com
```

Then redeploy.

### Custom subdomain

In Netlify → **Domain management**, add `compliance.ishsitotombe.co.uk` as a custom domain, then add a CNAME record in your DNS pointing to your Netlify site URL.


## What it checks

**260+ compliance checks** across 21 industry sectors:

- **Universal (20 checks):** GDPR, PECR, accessibility, company info, consumer law, marketing
- **E-Commerce & Retail (10 checks):** Cancellation rights, delivery, refunds, drip pricing, product safety
- **Financial Services (8 checks):** FCA authorisation, risk warnings, consumer duty, credit terms
- **Healthcare (7 checks):** CQC registration, medicine advertising, health claims, professional registration
- **Legal Services (8 checks):** SRA authorisation, complaints, costs transparency, client money
- **Estate & Letting Agents (15 checks):** Ombudsman membership, AML policy, deposit schemes, tenant fees
- **Food & Beverage (7 checks):** Allergen info, FSA registration, calorie labelling, nutrition claims
- **Gambling (8 checks):** Gambling Commission licence, GamStop, safer gambling tools, age verification
- **Travel & Tourism (7 checks):** ATOL protection, ABTA, package info, cancellation policy
- **Charities (8 checks):** Charity number, trustee transparency, gift aid, financial accounts
- **Construction & Trades (8 checks):** Gas Safe, NICEIC, public liability, competent person schemes
- **Insurance (7 checks):** FCA authorisation, IPIDs, IPT disclosure, claims process
- **Accountancy (7 checks):** Professional membership, AML policy, HMRC registration, client money
- **Childcare & Education (8 checks):** Ofsted registration, safeguarding, DBS checks, EYFS compliance
- **Recruitment (7 checks):** Employment Agencies Act, AWR compliance, REC membership, fee transparency
- **Pharmaceuticals (7 checks):** MHRA logo, GPhC registration, prescription rules, medicine safety
- **Cosmetics (7 checks):** Responsible person, SCPN notification, ingredient labelling, safety assessment
- **Age-Restricted (7 checks):** Age verification, Challenge 25, delivery policy, health warnings
- **Automotive (7 checks):** FCA finance, 30-day rejection, disclosure, distance selling
- **SaaS & Software (8 checks):** DPA, cancellation, uptime SLA, data portability, AI transparency
- **Media & Publishing (7 checks):** IPSO membership, corrections, copyright, editorial standards

## Limitations (shown in the UI)

- Scans publicly visible HTML only — JS-rendered content (React/Vue/Next.js) may not be fully detected
- Cannot verify actual backend data practices or contract terms
- Not legal advice — consult a solicitor for compliance disputes
- Results are indicative, not definitive

## Performance

- **Typical audit**: 30–60 seconds
- **Lambda timeout**: 300 seconds (5 minutes)
- **Lambda memory**: 512 MB
- **Region**: eu-west-2 (London)

## Cost (AWS)

Per audit (typical):
- Lambda: ~$0.0001 (negligible)
- Bedrock: ~$0.005 (Sonnet classification + Nova check batching)
- Data transfer: free (within AWS region)

**Estimated cost**: $0.005 per audit + $0.50/month Lambda baseline

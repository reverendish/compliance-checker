// Deterministic compliance check functions — zero AI
// Each function: (page) => { pass: boolean|null, notes: string }
//
// page shape:
//   url, html, text, links [{href,text}], meta, langAttr,
//   imgAltMissing, imgTotal, httpStatus, privacyText, privacyHtml

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function tm(str, patterns) {
  if (!str) return false;
  return patterns.some(p => p.test(str));
}

function lm(links, patterns) {
  return links.some(l => patterns.some(p => p.test(l.href) || p.test(l.text)));
}

function allText(page) {
  return (page.text || '') + ' ' + (page.privacyText || '');
}

// ─────────────────────────────────────────────────────────────────────
// Universal — Data Protection & Privacy
// ─────────────────────────────────────────────────────────────────────

function cookie_banner(page) {
  const src = (page.text || '') + ' ' + (page.html || '');
  const pass = tm(src, [
    /we use cookies/i, /this (website|site) uses cookies/i,
    /cookie (consent|notice|banner|preferences|settings)/i,
    /accept (all )?cookies/i, /reject (all )?cookies/i,
    /decline (all )?cookies/i, /manage (cookie )?preferences/i,
    /cookiebot/i, /onetrust/i, /CookieConsent/i,
    /cookie-consent/i, /cookie-law/i, /gdpr-cookie/i,
  ]);
  return { pass, notes: pass ? 'Cookie consent mechanism found.' : 'No cookie consent banner detected. PECR 2003 reg. 6 requires consent before setting non-essential cookies.' };
}

function privacy_policy(page) {
  const pass = lm(page.links, [/privacy/i, /data.polic/i, /gdpr/i]) ||
    tm(page.text, [/privacy policy/i, /privacy notice/i]);
  return { pass, notes: pass ? 'Privacy policy link found.' : 'No privacy policy link detected. UK GDPR Art. 13 requires one.' };
}

function cookie_policy(page) {
  const pass = lm(page.links, [/cookie.polic/i, /cookie.notice/i, /about.cookie/i]) ||
    tm(allText(page), [/cookie policy/i, /our cookies/i, /types of cookies/i, /how we use cookies/i]);
  return { pass, notes: pass ? 'Cookie policy found.' : 'No dedicated cookie policy found. PECR 2003 requires disclosure of cookie types and purposes.' };
}

function data_controller(page) {
  const p = page.privacyText;
  if (!p) return { pass: null, notes: 'Privacy policy not accessible — cannot verify data controller is named.' };
  const pass = tm(p, [
    /data controller/i, /we are responsible for/i,
    /controller of your (personal )?data/i, /as the (data )?controller/i,
    /data (controller|processor)/i,
  ]);
  return { pass, notes: pass ? 'Data controller identified in privacy policy.' : 'No data controller identification found in privacy policy. UK GDPR Art. 13(1)(a) requires this.' };
}

function lawful_basis(page) {
  const p = page.privacyText;
  if (!p) return { pass: null, notes: 'Privacy policy not accessible — cannot verify lawful basis.' };
  const pass = tm(p, [
    /lawful basis/i, /legal basis/i, /legitimate interest/i,
    /contractual (necessity|obligation)/i, /legal obligation/i,
    /vital interest/i, /public (task|interest)/i,
    /basis for processing/i, /grounds for processing/i,
  ]);
  return { pass, notes: pass ? 'Lawful basis for data processing stated in privacy policy.' : 'No lawful basis for processing found. UK GDPR Art. 6 / Art. 13(1)(c) requires this.' };
}

function dsar_rights(page) {
  const p = page.privacyText;
  if (!p) return { pass: null, notes: 'Privacy policy not accessible — cannot verify data subject rights.' };
  const pass = tm(p, [
    /your rights/i, /right to access/i, /right to erasure/i,
    /right to be forgotten/i, /right to rectification/i, /right to object/i,
    /right to restrict/i, /right to portability/i, /data subject rights/i,
    /subject access request/i, /\bSAR\b/,
  ]);
  return { pass, notes: pass ? 'Data subject rights explained in privacy policy.' : 'No data subject rights explanation found. UK GDPR Art. 15-22 requires this.' };
}

function third_party_sharing(page) {
  const t = allText(page);
  const pass = tm(t, [
    /third.part(y|ies)/i, /we (may )?share/i, /sharing.*personal data/i,
    /data.*shared/i, /recipients/i, /processors/i,
    /partners.*data/i, /transfer.*data/i, /disclose.*data/i,
  ]);
  return { pass, notes: pass ? 'Third-party data sharing disclosed.' : 'No third-party data sharing disclosure found. UK GDPR Art. 13(1)(e) requires this.' };
}

function marketing_consent(page) {
  const h = page.html || '';
  const hasForm = /<(form|input)/i.test(h);
  if (!hasForm) return { pass: null, notes: 'No sign-up forms detected — marketing consent not applicable.' };
  const pass = tm(h, [
    /marketing.*checkbox/i, /checkbox.*market/i,
    /opt.in.*email/i, /email.*opt.in/i,
    /consent.*marketing/i, /marketing.*consent/i,
    /newsletter.*checkbox/i, /I agree to receive/i,
  ]) || tm(page.text, [/opt.in/i, /consent to.*marketing/i, /agree to receive.*email/i]);
  return { pass, notes: pass ? 'Marketing consent opt-in mechanism found.' : 'Form detected but no clear marketing opt-in found. PECR 2003 reg. 22 requires explicit consent for marketing emails.' };
}

function ico_registration(page) {
  const t = allText(page);
  const pass = /\b(Z[A-Z]?\d{6,7}|[ABC]\d{7})\b/.test(t) ||
    /ico\.org\.uk\/ESDWebPages\/Entry\//i.test(t) ||
    tm(t, [/registered with the ico/i, /ico registration (number|no)/i, /data protection registration/i]);
  return { pass, notes: pass ? 'ICO registration number or reference found.' : 'No ICO registration number found. DPA 2018 s.61 requires organisations processing personal data to be ICO-registered.' };
}

function dpo_contact(page) {
  const t = allText(page);
  const found = tm(t, [/data protection officer/i, /\bDPO\b/, /dpo@/i, /dataprotection@/i]);
  if (!found) return { pass: null, notes: 'No DPO contact found — only mandatory for organisations processing special category data at scale.' };
  return { pass: true, notes: 'DPO contact details found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Universal — Security & Company Information
// ─────────────────────────────────────────────────────────────────────

function https(page) {
  const pass = page.url.startsWith('https://');
  return { pass, notes: pass ? 'Site uses HTTPS.' : 'Site does not use HTTPS. UK GDPR Art. 32 requires appropriate security measures.' };
}

function company_name(page) {
  const t = allText(page);
  const pass = tm(t, [
    /\b(Ltd|Limited|PLC|plc|LLP|LP|CIC|CIO)\b/,
    /registered (in england|in scotland|in wales|in uk)/i,
    /companies house/i,
  ]);
  return { pass, notes: pass ? 'Legal company designation (Ltd/Limited/PLC etc.) found.' : 'No legal company name found. Companies Act 2006 s.82 requires registered companies to display their legal name.' };
}

function company_number(page) {
  const t = allText(page);
  const pass =
    /\b(0[0-9]{7}|[1-9][0-9]{7}|SC\d{6}|NI\d{6}|OC\d{6}|CE\d{6}|IP\d{6}|SO\d{6}|RS\d{6}|FC\d{6}|BR\d{6})\b/.test(t) ||
    /company (registration |number|no\.?)[:\s]*\d{5,8}/i.test(t) ||
    /registered number[:\s]*\d{5,8}/i.test(t);
  return { pass, notes: pass ? 'Company registration number found.' : 'No UK company registration number found. Companies Act 2006 s.82 requires limited companies to display this.' };
}

function registered_address(page) {
  const t = allText(page);
  const pass = tm(t, [/registered (office|address)/i, /our registered office/i]) ||
    (/[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/i.test(t) && tm(t, [/ltd|limited|plc|llp/i]));
  return { pass, notes: pass ? 'Registered office address found.' : 'No registered office address found. Companies Act 2006 s.82 requires limited companies to display this.' };
}

function contact_details(page) {
  const t = page.text || '';
  const h = page.html || '';
  const pass =
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(t) ||
    /(\+44|0)\s?[\d\s\-()]{9,14}/.test(t) ||
    lm(page.links, [/contact/i, /mailto:/i, /tel:/i]) ||
    (/<form/i.test(h) && /contact/i.test(h));
  return { pass, notes: pass ? 'Contact information (email, phone, or contact form) found.' : 'No contact details found. E-Commerce Regulations 2002 require businesses to provide contact information.' };
}

// ─────────────────────────────────────────────────────────────────────
// Universal — Accessibility
// ─────────────────────────────────────────────────────────────────────

function lang_attribute(page) {
  const pass = !!(page.langAttr && page.langAttr.length > 0);
  return { pass, notes: pass ? `HTML lang attribute set to "${page.langAttr}".` : 'No lang attribute on <html> element. WCAG 2.1 SC 3.1.1 requires this.' };
}

function img_alt_text(page) {
  const { imgTotal = 0, imgAltMissing = 0 } = page;
  if (imgTotal === 0) return { pass: null, notes: 'No images found on this page.' };
  const pass = imgAltMissing === 0;
  return {
    pass,
    notes: pass
      ? `All ${imgTotal} image(s) have alt text.`
      : `${imgAltMissing} of ${imgTotal} image(s) missing alt text. WCAG 2.1 AA requires alternative text for all informative images.`,
  };
}

function accessibility_statement(page) {
  const pass = lm(page.links, [/accessibility/i]) ||
    tm(page.text, [/accessibility statement/i, /accessibility policy/i]);
  return { pass, notes: pass ? 'Accessibility statement found.' : 'No accessibility statement found. Required for public sector under PSBAR 2018; best practice for all.' };
}

// ─────────────────────────────────────────────────────────────────────
// Universal — Marketing
// ─────────────────────────────────────────────────────────────────────

function misleading_claims(page) {
  const t = page.text || '';
  const flags = [
    /\bnumber\s*(1|one)\s*(in the uk|in uk|rated)\b/i,
    /\b100%\s*(guaranteed|success rate|effective|accurate)\b/i,
    /\bguaranteed results\b/i,
    /\bthe (cheapest|best value|fastest|most trusted) in (the )?uk\b/i,
    /\bcertified number one\b/i,
  ].filter(p => p.test(t));
  if (flags.length === 0) return { pass: true, notes: 'No obviously misleading absolute claims detected.' };
  return { pass: false, notes: `Potentially misleading unsubstantiated claim(s) found. Consumer Protection from Unfair Trading Regulations 2008 prohibits these.` };
}

function review_disclosure(page) {
  const t = page.text || '';
  const h = page.html || '';
  const hasReviews =
    tm(t, [/customer review/i, /testimonial/i, /star rating/i, /\d+(\.\d)?\s*\/\s*5/i]) ||
    tm(h, [/trustpilot/i, /google.*review/i, /reviews\.co\.uk/i, /feefo/i, /yotpo/i, /bazaarvoice/i, /trustindex/i]);
  if (!hasReviews) return { pass: null, notes: 'No customer reviews or testimonials detected.' };
  const verified = tm(h, [/trustpilot/i, /reviews\.co\.uk/i, /feefo/i, /yotpo/i, /bazaarvoice/i, /trustindex/i, /google.*review/i]);
  return {
    pass: verified,
    notes: verified
      ? 'Reviews appear to come from a verified third-party platform.'
      : 'Reviews found but not from a clearly verified platform. DMCC Act 2024 requires authenticity.',
  };
}

// ─────────────────────────────────────────────────────────────────────
// Ecommerce
// ─────────────────────────────────────────────────────────────────────

function cancellation_rights(page) {
  const t = allText(page);
  const pass = tm(t, [/14.day/i, /fourteen.day/i, /right to cancel/i, /cancellation (rights|period|policy)/i, /cooling.off/i]);
  return { pass, notes: pass ? '14-day cancellation right mentioned.' : 'No 14-day cancellation right found. Consumer Contracts Regulations 2013 reg. 29 requires this for online sales.' };
}

function drip_pricing(page) {
  const t = page.text || '';
  const hidden = tm(t, [/\+ (booking|service|admin|processing) fee/i, /fees added at checkout/i, /mandatory.*charge.*payment/i]);
  if (hidden) return { pass: false, notes: 'Potential drip pricing found — compulsory fees mentioned separately from the main price. DMCC Act 2024 prohibits this.' };
  return { pass: null, notes: 'Cannot verify drip pricing without following checkout flow. No obvious hidden fee indicators on static page.' };
}

function delivery_info(page) {
  const t = allText(page);
  const pass = tm(t, [
    /delivery (in|within|time|timeframe)/i, /\d+.?\d*\s*(working\s)?days?/i,
    /next.day (delivery|dispatch)/i, /same.day delivery/i,
    /standard delivery/i, /free (delivery|shipping)/i,
    /dispatch(ed)? (within|in)/i, /ships? in/i,
  ]);
  return { pass, notes: pass ? 'Delivery timeframe information found.' : 'No delivery timeframes found. Consumer Contracts Regulations 2013 reg. 13 requires delivery info before checkout.' };
}

function refund_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/refund policy/i, /returns policy/i, /return (policy|procedure)/i, /money.back/i]) ||
    lm(page.links, [/refund/i, /return/i]);
  return { pass, notes: pass ? 'Refund/returns policy found.' : 'No refund policy found. Consumer Rights Act 2015 s.20 requires clear return rights for online retailers.' };
}

function pre_contract_info(page) {
  const t = page.text || '';
  const hasPrice = /[£€\$]\d+|\d+\s*per\s/i.test(t);
  const hasDelivery = /deliver|shipping/i.test(t);
  const hasTerms = /terms|condition/i.test(t);
  const pass = hasPrice && hasDelivery && hasTerms;
  return {
    pass,
    notes: pass
      ? 'Price, delivery, and terms information found before purchase.'
      : `Pre-contract information incomplete — missing: ${[!hasPrice && 'price', !hasDelivery && 'delivery info', !hasTerms && 'terms'].filter(Boolean).join(', ')}. Consumer Contracts Regulations 2013 reg. 10 requires these upfront.`,
  };
}

function product_safety(page) {
  const t = page.text || '';
  const hasProducts = /product|item|goods|buy|shop/i.test(t);
  if (!hasProducts) return { pass: null, notes: 'No products detected on this page.' };
  const pass = tm(t, [/\bUKCA\b/, /\bCE mark\b/i, /safety (complian|standard|certif)/i, /product safety/i, /\bBSI\b/]);
  return { pass, notes: pass ? 'Product safety marks or compliance information found.' : 'No product safety marks (UKCA, CE) found. Product Safety and Metrology Regulations 2025 applies.' };
}

function subscription_clarity(page) {
  const t = allText(page);
  const hasSub = /subscription|auto.renew/i.test(t);
  if (!hasSub) return { pass: null, notes: 'No subscription offering detected.' };
  const pass = tm(t, [/cancel (anytime|at any time)/i, /how to cancel/i, /cancel your subscription/i, /cancellation (terms|policy)/i]);
  return { pass, notes: pass ? 'Subscription cancellation terms found.' : 'Subscription detected but no clear cancellation instructions. Consumer Contracts Regulations 2013 / DMCC Act 2024 require easy cancellation.' };
}

function price_vat_inclusive(page) {
  const t = page.text || '';
  const hasPrice = /[£€]\d+/.test(t);
  if (!hasPrice) return { pass: null, notes: 'No prices detected on this page.' };
  const pass = tm(t, [/inc(l|luding)?\.?\s*VAT/i, /including VAT/i, /VAT included/i, /prices include VAT/i, /\bex\.?\s*VAT\b/i]);
  return { pass, notes: pass ? 'VAT status of prices indicated.' : 'Prices found but no VAT indication. Consumer Rights Act 2015 requires VAT-inclusive prices for consumers.' };
}

function pci_dss_statement(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/PCI.DSS/i, /PCI compliant/i]) ||
    tm(h, [/stripe\.com/i, /paypal\.com/i, /braintree/i, /worldpay/i, /adyen/i, /checkout\.com/i, /sagepay/i, /opayo/i]);
  return { pass, notes: pass ? 'Secure payment processor or PCI DSS mention found.' : 'No PCI DSS statement or recognised payment processor detected.' };
}

function terms_conditions(page) {
  const pass = lm(page.links, [/terms/i, /t&c/i, /conditions/i]) ||
    tm(page.text, [/terms (of service|and conditions|of use)/i, /terms & conditions/i, /\bT&Cs\b/]);
  return { pass, notes: pass ? 'Terms and conditions found.' : 'No terms and conditions found. Consumer Rights Act 2015 / E-Commerce Regs 2002 require these.' };
}

// ─────────────────────────────────────────────────────────────────────
// Estate Agents
// ─────────────────────────────────────────────────────────────────────

function property_ombudsman_membership(page) {
  const t = allText(page);
  const pass = tm(t, [/property ombudsman/i, /\bTPOS\b/, /ombudsman.*scheme/i, /redress scheme/i, /propertymark/i]);
  return { pass, notes: pass ? 'Property redress scheme membership found.' : 'No property ombudsman/redress scheme found. Estate Agents Act 1979 requires membership.' };
}

function aml_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/anti.money laundering/i, /\bAML\b/, /money laundering/i, /\bMLRO\b/]);
  return { pass, notes: pass ? 'Anti-money laundering policy found.' : 'No AML policy found. AML Regulations 2017 apply to estate agents.' };
}

function naea_membership(page) {
  const t = allText(page);
  const pass = tm(t, [/\bNAEA\b/i, /propertymark/i, /\bARLA\b/i]);
  return { pass, notes: pass ? 'NAEA/Propertymark membership found.' : 'No NAEA/Propertymark membership found.' };
}

function material_information_disclosure(page) {
  const t = page.text || '';
  const pass = tm(t, [/material information/i, /full description/i]) ||
    (tm(t, [/bedroom/i, /bathroom/i]) && /[£€]\s*\d{3,}/.test(t));
  return { pass, notes: pass ? 'Property information disclosed.' : 'No material information disclosure. Consumer Protection from Unfair Trading 2008 / Estate Agents Act 1979 require this.' };
}

function fees_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/fees?.*(%|per cent|commission)/i, /commission.*%/i, /fee structure/i, /our fees/i]);
  return { pass, notes: pass ? 'Fee/commission information found.' : 'No fee structure found. Estate Agents Act 1979 s.18 requires fee disclosure before engagement.' };
}

function client_money_protection(page) {
  const t = allText(page);
  const pass = tm(t, [/client money protection/i, /\bCMP\b/, /client account/i, /client money/i, /protected.*client.*fund/i]);
  return { pass, notes: pass ? 'Client money protection information found.' : 'No client money protection scheme found.' };
}

function complaints_procedure(page) {
  const t = allText(page);
  const pass = tm(t, [/complaints? (procedure|process|policy)/i, /how to complain/i, /make a complaint/i, /complaints? handling/i]) ||
    lm(page.links, [/complaint/i]);
  return { pass, notes: pass ? 'Complaints procedure found.' : 'No complaints procedure found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Financial Services
// ─────────────────────────────────────────────────────────────────────

function fca_authorisation(page) {
  const t = allText(page);
  const pass = tm(t, [/FCA (authoris|regulat|register)/i, /Financial Conduct Authority/i, /FCA firm reference/i, /FRN[\s:]\d{6}/i]) ||
    /register\.fca\.org\.uk/i.test(t);
  return { pass, notes: pass ? 'FCA authorisation reference found.' : 'No FCA authorisation found. FSMA 2000 requires regulated firms to display this.' };
}

function financial_promotion_approval(page) {
  const t = page.text || '';
  const pass = tm(t, [/financial promotion.*approved/i, /approved by.*FCA/i, /FCA.*approved/i, /authorised.*financial promotion/i]);
  return { pass, notes: pass ? 'Financial promotion approval found.' : 'No financial promotion approval found. FSMA 2000 s.21 requires unregulated firms to have promotions approved by an FCA-authorised firm.' };
}

function risk_warnings(page) {
  const t = page.text || '';
  const pass = tm(t, [/capital at risk/i, /your capital is at risk/i, /past performance/i, /you may lose/i, /risk warning/i, /investments can (go down|fall)/i, /money at risk/i]);
  return { pass, notes: pass ? 'Risk warnings found.' : 'No risk warnings found. FCA COBS rules require risk warnings in investment promotions.' };
}

function consumer_duty_fair_value(page) {
  const t = allText(page);
  const pass = tm(t, [/consumer duty/i, /fair value/i, /\bKID\b/, /\bKFIS\b/, /key (facts|features) document/i, /suitability (assessment|criteria)/i]);
  return { pass, notes: pass ? 'Consumer duty or fair value information found.' : 'No consumer duty/fair value disclosure found. FCA Consumer Duty 2023 requires this.' };
}

function credit_agreement_disclosure(page) {
  const t = allText(page);
  const pass = tm(t, [/representative APR/i, /\bAPR\b/, /total amount payable/i, /credit agreement/i, /loan terms/i]);
  return { pass, notes: pass ? 'Credit agreement terms found.' : 'No credit agreement terms found. Consumer Credit Act 1974 / FCA CONC rules require APR and full terms.' };
}

function data_security_financial(page) {
  const t = allText(page);
  const pass = tm(t, [/SSL (encrypted|encrypt)/i, /256.bit/i, /two.factor/i, /\b2FA\b/, /encryption/i, /secure.*data/i, /\bTLS\b/]);
  return { pass, notes: pass ? 'Data security/encryption statement found.' : 'No data security statement found. UK GDPR Art. 32 / FSMA 2000 require this.' };
}

function financial_ombudsman(page) {
  const t = allText(page);
  const pass = tm(t, [/financial ombudsman/i, /\bFOS\b/, /ombudsman service/i]);
  return { pass, notes: pass ? 'Financial Ombudsman Service mentioned.' : 'No Financial Ombudsman Service details found. Required for FCA-regulated firms.' };
}

// ─────────────────────────────────────────────────────────────────────
// Accountancy
// ─────────────────────────────────────────────────────────────────────

function professional_body_membership(page) {
  const t = allText(page);
  const pass = tm(t, [/\bICAEW\b/, /\bACCA\b/, /\bCIMA\b/, /\bAAT\b/, /chartered accountant/i, /professional body/i]);
  return { pass, notes: pass ? 'Professional accounting body membership found.' : 'No accounting professional body membership (ICAEW, ACCA, CIMA, AAT) found.' };
}

function aml_accountancy_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/anti.money laundering/i, /\bAML\b/, /money laundering/i]);
  return { pass, notes: pass ? 'AML policy found.' : 'No AML policy found. AML Regulations 2017 apply to accountants.' };
}

function hmrc_agent_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/HMRC (registered|agent|authorised)/i, /tax agent/i, /agent registration/i]);
  return { pass, notes: pass ? 'HMRC agent registration mentioned.' : 'No HMRC agent registration found.' };
}

function pi_insurance_accountancy(page) {
  const t = allText(page);
  const pass = tm(t, [/professional indemnity/i, /\bPI insurance\b/i, /indemnity insurance/i]);
  return { pass, notes: pass ? 'Professional indemnity insurance mentioned.' : 'No professional indemnity insurance disclosure found.' };
}

function client_money_accountancy(page) {
  const t = allText(page);
  const pass = tm(t, [/client (money|account|funds)/i, /segregated (account|funds)/i]);
  return { pass, notes: pass ? 'Client money handling information found.' : 'No client money segregation information found.' };
}

function confidentiality_statement(page) {
  const t = allText(page);
  const pass = tm(t, [/confidentiality/i, /client.*confidential/i, /professional.*secret/i]);
  return { pass, notes: pass ? 'Confidentiality statement found.' : 'No confidentiality statement found.' };
}

function fees_transparency_accountancy(page) {
  const t = allText(page);
  const pass = tm(t, [/fees?/i, /pricing/i, /hourly rate/i]) && tm(t, [/accounting|bookkeeping|tax/i]);
  return { pass, notes: pass ? 'Service fees/pricing information found.' : 'No fee or pricing information found. Consumer Rights Act 2015 requires fee transparency.' };
}

// ─────────────────────────────────────────────────────────────────────
// Age-Restricted
// ─────────────────────────────────────────────────────────────────────

function age_verification_gate(page) {
  const t = page.text || '';
  const h = page.html || '';
  const pass = tm(t, [/are you 18/i, /you must be 18/i, /age verification/i, /confirm.*age/i, /enter.*date of birth/i]) ||
    /age.?gate/i.test(h) || /<input[^>]*date.?of.?birth/i.test(h);
  return { pass, notes: pass ? 'Age verification gate found.' : 'No age verification gate detected. Required for age-restricted product sales.' };
}

function challenge_25_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/challenge 25/i, /challenge25/i, /proof of age/i, /\bID\b.*required/i, /over 18 only/i]);
  return { pass, notes: pass ? 'Challenge 25 or proof of age policy found.' : 'No Challenge 25 policy found.' };
}

function age_restricted_delivery_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/\bID\b.*delivery/i, /age.*delivery/i, /verify.*recipient/i, /signature.*required/i, /proof of age.*delivery/i]);
  return { pass, notes: pass ? 'Age verification at delivery policy found.' : 'No age verification delivery policy found.' };
}

function tobacco_regulations(page) {
  const t = allText(page);
  const pass = tm(t, [/tobacco regulation/i, /packaging.*compliance/i, /Tobacco.*Product/i, /health warning/i]);
  return { pass, notes: pass ? 'Tobacco regulatory compliance mentioned.' : 'No tobacco compliance statement found. Tobacco and Related Products Regulations 2016 apply.' };
}

function avaa_2023_compliance(page) {
  const t = page.text || '';
  const pass = tm(t, [/age verification/i, /Yoti/i, /Incode/i, /AgeID/i, /certified.*verification/i, /robust.*age/i]);
  return { pass, notes: pass ? 'Certified age verification found.' : 'No certified age verification provider found. Age Verification and Assurance Act 2023 may apply.' };
}

function restricted_product_list(page) {
  const t = page.text || '';
  const pass = tm(t, [/18\+/i, /for adults only/i, /age.restricted/i, /over 18 only/i]);
  return { pass, notes: pass ? 'Age restriction labelling found.' : 'No 18+ product labelling found.' };
}

function health_warnings(page) {
  const t = page.text || '';
  const pass = tm(t, [/tobacco.*harmful/i, /smoking (kills|harms|causes cancer)/i, /health warning/i, /drink responsibly/i, /alcohol.*units/i]);
  return { pass, notes: pass ? 'Health warnings found.' : 'No health warnings found. Required for tobacco and alcohol products.' };
}

// ─────────────────────────────────────────────────────────────────────
// Automotive
// ─────────────────────────────────────────────────────────────────────

function motor_finance_fca(page) {
  const t = allText(page);
  const pass = tm(t, [/FCA (authoris|regulat)/i, /Financial Conduct Authority/i, /FRN[\s:]\d{6}/i]);
  return { pass, notes: pass ? 'FCA authorisation for motor finance found.' : 'No FCA authorisation found. Required for motor finance arrangements under FSMA 2000.' };
}

function day30_rejection_right(page) {
  const t = allText(page);
  const pass = tm(t, [/30.day/i, /thirty.day/i, /right to reject/i]);
  return { pass, notes: pass ? '30-day rejection right mentioned.' : 'No 30-day right to reject found. Consumer Rights Act 2015 s.48C requires this for used car sales.' };
}

function used_car_disclosure(page) {
  const t = page.text || '';
  const pass = tm(t, [/mileage/i, /service history/i, /previous owner/i, /\bMOT\b/, /accident history/i, /\bHPI\b/]);
  return { pass, notes: pass ? 'Used car pre-purchase information (mileage, history, MOT) found.' : 'No used car information found. Consumer Rights Act 2015 requires disclosure of mileage, service history etc.' };
}

function distance_selling_automotive(page) {
  const t = allText(page);
  const pass = tm(t, [/14.day/i, /right to cancel/i, /cooling.off/i, /distance selling/i]);
  return { pass, notes: pass ? '14-day cancellation rights for online sales found.' : 'No distance selling cancellation rights found.' };
}

function warranty_terms(page) {
  const t = allText(page);
  const pass = tm(t, [/warranty/i, /guarantee/i, /after.sales/i, /\d+.month.*warranty/i]);
  return { pass, notes: pass ? 'Warranty/guarantee information found.' : 'No warranty information found. Consumer Rights Act 2015 requires this.' };
}

function pricing_transparency_automotive(page) {
  const t = page.text || '';
  const hasPrice = /[£€]\s*\d{3,}/.test(t);
  const isPOA = /(price on application|POA|call for price)/i.test(t);
  if (!hasPrice && isPOA) return { pass: false, notes: 'Prices not shown — listed as POA.' };
  if (!hasPrice) return { pass: null, notes: 'No vehicle prices detected.' };
  return { pass: true, notes: 'Vehicle prices displayed.' };
}

function vehicle_safety_info(page) {
  const t = allText(page);
  const pass = tm(t, [/Euro \d/i, /\bNCAP\b/, /safety rating/i, /emissions/i]);
  return { pass, notes: pass ? 'Vehicle safety or emissions information found.' : 'No vehicle safety information found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Charities
// ─────────────────────────────────────────────────────────────────────

function charity_number(page) {
  const t = allText(page);
  const pass =
    /registered charity (number|no\.?)?:?\s*\d{6,8}/i.test(t) ||
    /charity (number|no\.?|registration):?\s*\d{6,8}/i.test(t) ||
    /\bcharity commission\b/i.test(t);
  return { pass, notes: pass ? 'Charity registration number found.' : 'No charity registration number found. Charities Act 2022 requires registered charities to display this.' };
}

function fundraising_regulator(page) {
  const t = allText(page);
  const pass = tm(t, [/fundraising regulator/i, /registered with.*fundraising/i, /fundraising code/i]);
  return { pass, notes: pass ? 'Fundraising Regulator membership mentioned.' : 'No Fundraising Regulator membership found.' };
}

function gift_aid_declaration(page) {
  const t = page.text || '';
  if (!/gift aid/i.test(t)) return { pass: null, notes: 'No Gift Aid mentioned — not applicable.' };
  const pass = tm(t, [/uk (taxpayer|taxable)/i, /taxpayer/i, /gift aid declaration/i]);
  return { pass, notes: pass ? 'Gift Aid declaration with taxpayer eligibility requirement found.' : 'Gift Aid mentioned but no taxpayer eligibility declaration found.' };
}

function trustee_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/trustee/i, /board of trustee/i, /governance/i, /charity commission.*record/i]);
  return { pass, notes: pass ? 'Trustee or governance information found.' : 'No trustee information found. Charities Act 2022 requires this.' };
}

function charitable_purposes_stated(page) {
  const t = page.text || '';
  const pass = tm(t, [/our mission/i, /what we do/i, /charitable purpose/i, /our aim/i, /we exist to/i, /our vision/i]);
  return { pass, notes: pass ? 'Charitable purposes or mission statement found.' : 'No charitable purposes statement found.' };
}

function financial_accountability(page) {
  const t = allText(page);
  const pass = tm(t, [/annual report/i, /annual accounts/i, /financial statement/i, /charity commission/i, /impact report/i]);
  return { pass, notes: pass ? 'Annual accounts or financial transparency information found.' : 'No annual accounts or financial transparency found. Charities Act 2022 requires this.' };
}

function donation_security(page) {
  const t = page.text || '';
  const h = page.html || '';
  if (!/donat/i.test(t)) return { pass: null, notes: 'No donation mechanism detected.' };
  const pass = page.url.startsWith('https://') &&
    tm(h, [/stripe/i, /paypal/i, /justgiving/i, /virgin money giving/i, /enthuse/i, /donorbox/i, /givebutter/i, /gocardless/i]);
  return { pass, notes: pass ? 'Secure donation processor found.' : 'Donation mechanism detected but no recognised secure payment processor found.' };
}

function privacy_donor_data(page) {
  const t = allText(page);
  const pass = tm(t, [/donor.*(data|information|privacy)/i, /donat.*privacy/i, /how we use.*data/i]);
  return { pass, notes: pass ? 'Donor data protection information found.' : 'No donor data privacy information found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Childcare & Education
// ─────────────────────────────────────────────────────────────────────

function ofsted_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/ofsted/i, /ofsted (reg|number|rating)/i, /ofsted (outstanding|good|requires improvement)/i]);
  return { pass, notes: pass ? 'Ofsted registration or rating found.' : 'No Ofsted registration found. Childcare Act 2006 requires childcare providers to be Ofsted-registered.' };
}

function safeguarding_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/safeguarding policy/i, /child protection policy/i, /safeguarding (statement|procedure)/i]) ||
    lm(page.links, [/safeguarding/i, /child.protection/i]);
  return { pass, notes: pass ? 'Safeguarding policy found.' : 'No safeguarding policy found. Required under Safeguarding Vulnerable Groups Act 2006.' };
}

function dbs_check_statement(page) {
  const t = allText(page);
  const pass = tm(t, [/DBS (check|checked|clearance|enhanced)/i, /Disclosure and Barring/i, /all staff.*vetted/i]);
  return { pass, notes: pass ? 'DBS check statement found.' : 'No DBS check statement found. Required for staff working with children.' };
}

function eyfs_compliance(page) {
  const t = allText(page);
  const pass = tm(t, [/\bEYFS\b/, /Early Years Foundation Stage/i, /early years framework/i]);
  return { pass, notes: pass ? 'EYFS compliance mentioned.' : 'No EYFS compliance statement found.' };
}

function child_protection_contact(page) {
  const t = allText(page);
  const pass = tm(t, [/safeguarding officer/i, /designated safeguard/i, /child protection (officer|contact|lead)/i]);
  return { pass, notes: pass ? 'Safeguarding officer contact found.' : 'No safeguarding/child protection contact found.' };
}

function parental_involvement(page) {
  const t = page.text || '';
  const pass = tm(t, [/parent.*involvement/i, /parental communication/i, /keeping.*parents/i, /inform.*parents/i]);
  return { pass, notes: pass ? 'Parental involvement/communication policy mentioned.' : 'No parental involvement information found.' };
}

function child_data_protection(page) {
  const t = allText(page);
  const pass = tm(t, [/child.*data/i, /children.*privacy/i, /pupil.*data/i, /student.*privacy/i, /under 13/i]);
  return { pass, notes: pass ? 'Children\'s data protection information found.' : 'No children\'s data protection statement found.' };
}

function staff_qualifications(page) {
  const t = page.text || '';
  const pass = tm(t, [/qualified staff/i, /level \d (qualified|qualification)/i, /\bNNEB\b/, /\bCACHE\b/]);
  return { pass, notes: pass ? 'Staff qualifications information found.' : 'No staff qualifications information found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Construction & Trades
// ─────────────────────────────────────────────────────────────────────

function gas_safe_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/gas safe/i, /gas safe register/i, /gas safe (registered|certified|number)/i]);
  return { pass, notes: pass ? 'Gas Safe registration found.' : 'No Gas Safe registration found. Required for all gas work under Gas Safety (Installation and Use) Regulations 1998.' };
}

function niceic_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/\bNICEIC\b/, /\bNAPIT\b/, /\bELECSA\b/, /Part P/i, /electrical (registration|certification)/i]);
  return { pass, notes: pass ? 'Electrical certification found.' : 'No NICEIC/NAPIT electrical registration found.' };
}

function public_liability_insurance(page) {
  const t = allText(page);
  const pass = tm(t, [/public liability/i, /liability insurance/i, /fully insured/i]);
  return { pass, notes: pass ? 'Public liability insurance mentioned.' : 'No public liability insurance information found.' };
}

function competent_person_scheme(page) {
  const t = allText(page);
  const pass = tm(t, [/competent person/i, /\bFENSA\b/, /\bCERTASS\b/, /Building Regs/i, /building regulations/i, /self.cert/i]);
  return { pass, notes: pass ? 'Competent Person Scheme membership mentioned.' : 'No Competent Person Scheme certification found.' };
}

function hse_compliance_statement(page) {
  const t = allText(page);
  const pass = tm(t, [/health.*(and|&).*safety/i, /\bHSE\b/, /health and safety.*complian/i]);
  return { pass, notes: pass ? 'Health & Safety compliance statement found.' : 'No HSE/health and safety compliance statement found.' };
}

function guarantees_warranties(page) {
  const t = allText(page);
  const pass = tm(t, [/guarantee/i, /warranty/i, /workmanship guarantee/i, /\d+.year.*guarantee/i]);
  return { pass, notes: pass ? 'Work guarantee or warranty found.' : 'No workmanship guarantee or warranty found.' };
}

function pricing_transparency(page) {
  const t = page.text || '';
  const pass = tm(t, [/free (quote|estimate)/i, /get a quote/i, /request a quote/i, /pricing/i, /hourly rate/i]);
  return { pass, notes: pass ? 'Pricing or quote information found.' : 'No pricing or quote information found.' };
}

function dbs_check_clearance(page) {
  const t = allText(page);
  const pass = tm(t, [/DBS (check|checked|clearance)/i, /Disclosure.*Barring/i]);
  return { pass, notes: pass ? 'DBS clearance statement found.' : 'No DBS check clearance found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Cosmetics
// ─────────────────────────────────────────────────────────────────────

function responsible_person_cosmetics(page) {
  const t = allText(page);
  const pass = tm(t, [/responsible person/i, /UK responsible person/i, /responsible (manufacturer|importer)/i]);
  return { pass, notes: pass ? 'UK Responsible Person details found.' : 'No UK Responsible Person found. Required by UK Cosmetics Regulation.' };
}

function scpn_notification(page) {
  const t = allText(page);
  const pass = tm(t, [/\bSCPN\b/, /cosmetic.*notif/i, /product notification portal/i]);
  return { pass, notes: pass ? 'SCPN notification reference found.' : 'No SCPN notification confirmation found. Required by UK Cosmetics Regulation.' };
}

function ingredient_labelling(page) {
  const t = page.text || '';
  const pass = /\bINCI\b/i.test(t) || tm(t, [/ingredients?[\s:]/i]) && /aqua|sodium|glycerin/i.test(t);
  return { pass, notes: pass ? 'Ingredient labelling found on product pages.' : 'No INCI ingredient lists found. UK Cosmetics Regulation requires ingredient labelling.' };
}

function safety_assessment_cosmetics(page) {
  const t = allText(page);
  const pass = tm(t, [/safety (assess|test)/i, /dermatologically tested/i, /dermatologist (tested|approved)/i, /clinically tested/i]);
  return { pass, notes: pass ? 'Safety assessment or testing information found.' : 'No safety assessment information found. UK Cosmetics Regulation Art. 15 requires this.' };
}

function claims_substantiation_cosmetics(page) {
  const t = page.text || '';
  const medicinal = /\b(cure|treat|heal|diagnose|prevent disease)\b/i.test(t);
  if (medicinal) return { pass: false, notes: 'Potentially medicinal claims found. UK Cosmetics Regulation prohibits medicinal claims for cosmetics.' };
  return { pass: true, notes: 'No obviously medicinal claims detected.' };
}

function warning_statements(page) {
  const t = page.text || '';
  const pass = tm(t, [/external use only/i, /keep out of reach/i, /avoid contact (with|near)/i, /for professional use/i]);
  return { pass, notes: pass ? 'Required warning statements found.' : 'No required warning statements found.' };
}

function animal_testing_statement(page) {
  const t = allText(page);
  const found = tm(t, [/cruelty.free/i, /not tested on animal/i, /leaping bunny/i, /PETA certified/i, /animal testing/i]);
  if (!found) return { pass: null, notes: 'No animal testing declaration found — recommended disclosure.' };
  return { pass: true, notes: 'Animal testing/cruelty-free declaration found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Food & Beverage
// ─────────────────────────────────────────────────────────────────────

function allergen_information(page) {
  const t = page.text || '';
  const pass = tm(t, [/allergen/i, /allergy (advice|information)/i, /contains.*gluten/i, /contains.*nuts/i, /allergen information/i]);
  return { pass, notes: pass ? 'Allergen information found.' : 'No allergen information found. Food Information Regulations 2014 require the 14 major allergens to be declared.' };
}

function fsa_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/food standards agency/i, /\bFSA\b.*register/i, /food business registration/i]);
  return { pass, notes: pass ? 'FSA registration reference found.' : 'No FSA registration found. Food Safety Act 1990 requires food businesses to be registered.' };
}

function calorie_labelling(page) {
  const t = page.text || '';
  const found = /\b\d+\s*(kcal|calories?|Cal)\b/i.test(t);
  if (!found) return { pass: null, notes: 'No calorie information found — mandatory only for chains with 250+ outlets.' };
  return { pass: true, notes: 'Calorie information found on menu items.' };
}

function nutrition_claims_substantiated(page) {
  const t = page.text || '';
  const questionable = tm(t, [/\bsuperfood\b/i, /\bmiracle\b.*\b(food|ingredient)/i, /detoxif/i]);
  if (questionable) return { pass: false, notes: 'Potentially unsubstantiated nutrition claims found ("superfood", "detox"). Nutrition and Health Claims Regulation requires substantiation.' };
  return { pass: true, notes: 'No obviously unsubstantiated nutrition claims found.' };
}

function food_hygiene_rating(page) {
  const t = allText(page);
  const pass = tm(t, [/food hygiene rating/i, /hygiene (rating|score)/i, /\b[1-5] star.*hygiene/i]) ||
    /ratings\.food\.gov\.uk/i.test(t);
  return { pass, notes: pass ? 'Food hygiene rating displayed.' : 'No food hygiene rating displayed.' };
}

function ingredient_sourcing(page) {
  const t = page.text || '';
  const found = tm(t, [/locally (sourced|grown|produced)/i, /british (beef|chicken|lamb|pork)/i, /sourced from/i, /free range/i]);
  if (!found) return { pass: null, notes: 'No specific ingredient sourcing/origin information found.' };
  return { pass: true, notes: 'Ingredient sourcing/origin information found.' };
}

function vegan_vegetarian_labelling(page) {
  const t = page.text || '';
  const found = tm(t, [/\bvegan\b/i, /\bvegetarian\b/i, /plant.based/i]);
  if (!found) return { pass: null, notes: 'No vegan/vegetarian menu labelling detected.' };
  return { pass: true, notes: 'Vegan/vegetarian menu items marked.' };
}

// ─────────────────────────────────────────────────────────────────────
// Gambling
// ─────────────────────────────────────────────────────────────────────

function gambling_commission_licence(page) {
  const t = allText(page);
  const pass = tm(t, [/gambling commission/i, /licensed.*gambling commission/i, /gambling commission.*licence/i]);
  return { pass, notes: pass ? 'Gambling Commission licence found.' : 'No Gambling Commission licence found. Gambling Act 2005 requires this.' };
}

function gamstop_integration(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/gamstop/i, /self.exclusion/i, /gamcare/i]) || /gamstop\.co\.uk/i.test(h);
  return { pass, notes: pass ? 'GamStop or self-exclusion integration found.' : 'No GamStop integration found. Required by Gambling Commission licence conditions.' };
}

function safer_gambling_tools(page) {
  const t = allText(page);
  const pass = tm(t, [/deposit limit/i, /time.out/i, /reality check/i, /safer gambling/i, /responsible gambling/i]);
  return { pass, notes: pass ? 'Safer gambling tools mentioned.' : 'No safer gambling tools found.' };
}

function age_verification_gambling(page) {
  const t = page.text || '';
  const h = page.html || '';
  const pass = tm(t, [/must be 18/i, /18\+/i, /age verification/i]) || /age.gate/i.test(h);
  return { pass, notes: pass ? 'Age verification found.' : 'No age verification for gambling site. Gambling Act 2005 requires 18+ verification.' };
}

function responsible_gambling_links(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/begambleaware/i, /GamCare/i, /Gambling Therapy/i]) ||
    /begambleaware\.org/i.test(h) || /gamcare\.org/i.test(h);
  return { pass, notes: pass ? 'BeGambleAware or responsible gambling resources found.' : 'No responsible gambling resources found. Required by Gambling Commission.' };
}

function odds_bet_rules_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/bet(ting)? rules/i, /settlement rules/i, /terms.*bet/i, /how odds work/i]);
  return { pass, notes: pass ? 'Betting rules or odds explanation found.' : 'No betting rules transparency found.' };
}

function fund_safety_guarantee(page) {
  const t = allText(page);
  const pass = tm(t, [/funds.*segregat/i, /client funds/i, /funds.*protect/i, /segregated.*account/i]);
  return { pass, notes: pass ? 'Customer funds protection statement found.' : 'No funds protection guarantee found.' };
}

function complaints_gambling(page) {
  const t = allText(page);
  const pass = tm(t, [/complaints? (procedure|process)/i, /dispute.*resolution/i, /\bADR\b/]);
  return { pass, notes: pass ? 'Complaints and dispute resolution process found.' : 'No complaints procedure found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Healthcare
// ─────────────────────────────────────────────────────────────────────

function cqc_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/Care Quality Commission/i, /\bCQC\b.*register/i, /CQC (registered|regulated|rated)/i]) ||
    /cqc\.org\.uk/i.test(t);
  return { pass, notes: pass ? 'CQC registration found.' : 'No CQC registration found. Health and Social Care Act 2008 requires this for regulated healthcare.' };
}

function medicine_advertising_compliance(page) {
  const t = page.text || '';
  const hasPOM = tm(t, [/prescription (medicine|drug|medication)/i, /\bPOM\b/]);
  if (!hasPOM) return { pass: null, notes: 'No prescription medicine advertising detected.' };
  const pass = !tm(t, [/buy.*prescription.*no (prescription|doctor)/i, /prescription.*without (a )?doctor/i]);
  return { pass, notes: pass ? 'No obvious medicine advertising violations found.' : 'Potential violation: appears to offer prescription medicines without proper controls. Medicines Act 1968 / MHRA rules apply.' };
}

function healthcare_claims(page) {
  const t = page.text || '';
  const problematic = /\b(cure[sd]?|treats?|heals?)\b.*\b(cancer|diabetes|arthritis|depression)\b/i.test(t) ||
    /guaranteed.*\b(cure|recovery)\b/i.test(t);
  if (problematic) return { pass: false, notes: 'Potentially unsubstantiated health claims found. Human Medicines Regulations 2012 / MHRA require substantiated claims.' };
  return { pass: true, notes: 'No obviously unsubstantiated health claims detected.' };
}

function gphc_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/\bGPhC\b/, /General Pharmaceutical Council/i, /registered pharmacy/i]);
  return { pass, notes: pass ? 'GPhC pharmacy registration found.' : 'No GPhC registration found. Required for online pharmacies.' };
}

function professional_registration(page) {
  const t = allText(page);
  const pass = tm(t, [/\bGMC\b/, /\bNMC\b/, /\bHCPC\b/, /\bGDC\b/, /\bGOC\b/, /registered (doctor|nurse|physiotherapist|dentist)/i]);
  return { pass, notes: pass ? 'Healthcare professional registration found.' : 'No healthcare professional registration numbers found.' };
}

function data_confidentiality(page) {
  const t = allText(page);
  const pass = tm(t, [/patient.*confidential/i, /confidential.*patient/i, /medical.*privacy/i, /health.*data.*secure/i]);
  return { pass, notes: pass ? 'Patient data confidentiality information found.' : 'No patient confidentiality statement found.' };
}

function regulatory_notices(page) {
  const t = allText(page);
  const pass = tm(t, [/MHRA (approved|authorised)/i, /CQC.*rating/i, /regulatory (approval|notice)/i, /CE.*medical/i, /UKCA.*medical/i]);
  return { pass, notes: pass ? 'Regulatory approval notices found.' : 'No regulatory approval notices found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Insurance
// ─────────────────────────────────────────────────────────────────────

function fca_insurance_authorisation(page) {
  const t = allText(page);
  const pass = tm(t, [/FCA (authoris|regulat)/i, /Financial Conduct Authority/i, /FRN[\s:]\d{6}/i]);
  return { pass, notes: pass ? 'FCA authorisation for insurance found.' : 'No FCA authorisation found. Required for insurance intermediaries.' };
}

function insurance_product_information(page) {
  const t = allText(page);
  const pass = tm(t, [/\bIPID\b/, /Insurance Product Information Document/i, /policy summary/i, /key features document/i]);
  return { pass, notes: pass ? 'Insurance product information documents found.' : 'No IPID or product information found. Insurance Distribution Directive requires this.' };
}

function ipt_disclosure(page) {
  const t = page.text || '';
  if (!/[£€]\d+/.test(t)) return { pass: null, notes: 'No prices detected — IPT disclosure check not applicable.' };
  const pass = tm(t, [/insurance premium tax/i, /\bIPT\b/, /includes.*tax/i]);
  return { pass, notes: pass ? 'Insurance Premium Tax disclosure found.' : 'No IPT disclosure found. Finance Act 1994 requires this.' };
}

function complaints_insurance(page) {
  const t = allText(page);
  const pass = tm(t, [/complaints? (procedure|process)/i, /financial ombudsman/i, /how to complain/i]);
  return { pass, notes: pass ? 'Complaints procedure found.' : 'No complaints procedure found. FCA COBS 2.1R requires this.' };
}

function renewal_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/renewal.*price/i, /renewal (notice|terms)/i, /auto.renew/i, /before.*renew/i]);
  return { pass, notes: pass ? 'Renewal terms found.' : 'No renewal transparency information found. Insurance Distribution Directive requires this.' };
}

function data_protection_insurance(page) {
  const t = allText(page);
  const pass = tm(t, [/privacy policy/i, /data protection/i, /how we use.*data/i]);
  return { pass, notes: pass ? 'Data security/privacy information found.' : 'No data protection information found.' };
}

function claims_process_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/how to (make a )?claim/i, /claims process/i, /claims (procedure|form)/i, /report a claim/i]);
  return { pass, notes: pass ? 'Claims process information found.' : 'No claims process documentation found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Legal Services
// ─────────────────────────────────────────────────────────────────────

function sra_authorisation(page) {
  const t = allText(page);
  const pass = tm(t, [/SRA (authoris|regulat|number)/i, /Solicitors Regulation Authority/i, /SRA ID/i]) ||
    /sra\.org\.uk/i.test(t);
  return { pass, notes: pass ? 'SRA authorisation found.' : 'No SRA authorisation found. Legal Services Act 2007 requires regulated law firms to display this.' };
}

function bsb_barrister(page) {
  const t = allText(page);
  const found = tm(t, [/Bar Standards Board/i, /\bBSB\b.*register/i, /barrister.*register/i]);
  if (!found) return { pass: null, notes: 'No BSB registration found — only applicable to barristers.' };
  return { pass: true, notes: 'BSB registration found.' };
}

function legal_costs_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/hourly rate/i, /legal fees?/i, /cost.*guidance/i]) ||
    lm(page.links, [/fees?/i, /pricing/i, /costs?/i]);
  return { pass, notes: pass ? 'Legal fees/costs information found.' : 'No legal fees transparency found. SRA Transparency Rules require fee disclosure.' };
}

function professional_indemnity_disclosure(page) {
  const t = allText(page);
  const pass = tm(t, [/professional indemnity/i, /\bPI insurance\b/i, /indemnity insurance/i]);
  return { pass, notes: pass ? 'Professional indemnity insurance disclosure found.' : 'No professional indemnity insurance disclosure found. Required by SRA Indemnity Insurance Rules.' };
}

function reserved_activities_notice(page) {
  const t = allText(page);
  const pass = tm(t, [/reserved (legal )?activity/i, /reserved activities/i, /SRA.*regulated/i]);
  return { pass, notes: pass ? 'Reserved legal activities notice found.' : 'No reserved activities notice found.' };
}

function data_protection_special_category(page) {
  const t = allText(page);
  const pass = tm(t, [/special category (data|information)/i, /sensitive (data|information)/i, /Art\. ?9/i]);
  return { pass, notes: pass ? 'Special category data protection notice found.' : 'No special category data protection notice found. UK GDPR Art. 9 applies to legal services.' };
}

// ─────────────────────────────────────────────────────────────────────
// Letting Agents
// ─────────────────────────────────────────────────────────────────────

function tenant_fees_act_compliance(page) {
  const t = allText(page);
  const pass = tm(t, [/tenant fees act/i, /no.*tenant fees/i, /permitted payment/i, /Tenant Fees Act 2019/i]);
  return { pass, notes: pass ? 'Tenant Fees Act compliance mentioned.' : 'No Tenant Fees Act compliance statement found. Tenant Fees Act 2019 applies.' };
}

function how_to_rent_guide(page) {
  const t = allText(page);
  const pass = tm(t, [/how to rent/i]) || lm(page.links, [/how.to.rent/i]);
  return { pass, notes: pass ? '"How to Rent" guide reference found.' : 'No "How to Rent" guide reference. Housing Act 2004 s.150A requires agents to provide this.' };
}

function arla_membership(page) {
  const t = allText(page);
  const pass = tm(t, [/\bARLA\b/, /propertymark/i, /redress scheme/i, /property redress/i]);
  return { pass, notes: pass ? 'ARLA/Propertymark or redress scheme membership found.' : 'No ARLA membership or redress scheme found. Required for letting agents.' };
}

function deposit_scheme_membership(page) {
  const t = allText(page);
  const pass = tm(t, [/deposit protection/i, /tenancy deposit/i, /\bTDS\b/, /\bDPS\b/, /\bMyDeposits\b/, /deposit scheme/i]);
  return { pass, notes: pass ? 'Deposit protection scheme membership found.' : 'No deposit protection scheme found. Housing Act 2004 requires this.' };
}

function prescribed_information(page) {
  const t = allText(page);
  const pass = tm(t, [/prescribed information/i, /deposit.*information/i, /how your deposit is protected/i]);
  return { pass, notes: pass ? 'Prescribed deposit information found.' : 'No prescribed deposit information found.' };
}

function landlord_insurance_disclosure(page) {
  const t = allText(page);
  const found = tm(t, [/landlord insurance/i, /property insurance/i, /landlord.*legal/i]);
  if (!found) return { pass: null, notes: 'No landlord insurance information found.' };
  return { pass: true, notes: 'Landlord insurance/compliance information found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Media & Publishing
// ─────────────────────────────────────────────────────────────────────

function ipso_membership(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/\bIPSO\b/, /Independent Press Standards/i]) || /ipso\.co\.uk/i.test(h);
  return { pass, notes: pass ? 'IPSO membership found.' : 'No IPSO membership found.' };
}

function corrections_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/corrections? (policy|procedure)/i, /errata/i, /factual correction/i]) ||
    lm(page.links, [/correction/i]);
  return { pass, notes: pass ? 'Corrections policy found.' : 'No corrections policy found.' };
}

function copyright_notice(page) {
  const t = page.text || '';
  const h = page.html || '';
  const pass = /©\s*\d{4}/i.test(t) || /copyright\s*©?\s*\d{4}/i.test(t) || /©\s*\d{4}/i.test(h);
  return { pass, notes: pass ? 'Copyright notice found.' : 'No copyright notice found. Copyright, Designs and Patents Act 1988 applies.' };
}

function editorial_standards(page) {
  const t = allText(page);
  const pass = tm(t, [/editorial (policy|standards|independence|guidelines)/i, /editorial code/i]);
  return { pass, notes: pass ? 'Editorial standards/policy found.' : 'No editorial standards disclosure found.' };
}

function defamation_complaints_process(page) {
  const t = allText(page);
  const pass = tm(t, [/defamation/i, /report.*content/i, /editorial complaint/i, /content.*complaint/i]);
  return { pass, notes: pass ? 'Editorial complaints process found.' : 'No defamation/editorial complaints process found.' };
}

function sponsored_content_disclosure(page) {
  const t = page.text || '';
  const hasSponsored = tm(t, [/sponsored/i, /partner content/i, /advertisement/i, /promoted/i]);
  if (!hasSponsored) return { pass: null, notes: 'No sponsored content detected.' };
  const disclosed = /\[sponsored\]|\[advertisement\]|\[promoted\]/i.test(t) ||
    /clearly (labelled|marked)/i.test(t);
  return { pass: disclosed, notes: disclosed ? 'Sponsored content is clearly disclosed.' : 'Sponsored content found but may not be clearly labelled. CAP Code requires clear disclosure.' };
}

function privacy_journalists(page) {
  const t = allText(page);
  const found = tm(t, [/source protection/i, /journalist.*confidential/i, /whistle.*blower/i]);
  if (!found) return { pass: null, notes: 'No journalist source protection policy found.' };
  return { pass: true, notes: 'Source protection/journalist ethics statement found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Pharmaceuticals
// ─────────────────────────────────────────────────────────────────────

function mhra_pharmacy_logo(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/\bMHRA\b/, /internet pharmacy/i]) || /mhra\.gov\.uk/i.test(h);
  return { pass, notes: pass ? 'MHRA pharmacy logo/reference found.' : 'No MHRA internet pharmacy logo found. Required for online pharmacies.' };
}

function gphc_registration_number(page) {
  const t = allText(page);
  const pass = tm(t, [/\bGPhC\b/, /General Pharmaceutical Council/i, /pharmacy.*\d{7}/i]);
  return { pass, notes: pass ? 'GPhC registration number found.' : 'No GPhC registration found. Required for online pharmacies.' };
}

function prescription_medicine_rules(page) {
  const t = page.text || '';
  const violation = tm(t, [/prescription.*without (a )?doctor/i, /no prescription needed/i, /prescription.*no consultation/i]);
  return { pass: !violation, notes: violation ? 'Potential violation: appears to offer prescription medicines without controls. Medicines Act 1968 applies.' : 'No obvious prescription medicine rule violations found.' };
}

function pharmacy_superintendent(page) {
  const t = allText(page);
  const pass = tm(t, [/superintendent pharmacist/i, /responsible pharmacist/i, /pharmacist in charge/i]);
  return { pass, notes: pass ? 'Superintendent Pharmacist details found.' : 'No Superintendent Pharmacist found. Required under GPhC standards.' };
}

function medicines_advertising_compliance(page) {
  const t = page.text || '';
  const violation = tm(t, [/prescription medicine.*special offer/i, /discount.*prescription/i]);
  return { pass: !violation, notes: violation ? 'Potential medicines advertising violation found. Medicines Act 1968 / MHRA Code apply.' : 'No obvious medicines advertising violations detected.' };
}

function medicine_safety_info(page) {
  const t = allText(page);
  const pass = tm(t, [/patient information leaflet/i, /\bPIL\b/, /medicine.*leaflet/i, /safety information/i]);
  return { pass, notes: pass ? 'Patient information leaflets/safety information found.' : 'No patient information leaflets found. Human Medicines Regulations 2012 require these.' };
}

function consultation_availability(page) {
  const t = allText(page);
  const pass = tm(t, [/speak to (a )?pharmacist/i, /pharmacist consultation/i, /ask.*pharmacist/i]);
  return { pass, notes: pass ? 'Pharmacist consultation option found.' : 'No pharmacist consultation service found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Recruitment
// ─────────────────────────────────────────────────────────────────────

function employment_agency_act_compliance(page) {
  const t = allText(page);
  const pass = tm(t, [/Employment Agencies Act/i, /employment agency.*compli/i, /\bEAS\b/]);
  return { pass, notes: pass ? 'Employment Agencies Act compliance statement found.' : 'No compliance statement for Employment Agencies Act 1973 found.' };
}

function awr_compliance(page) {
  const t = allText(page);
  const pass = tm(t, [/Agency Workers Regulations/i, /\bAWR\b/, /agency worker rights/i]);
  return { pass, notes: pass ? 'Agency Workers Regulations compliance found.' : 'No AWR compliance statement found. AWR 2010 applies to UK recruitment agencies.' };
}

function rec_membership(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/\bREC\b.*member/i, /Recruitment (& |and )?Employment Confederation/i]) || /rec\.uk\.com/i.test(h);
  return { pass, notes: pass ? 'REC membership found.' : 'No REC membership found.' };
}

function candidate_data_retention(page) {
  const t = allText(page);
  const pass = tm(t, [/candidate.*data.*retent/i, /data.*retent/i, /how long.*keep/i, /retain.*data/i]);
  return { pass, notes: pass ? 'Candidate data retention policy found.' : 'No data retention policy found. UK GDPR requires this.' };
}

function fee_transparency_recruitment(page) {
  const t = allText(page);
  const pass = tm(t, [/no fee to candidate/i, /free to candidate/i, /placement fee/i, /recruitment fee/i]);
  return { pass, notes: pass ? 'Recruitment fee transparency found.' : 'No placement fee transparency found. Employment Agencies Act 1973 requires this.' };
}

function worker_rights_disclosure(page) {
  const t = allText(page);
  const pass = tm(t, [/worker rights/i, /employment rights/i, /contract terms/i, /workers.*entitled/i]);
  return { pass, notes: pass ? 'Worker rights information found.' : 'No worker rights disclosure found.' };
}

function complaints_recruitment(page) {
  const t = allText(page);
  const pass = tm(t, [/complaints? (procedure|process)/i, /how to complain/i, /make a complaint/i]);
  return { pass, notes: pass ? 'Complaints procedure found.' : 'No complaints procedure found.' };
}

// ─────────────────────────────────────────────────────────────────────
// SaaS & Software
// ─────────────────────────────────────────────────────────────────────

function dpa_processor_agreement(page) {
  const t = allText(page);
  const pass = tm(t, [/data processing agreement/i, /\bDPA\b/, /data processing addendum/i, /processor agreement/i]);
  return { pass, notes: pass ? 'Data Processing Agreement found.' : 'No DPA found. UK GDPR Art. 28 requires one when processing customer personal data.' };
}

function saas_cancellation_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/cancel (anytime|at any time|subscription)/i, /cancellation policy/i, /14.day.*cancel/i, /free.*cancel/i]);
  return { pass, notes: pass ? 'Cancellation policy found.' : 'No cancellation policy found. Consumer Contracts Regulations 2013 requires 14-day cooling off for B2C SaaS.' };
}

function uptime_sla_transparency(page) {
  const t = allText(page);
  const pass = tm(t, [/\bSLA\b/, /uptime.*%/i, /99\.?\d*%.*uptime/i, /service level/i, /availability guarantee/i]);
  return { pass, notes: pass ? 'Uptime/SLA information found.' : 'No uptime or SLA information found.' };
}

function data_portability_saas(page) {
  const t = allText(page);
  const pass = tm(t, [/export (your )?data/i, /data (portability|export)/i, /download.*data/i]);
  return { pass, notes: pass ? 'Data portability/export option found.' : 'No data export option found. UK GDPR Art. 20 gives users a right to data portability.' };
}

function ai_transparency_notice(page) {
  const t = page.text || '';
  const hasAI = tm(t, [/artificial intelligence/i, /machine learning/i, /AI.powered/i, /\bAI\b.*feature/i]);
  if (!hasAI) return { pass: null, notes: 'No AI features detected — check not applicable.' };
  const pass = tm(t, [/AI.*(transparen|disclos)/i, /how.*AI.*works/i, /automated decision/i, /AI policy/i]);
  return { pass, notes: pass ? 'AI transparency notice found.' : 'AI features detected but no transparency notice. Consumer Rights Act 2015 / proposed UK AI regulation applies.' };
}

function security_statement_saas(page) {
  const t = allText(page);
  const pass = tm(t, [/encrypt(ed|ion)/i, /\bSSL\b/, /\bTLS\b/, /\b2FA\b/, /two.factor/i, /ISO.?27001/i, /\bSOC 2\b/]);
  return { pass, notes: pass ? 'Security/encryption statement found.' : 'No security or encryption statement found. UK GDPR Art. 32 requires this.' };
}

function pricing_transparency_saas(page) {
  const t = page.text || '';
  const hasPrice = tm(t, [/pricing/i, /per month/i, /per year/i, /\/mo\b/i, /[£€]\d+/]);
  const isPOA = tm(t, [/contact.*for.*pric/i, /pric.*on.*request/i]);
  if (!hasPrice || isPOA) return { pass: false, notes: 'No public pricing found. DMCC Act 2024 / Consumer Rights Act 2015 require transparent pricing.' };
  return { pass: true, notes: 'Transparent pricing found.' };
}

function free_trial_terms(page) {
  const t = page.text || '';
  const hasTrial = tm(t, [/free trial/i, /day.*trial/i, /trial period/i]);
  if (!hasTrial) return { pass: null, notes: 'No free trial detected.' };
  const pass = tm(t, [/cancel.*trial/i, /no credit card/i, /\d+.day.*trial/i, /after.*trial/i]);
  return { pass, notes: pass ? 'Free trial terms found.' : 'Free trial offered but no trial terms or cancellation information found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Travel & Tourism
// ─────────────────────────────────────────────────────────────────────

function atol_protection(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/ATOL (protected|protection|licence)/i, /Air Travel Organiser/i]) || /atol\.org\.uk/i.test(h);
  return { pass, notes: pass ? 'ATOL protection found.' : 'No ATOL protection found. Required for package holiday/flight+accommodation sales.' };
}

function abta_membership(page) {
  const t = allText(page);
  const h = page.html || '';
  const pass = tm(t, [/\bABTA\b.*member/i, /ABTA number/i]) || /abta\.com/i.test(h);
  return { pass, notes: pass ? 'ABTA membership found.' : 'No ABTA membership found.' };
}

function package_travel_info(page) {
  const t = page.text || '';
  const pass = tm(t, [/package (holiday|travel)/i, /all.inclusive/i, /flight\s*\+\s*hotel/i]);
  return { pass, notes: pass ? 'Package travel information found.' : 'No package travel pre-contract information found. Package Travel Regulations 2018 require this.' };
}

function cancellation_travel_policy(page) {
  const t = allText(page);
  const pass = tm(t, [/cancellation policy/i, /cancel(lation)?.*(refund|fee|charge)/i, /refund.*cancel/i]);
  return { pass, notes: pass ? 'Cancellation and refund policy found.' : 'No cancellation/refund policy found. Package Travel Regulations 2018 / Consumer Rights Act 2015 require this.' };
}

function price_breakdown_travel(page) {
  const t = page.text || '';
  const pass = tm(t, [/price.*includes/i, /includes.*flights/i, /per person/i, /tax(es)?.*included/i]);
  return { pass, notes: pass ? 'Price breakdown information found.' : 'No price breakdown found. Consumer Contracts Regulations 2013 require full cost disclosure.' };
}

function travel_insurance_disclosure(page) {
  const t = page.text || '';
  const found = tm(t, [/travel insurance/i, /optional.*insurance/i]);
  if (!found) return { pass: null, notes: 'No travel insurance mention found.' };
  return { pass: true, notes: 'Travel insurance is mentioned.' };
}

function travel_documentation_guidance(page) {
  const t = page.text || '';
  const found = tm(t, [/visa (requirement|information)/i, /passport (requirement|valid)/i, /entry requirement/i]);
  if (!found) return { pass: null, notes: 'No travel documentation guidance found — best practice, not mandatory.' };
  return { pass: true, notes: 'Travel documentation guidance found.' };
}

// ─────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────

export const CHECK_FUNCTIONS = {
  // Universal — Data Protection
  cookie_banner,
  privacy_policy,
  cookie_policy,
  data_controller,
  lawful_basis,
  dsar_rights,
  third_party_sharing,
  marketing_consent,
  ico_registration,
  dpo_contact,
  // Universal — Security & Company
  https,
  company_name,
  company_number,
  registered_address,
  contact_details,
  // Universal — Accessibility
  lang_attribute,
  img_alt_text,
  accessibility_statement,
  // Universal — Marketing
  misleading_claims,
  review_disclosure,
  // Ecommerce
  cancellation_rights,
  drip_pricing,
  delivery_info,
  refund_policy,
  pre_contract_info,
  product_safety,
  subscription_clarity,
  price_vat_inclusive,
  pci_dss_statement,
  terms_conditions,
  // Estate Agents
  property_ombudsman_membership,
  aml_policy,
  naea_membership,
  material_information_disclosure,
  fees_transparency,
  client_money_protection,
  complaints_procedure,
  // Financial Services
  fca_authorisation,
  financial_promotion_approval,
  risk_warnings,
  consumer_duty_fair_value,
  credit_agreement_disclosure,
  data_security_financial,
  financial_ombudsman,
  // Accountancy
  professional_body_membership,
  aml_accountancy_policy,
  hmrc_agent_registration,
  pi_insurance_accountancy,
  client_money_accountancy,
  confidentiality_statement,
  fees_transparency_accountancy,
  // Age-Restricted
  age_verification_gate,
  challenge_25_policy,
  age_restricted_delivery_policy,
  tobacco_regulations,
  avaa_2023_compliance,
  restricted_product_list,
  health_warnings,
  // Automotive
  motor_finance_fca,
  '30_day_rejection_right': day30_rejection_right,
  used_car_disclosure,
  distance_selling_automotive,
  warranty_terms,
  pricing_transparency_automotive,
  vehicle_safety_info,
  // Charities
  charity_number,
  fundraising_regulator,
  gift_aid_declaration,
  trustee_transparency,
  charitable_purposes_stated,
  financial_accountability,
  donation_security,
  privacy_donor_data,
  // Childcare & Education
  ofsted_registration,
  safeguarding_policy,
  dbs_check_statement,
  eyfs_compliance,
  child_protection_contact,
  parental_involvement,
  child_data_protection,
  staff_qualifications,
  // Construction & Trades
  gas_safe_registration,
  niceic_registration,
  public_liability_insurance,
  competent_person_scheme,
  hse_compliance_statement,
  guarantees_warranties,
  pricing_transparency,
  dbs_check_clearance,
  // Cosmetics
  responsible_person_cosmetics,
  scpn_notification,
  ingredient_labelling,
  safety_assessment_cosmetics,
  claims_substantiation_cosmetics,
  warning_statements,
  animal_testing_statement,
  // Food & Beverage
  allergen_information,
  fsa_registration,
  calorie_labelling,
  nutrition_claims_substantiated,
  food_hygiene_rating,
  ingredient_sourcing,
  vegan_vegetarian_labelling,
  // Gambling
  gambling_commission_licence,
  gamstop_integration,
  safer_gambling_tools,
  age_verification_gambling,
  responsible_gambling_links,
  odds_bet_rules_transparency,
  fund_safety_guarantee,
  complaints_gambling,
  // Healthcare
  cqc_registration,
  medicine_advertising_compliance,
  healthcare_claims,
  gphc_registration,
  professional_registration,
  data_confidentiality,
  regulatory_notices,
  // Insurance
  fca_insurance_authorisation,
  insurance_product_information,
  ipt_disclosure,
  complaints_insurance,
  renewal_transparency,
  data_protection_insurance,
  claims_process_transparency,
  // Legal Services
  sra_authorisation,
  bsb_barrister,
  legal_costs_transparency,
  professional_indemnity_disclosure,
  reserved_activities_notice,
  data_protection_special_category,
  // Letting Agents
  tenant_fees_act_compliance,
  how_to_rent_guide,
  arla_membership,
  deposit_scheme_membership,
  prescribed_information,
  landlord_insurance_disclosure,
  // Media & Publishing
  ipso_membership,
  corrections_policy,
  copyright_notice,
  editorial_standards,
  defamation_complaints_process,
  sponsored_content_disclosure,
  privacy_journalists,
  // Pharmaceuticals
  mhra_pharmacy_logo,
  gphc_registration_number,
  prescription_medicine_rules,
  pharmacy_superintendent,
  medicines_advertising_compliance,
  medicine_safety_info,
  consultation_availability,
  // Recruitment
  employment_agency_act_compliance,
  awr_compliance,
  rec_membership,
  candidate_data_retention,
  fee_transparency_recruitment,
  worker_rights_disclosure,
  complaints_recruitment,
  // SaaS & Software
  dpa_processor_agreement,
  saas_cancellation_policy,
  uptime_sla_transparency,
  data_portability_saas,
  ai_transparency_notice,
  security_statement_saas,
  pricing_transparency_saas,
  free_trial_terms,
  // Travel & Tourism
  atol_protection,
  abta_membership,
  package_travel_info,
  cancellation_travel_policy,
  price_breakdown_travel,
  travel_insurance_disclosure,
  travel_documentation_guidance,
};

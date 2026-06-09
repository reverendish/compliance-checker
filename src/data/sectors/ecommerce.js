export const ECOMMERCE = {
  id: 'ecommerce',
  name: 'E-Commerce & Retail',
  detection_signals: ['add to cart', 'buy now', 'checkout', 'basket', 'delivery', 'shipping', 'returns', 'order', 'shop', 'product'],
  checks: [
    {
      id: 'cancellation_rights',
      label: '14-day cancellation right',
      severity: 'high',
      law: 'Consumer Contracts Regulations 2013 reg. 29',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'For distance sales (online), customers have a 14-day right to cancel. Look for explicit mention of cancellation rights in T&Cs, a dedicated "Cancellation Policy" page, or a "14-day" reference. Check the main pages and footer links for terms, returns, cancellations policy.'
    },
    {
      id: 'drip_pricing',
      label: 'No drip pricing - all costs upfront',
      severity: 'high',
      law: 'DMCC Act 2024 / Consumer Rights Act 2015',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'Drip pricing is illegal: revealing compulsory charges step-by-step during checkout (e.g. adding fees at payment stage). Look at checkout pages for signs of compulsory fees hidden until late in the process. If fees appear all at once in the first stage, this passes.'
    },
    {
      id: 'delivery_info',
      label: 'Delivery information & timeframes',
      severity: 'medium',
      law: 'Consumer Contracts Regulations 2013 reg. 13',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'The site must state estimated delivery timeframes (e.g. "3-5 working days" or "next day") before checkout. Look for delivery estimates on product pages, checkout pages, or delivery/shipping info sections. Absence of any timeframe fails this check.'
    },
    {
      id: 'refund_policy',
      label: 'Refund policy present',
      severity: 'medium',
      law: 'Consumer Rights Act 2015 s.20',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'Look for a dedicated "Refund Policy", "Returns Policy", or similar page. It should cover how refunds are processed, timeframes, and conditions. Check footer links, T&Cs, or a dedicated policy page. May be combined with "Cancellation" or "Returns".'
    },
    {
      id: 'pre_contract_info',
      label: 'Pre-contract information complete',
      severity: 'medium',
      law: 'Consumer Contracts Regulations 2013 reg. 10',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'Before checkout, the site must display: product description, price, delivery costs, return rights, and business contact details. Scan product pages and checkout pages for these elements. If prices are shown but delivery costs are hidden until checkout, this fails.'
    },
    {
      id: 'product_safety',
      label: 'Product safety & regulatory compliance',
      severity: 'high',
      law: 'Product Safety and Metrology Regulations 2025',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'If selling physical goods, check for safety information: CE marks for EU-regulated products, UKCA marks for UK products, product compliance statements, or recalls/safety notices. Look on product pages or in T&Cs. If no products are visible, mark as null.'
    },
    {
      id: 'subscription_clarity',
      label: 'Subscription terms transparent & cancellation easy',
      severity: 'high',
      law: 'Consumer Contracts Regulations 2013 / DMCC Act 2024',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      conditional: true,
      condition_flag: 'has_subscription',
      guidance: 'If the site offers subscriptions, terms must be clear BEFORE purchase: cost, frequency, auto-renewal, and how to cancel. Cancellation must be as easy as signup (e.g. one-click from account dashboard). Look for subscription terms and cancellation instructions.'
    },
    {
      id: 'price_vat_inclusive',
      label: 'Prices shown VAT-inclusive',
      severity: 'medium',
      law: 'Consumer Rights Act 2015 s.11',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'All displayed prices must include VAT (if applicable). Look for "inc. VAT", "including VAT", or a VAT breakdown. If prices show £100 with VAT added at checkout (e.g. "£100 + £20 VAT = £120"), this fails.'
    },
    {
      id: 'pci_dss_statement',
      label: 'Payment security statement (PCI DSS)',
      severity: 'medium',
      law: 'PCI DSS v4.0 / Payment Card Industry',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'If taking card payments, look for a PCI DSS compliance statement, security certification badge, or mention of "PCI compliant" payment processing. Stripe, Adyen, and similar processors often have badges. Look on checkout page, footer, or T&Cs.'
    },
    {
      id: 'terms_conditions',
      label: 'Terms & conditions present',
      severity: 'medium',
      law: 'Consumer Rights Act 2015 / E-Commerce Regs 2002',
      category: 'sector_specific',
      jurisdictions: ['uk'],
      guidance: 'Look for a "Terms of Service", "Terms & Conditions", "Terms of Use", or "T&Cs" link in the footer or header. The page must address order processes, pricing, liability limits, and dispute resolution.'
    }
  ]
};

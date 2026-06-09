export function detectJsShell(html, $) {
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const hasSpaRoot = $('[id="root"],[id="app"],[id="__next"],[id="gatsby-focus-wrapper"]').length > 0;
  const thinText = bodyText.length < 400;
  const manyScripts = $('script').length > 8;
  const fewLinks = $('a').length < 4;
  const hasNoscript = $('noscript').text().toLowerCase().includes('javascript');

  if (thinText && hasSpaRoot)          return { isShell: true, reason: 'This appears to be a JS-rendered app (React/Vue/Next.js). The server returned a near-empty HTML shell — actual content loads in the browser. Results may be incomplete.' };
  if (thinText && manyScripts && fewLinks) return { isShell: true, reason: 'Very little readable content found in the page source — the site likely renders content with JavaScript. Results may be incomplete.' };
  if (hasNoscript && thinText)         return { isShell: true, reason: 'The page requires JavaScript to display content. Static HTML returned is mostly empty. Results may be incomplete.' };
  return { isShell: false, reason: null };
}

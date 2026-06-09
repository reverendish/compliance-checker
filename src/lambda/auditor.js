import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'eu-west-2' });

export async function auditBatch(pageContent, batch) {
  const systemPrompt = buildSystemPrompt(batch);
  const userContent = buildUserContent(pageContent);

  const command = new InvokeModelCommand({
    modelId: 'amazon.nova-pro-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      system: [{ text: systemPrompt }],
      messages: [{ role: 'user', content: [{ text: userContent }] }],
      inferenceConfig: {
        maxTokens: batch.checks.length * 180,
        temperature: 0.1
      }
    })
  });

  const response = await bedrock.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  const raw = body.output.message.content[0].text;
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

function buildSystemPrompt(batch) {
  const checkDefs = batch.checks
    .map(c => `id:"${c.id}" label:"${c.label}" severity:"${c.severity}" law:"${c.law}"\nguidance: ${c.guidance}`)
    .join('\n\n');

  return `You are a UK web compliance auditor specialising in ${batch.category_label}.
Analyse the website content and return ONLY valid JSON, no markdown.

Return exactly:
{
  "category_id": "${batch.category_id}",
  "checks": [
    {
      "id": "check_id",
      "label": "Check label",
      "pass": true,
      "severity": "high|medium|low",
      "law": "Law citation",
      "explanation": "1-2 specific sentences: exactly what you found or what is missing."
    }
  ]
}

Evaluate ALL ${batch.checks.length} checks below:
${checkDefs}

Rules:
- pass: true = compliant, false = non-compliant, null = not applicable or cannot determine
- Explanations must be specific. Never say "unable to determine" without explaining why.
- Return all ${batch.checks.length} checks. Do not skip any.`;
}

function buildUserContent({ targetUrl, httpStatus, pageText, pageLinks, headings, metaTags, imgAltMissing, imgTotal, langAttr }) {
  return `URL: ${targetUrl}
HTTPS: ${targetUrl.startsWith('https://') ? 'yes' : 'no'}
HTTP status: ${httpStatus ?? 'unknown'}
HTML lang attribute: ${langAttr || 'not set'}

--- PAGE TEXT (first 16000 chars) ---
${pageText || '(empty — likely JS-rendered or blocked)'}

--- LINKS (href + anchor text) ---
${pageLinks.slice(0, 120).map(l => `${l.text} → ${l.href}`).join('\n') || 'none'}

--- HEADINGS ---
${headings.map(h => `${h.tag}: ${h.text}`).join('\n') || 'none'}

--- IMAGES ---
Total: ${imgTotal}, missing alt text: ${imgAltMissing}

--- META TAGS ---
${Object.entries(metaTags).slice(0, 30).map(([k, v]) => `${k}: ${v}`).join('\n') || 'none'}`.trim();
}

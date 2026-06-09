import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'eu-west-2' });

export async function classifySector(pageContent) {
  const prompt = buildClassificationPrompt(pageContent);

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-sonnet-4-6-20251101-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 400,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const response = await bedrock.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  const text = body.content[0].text;
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

function buildClassificationPrompt({ pageText, pageLinks, headings, targetUrl }) {
  return `You are classifying a UK website's industry sector for compliance auditing.

URL: ${targetUrl}

PAGE TEXT (first 3000 chars):
${pageText.slice(0, 3000)}

HEADINGS: ${headings.map(h => h.text).join(', ')}

LINKS: ${pageLinks.slice(0, 30).map(l => l.text).join(', ')}

Return ONLY valid JSON (no markdown):
{
  "primary_sector": "one of: ecommerce|financial-services|healthcare|legal-services|estate-agents|letting-agents|food-beverage|gambling|travel-tourism|charities|construction-trades|insurance|accountancy|childcare-education|recruitment|pharmaceuticals|cosmetics|age-restricted|automotive|saas-software|media-publishing|general",
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
}`;
}

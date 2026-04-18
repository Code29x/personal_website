/**
 * Optional: rewrites Wikipedia excerpt into a short chat reply using Google Gemini.
 * Set GEMINI_API_KEY in Netlify. If unset, the frontend uses the raw Wikipedia text only.
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  const query = String(body.query || '').trim();
  const context = String(body.context || '').trim();
  if (!query || !context) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing_fields' }) };
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { statusCode: 200, headers, body: JSON.stringify({ configured: false }) };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const prompt =
    `You help visitors on a student portfolio chatbot.\n` +
    `User question: "${query}"\n\n` +
    `Use ONLY the facts in this Wikipedia excerpt. If it does not answer the question, say what the excerpt is about in 1–2 sentences and suggest they rephrase.\n` +
    `Reply in plain text, at most 6 short sentences. No markdown code blocks.\n\n` +
    `---\n${context.slice(0, 12000)}\n---`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        temperature: 0.35,
        maxOutputTokens: 512,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || 'api_error';
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ configured: true, text: '', error: msg }),
      };
    }
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => (p && p.text ? p.text : '')).join('') || '';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ configured: true, text: text.trim() }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: true,
        text: '',
        error: e && e.message ? e.message : 'exception',
      }),
    };
  }
};

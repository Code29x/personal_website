/**
 * Google Gemini (server-side only). Never put API keys in frontend code.
 *
 * Netlify → Site settings → Environment variables:
 *   GEMINI_API_KEY  — from https://aistudio.google.com/apikey
 * Optional:
 *   GEMINI_MODEL    — default: gemini-3.1-pro-preview (override e.g. gemini-2.5-flash if needed)
 *   GOOGLE_GEMINI_BASE_URL — Netlify AI Gateway base URL (if used)
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

  let bodyData = {};
  try {
    bodyData = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  const prompt = String(bodyData.prompt || '').trim();
  const useSearch = Boolean(bodyData.useSearch);

  if (!prompt) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing_prompt' }) };
  }

  const gatewayBase = process.env.GOOGLE_GEMINI_BASE_URL;
  const key = process.env.GEMINI_API_KEY;
  const useGateway = Boolean(gatewayBase);

  if (!useGateway && !key) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: false,
        error: 'missing_api_key',
        answer: '',
      }),
    };
  }

  const model =
    process.env.GEMINI_MODEL ||
    (useGateway ? 'gemini-2.5-flash' : 'gemini-3.1-pro-preview');

  const baseUrl = useGateway ? gatewayBase.replace(/\/$/, '') : 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${baseUrl}/models/${model}:generateContent${useGateway ? '' : `?key=${encodeURIComponent(key)}`}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [
        {
          text:
            "You are Vivek's AI Assistant on his personal portfolio website. Be helpful, concise, and friendly. " +
            'Keep replies short enough for a small chat window (a few sentences unless the user asks for detail). ' +
            'If you used web search results, mention that briefly. Do not use markdown code fences.',
        },
      ],
    },
    temperature: 0.4,
    maxOutputTokens: 768,
  };

  if (useSearch) {
    payload.tools = [{ google_search: {} }];
  }

  const fetchHeaders = { 'Content-Type': 'application/json' };
  if (useGateway && key) {
    fetchHeaders['x-goog-api-key'] = key;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data && data.error && data.error.message ? data.error.message : `http_${res.status}`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ configured: true, answer: '', error: msg }),
      };
    }

    let answer = '';
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      answer = data.candidates[0].content.parts
        .map((p) => (p && p.text ? p.text : ''))
        .join('');
    }

    if (!answer) {
      answer = 'Sorry, I could not generate an answer. Try rephrasing or use the Google link in the chat.';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: true,
        answer: answer.trim(),
        grounding: data.candidates && data.candidates[0] && data.candidates[0].groundingMetadata,
      }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: true,
        answer: '',
        error: e && e.message ? e.message : 'exception',
      }),
    };
  }
};

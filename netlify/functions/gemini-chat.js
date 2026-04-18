/**
 * Google Gemini AI Chat (server-side only).
 * Uses Netlify AI Gateway, which auto-injects GEMINI_API_KEY and
 * GOOGLE_GEMINI_BASE_URL on deployed sites — no manual key setup required.
 */
exports.handler = async (event) => {
  const q = (event.queryStringParameters && event.queryStringParameters.q) || '';
  let bodyData = {};
  if (event.httpMethod === 'POST' && event.body) {
    try {
      bodyData = JSON.parse(event.body);
    } catch(e) {}
  }
  const prompt = String(bodyData.prompt || q).trim();

  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'missing_prompt' }) };
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configured: false, answer: '' }),
    };
  }

  const baseUrl = (process.env.GOOGLE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
  const model = 'gemini-2.5-flash';

  try {
    const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${key}`;
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      systemInstruction: {
        parts: [{ text: "You are Vivek's AI Assistant on his personal website. You should be helpful, concise, and friendly. Provide short answers that fit well in a chat window. Do not output markdown code blocks if possible, keep it conversational." }]
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : 'api_error';
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configured: true, answer: '', error: msg }),
      };
    }

    let answer = 'Sorry, I could not generate an answer at this time.';
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      answer = data.candidates[0].content.parts[0].text;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configured: true, answer }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configured: true,
        answer: '',
        error: e && e.message ? e.message : 'exception',
      }),
    };
  }
};

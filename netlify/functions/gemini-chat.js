/**
 * Google Gemini AI Chat (server-side only).
 * Netlify: Site settings → Environment variables
 *   GEMINI_API_KEY  — API key from Google AI Studio
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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
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

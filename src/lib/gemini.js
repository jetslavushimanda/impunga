const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Simple cache — saves API calls during testing and demo
const CACHE_PREFIX = 'impunga_ai_';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getCacheKey(text) {
  return CACHE_PREFIX + text.trim().toLowerCase().substring(0, 120).replace(/\s+/g, '_');
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { text, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_MAX_AGE_MS) { localStorage.removeItem(key); return null; }
    return text;
  } catch { return null; }
}

function writeCache(key, text) {
  try { localStorage.setItem(key, JSON.stringify({ text, ts: Date.now() })); } catch {}
}

async function geminiRequest(prompt, systemInstruction) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  };

  // Try x-goog-api-key header (works for AQ. format keys)
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `HTTP ${response.status}`;
    const errorCode = data?.error?.code || response.status;
    console.error('Gemini API error:', errorCode, errorMsg);
    if (errorCode === 429 || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('RATE_LIMIT');
    }
    throw new Error(`API_ERROR: ${errorMsg}`);
  }

  return data.candidates[0].content.parts[0].text;
}

async function geminiChatRequest(messages, systemInstruction) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: messages,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `HTTP ${response.status}`;
    const errorCode = data?.error?.code || response.status;
    console.error('Gemini API error:', errorCode, errorMsg);
    if (errorCode === 429 || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('RATE_LIMIT');
    }
    throw new Error(`API_ERROR: ${errorMsg}`);
  }

  return data.candidates[0].content.parts[0].text;
}

export async function callGemini(prompt, systemInstruction) {
  const cacheKey = getCacheKey(prompt + systemInstruction.substring(0, 30));
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const text = await geminiRequest(prompt, systemInstruction);
  writeCache(cacheKey, text);
  return text;
}

export async function callGeminiWithHistory(messages, systemInstruction) {
  const lastMsg = messages[messages.length - 1]?.parts[0]?.text || '';
  const cacheKey = getCacheKey(lastMsg + messages.length);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const text = await geminiChatRequest(messages, systemInstruction);
  writeCache(cacheKey, text);
  return text;
}

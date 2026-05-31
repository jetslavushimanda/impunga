const GROQ_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Cache — saves API calls, prevents rate limits during demo
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

async function groqRequest(messages) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 1500 }),
  });
  const data = await response.json();
  if (!response.ok) {
    const msg = data?.error?.message || '';
    if (response.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(`API_ERROR: ${msg || response.status}`);
  }
  return data.choices[0].message.content;
}

export async function callGemini(prompt, systemInstruction) {
  const cacheKey = getCacheKey(prompt + systemInstruction.substring(0, 30));
  const cached = readCache(cacheKey);
  if (cached) return cached;
  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: prompt },
  ];
  const text = await groqRequest(messages);
  writeCache(cacheKey, text);
  return text;
}

export async function callGeminiWithHistory(messages, systemInstruction) {
  const lastMsg = messages[messages.length - 1]?.parts[0]?.text || '';
  const cacheKey = getCacheKey(lastMsg + messages.length);
  const cached = readCache(cacheKey);
  if (cached) return cached;
  const openAIMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.parts[0].text,
    })),
  ];
  const text = await groqRequest(openAIMessages);
  writeCache(cacheKey, text);
  return text;
}

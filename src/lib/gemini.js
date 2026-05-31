import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function getClient() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

// Simple cache — saves API calls during testing and demo
const CACHE_PREFIX = 'impunga_ai_';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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

function isRateLimit(err) {
  return (
    err.status === 429 ||
    err.message?.includes('429') ||
    err.message?.includes('quota') ||
    err.message?.includes('RESOURCE_EXHAUSTED') ||
    err.message?.includes('Too Many Requests')
  );
}

export async function callGemini(prompt, systemInstruction) {
  const cacheKey = getCacheKey(prompt + systemInstruction.substring(0, 30));
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { systemInstruction, temperature: 0.7, maxOutputTokens: 1500 },
    });
    const text = response.text;
    writeCache(cacheKey, text);
    return text;
  } catch (err) {
    if (isRateLimit(err)) throw new Error('RATE_LIMIT');
    throw err;
  }
}

export async function callGeminiWithHistory(messages, systemInstruction) {
  const lastMsg = messages[messages.length - 1]?.parts[0]?.text || '';
  const cacheKey = getCacheKey(lastMsg + messages.length);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const ai = getClient();
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction, temperature: 0.7, maxOutputTokens: 1500 },
      history: messages.slice(0, -1).map(m => ({ role: m.role, parts: m.parts })),
    });
    const response = await chat.sendMessage({ message: lastMsg });
    const text = response.text;
    writeCache(cacheKey, text);
    return text;
  } catch (err) {
    if (isRateLimit(err)) throw new Error('RATE_LIMIT');
    throw err;
  }
}

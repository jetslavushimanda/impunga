import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function getClient() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export async function callGemini(prompt, systemInstruction) {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });
    return response.text;
  } catch (err) {
    if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('RATE_LIMIT');
    }
    throw err;
  }
}

export async function callGeminiWithHistory(messages, systemInstruction) {
  const ai = getClient();
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: m.parts,
      })),
    });
    const lastMessage = messages[messages.length - 1];
    const response = await chat.sendMessage({ message: lastMessage.parts[0].text });
    return response.text;
  } catch (err) {
    if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('RATE_LIMIT');
    }
    throw err;
  }
}

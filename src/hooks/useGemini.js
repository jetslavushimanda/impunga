import { useState, useRef } from 'react';
import { callGemini, callGeminiWithHistory } from '../lib/gemini';

const IDEA_VALIDATOR_SYSTEM = `You are an experienced Zambian business mentor and market analyst. You have deep knowledge of the Zambian economy, consumer behavior, PACRA business registration, ZRA taxation, and market conditions in all 10 provinces. Always respond specifically to the Zambian context. Reference specific Zambian institutions, use Zambian Kwacha for all monetary references, and consider the specific challenges and opportunities of the Zambian market. Use simple plain English at a Grade 10 reading level. Be honest and constructive.`;

const BUSINESS_ADVISOR_SYSTEM = `You are IMPUNGA's AI Business Advisor — an experienced Zambian business mentor. You help Zambian entrepreneurs at all stages from idea to growing business. You have expert knowledge of PACRA registration, ZRA taxation, CEEC funding, Zambian labour law, mobile money systems (MTN, Airtel, Zamtel), Zambian banking, market prices in Kwacha, and business challenges specific to each Zambian province. Always respond in simple plain English. Always give practical actionable advice specific to Zambia. Reference real Zambian institutions. Use Kwacha. Be direct, honest and encouraging.`;

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const retryRef = useRef(null);

  function startRetryCountdown(seconds = 60) {
    setRetrySeconds(seconds);
    retryRef.current = setInterval(() => {
      setRetrySeconds(prev => {
        if (prev <= 1) { clearInterval(retryRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function validateBusinessIdea(ideaText, userContext) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Analyze this business idea for the Zambian market:

${ideaText}

User context: ${userContext}

Provide a structured analysis with these exact sections:

**VIABILITY SCORE: X/10**

**VERDICT: [PROCEED / REFINE / RECONSIDER]**

**1. MARKET ANALYSIS FOR ZAMBIA**
[2-3 sentences about the real market opportunity in Zambia]

**2. TARGET CUSTOMER PROFILE**
[Who exactly will buy this - be specific about Zambian demographics]

**3. LOCAL COMPETITION**
[What competition exists in Zambia, name specific local competitors if relevant]

**4. YOUR UNIQUE ADVANTAGE**
[What makes this idea stand out in the Zambian market]

**5. TOP 3 RISKS**
- Risk 1
- Risk 2
- Risk 3

**6. TOP 3 OPPORTUNITIES**
- Opportunity 1
- Opportunity 2
- Opportunity 3

**7. RECOMMENDED NEXT STEPS**
[3-5 specific, practical action steps the person should take now in Zambia]

Be specific to Zambia. Use Kwacha for money references. Be honest - if the idea needs work, say so constructively.`;

      const response = await callGemini(prompt, IDEA_VALIDATOR_SYSTEM);
      return response;
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getBusinessAdvice(userMessage, conversationHistory, userContext) {
    setLoading(true);
    setError(null);
    try {
      const systemWithContext = `${BUSINESS_ADVISOR_SYSTEM}

Current user context: ${userContext || 'General Zambian entrepreneur'}`;

      const messages = [
        ...conversationHistory.slice(-18),
        { role: 'user', parts: [{ text: userMessage }] },
      ];

      const response = await callGeminiWithHistory(messages, systemWithContext);
      return response;
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function getFriendlyError(err) {
    if (err.message === 'GEMINI_API_KEY_MISSING') {
      return 'AI features need a Gemini API key. Add your key to the .env file.';
    }
    if (err.message === 'RATE_LIMIT') {
      startRetryCountdown(60);
      return 'Too many AI requests. Free tier allows 15 per minute. Please wait 60 seconds then try again.';
    }
    if (!navigator.onLine) {
      return 'You are offline. AI features need internet connection.';
    }
    return `Error: ${err.message}. Check internet and try again.`;
  }

  return { loading, error, retrySeconds, validateBusinessIdea, getBusinessAdvice };
}

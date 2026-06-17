import { useState, useRef } from 'react';
import { callGemini, callGeminiWithHistory } from '../lib/gemini';

const IDEA_VALIDATOR_SYSTEM = `You are an experienced Zambian business mentor and market analyst. You have deep knowledge of the Zambian economy, consumer behavior, PACRA business registration, ZRA taxation, and market conditions in all 10 provinces. Always respond specifically to the Zambian context. Reference specific Zambian institutions, use Zambian Kwacha for all monetary references, and consider the specific challenges and opportunities of the Zambian market. Use simple plain English at a Grade 10 reading level. Be honest and constructive.`;

const BUSINESS_ADVISOR_SYSTEM = `You are IMPUNGA's AI Business Advisor — an expert in Zambian business law, regulatory compliance, and entrepreneurship. You MUST cite official Zambian regulatory sources in every response. When giving advice:
- Always reference the exact Act, Regulation, or official body (e.g. "According to the PACRA Act Cap 388, your business structure requires...", "Under ZRA Income Tax Act, Section X...", "As per CEEC guidelines...", "The Patents and Companies Registration Agency requires...", "Under the Zambia Revenue Authority VAT thresholds...").
- Reference real Zambian institutions: PACRA, ZRA, CEEC, DBZ, NAPSA, NHIMA, Workers Compensation Fund, Ministry of Commerce, ZICB, Bank of Zambia, ZEMA, WARMA.
- Use Kwacha for all monetary references.
- Give practical, actionable advice tied directly to Zambian law and regulation.
- Be direct, honest and encouraging.`;

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

Current user context: ${userContext || 'General Zambian entrepreneur'}

IMPORTANT: Every response MUST cite at least one specific official Zambian regulatory source, Act, or government body. Format citations like: "According to [Source], ..."`;

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

  async function generateBusinessNames(description, sector, style, province) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Generate 8 unique business name suggestions for this Zambian business:

Description: ${description}
Sector: ${sector || 'General'}
Style preference: ${style}
Location: ${province || 'Zambia'}

For each name provide:
1. The business name
2. Meaning (if it uses a local language word)
3. Why it works for this business in Zambia

Format your response as JSON array like this:
[
  {"name": "BusinessName", "meaning": "what it means (or empty string)", "reason": "why it works"},
  ...
]

Rules:
- Mix English and local Zambian language names (Bemba, Nyanja, Tonga)
- Make names memorable and easy to say
- Avoid copying existing famous brands
- Keep names short (1-3 words max)
- Make them relevant to the Zambian market
- Return ONLY the JSON array, no other text`;

      const response = await callGemini(prompt, 'You are a creative Zambian business naming expert. You know Bemba, Nyanja, Tonga and English. You create memorable, meaningful business names for the Zambian market. Always respond with valid JSON only.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function extractSkillsFromDescription(description) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a career intelligence system for the Zambian job market. A person has described their work experience and background. Extract and identify their skills.

Experience Description:
"${description}"

Available skill categories and skills:
TECHNICAL: Computer Programming, Web Development, Mobile App Development, Data Analysis, Graphic Design, Video Editing, Social Media Management, Accounting and Bookkeeping, Electrical Installation, Plumbing, Welding, Carpentry and Joinery, Motor Vehicle Mechanics, Air Conditioning and Refrigeration, Solar Panel Installation, Networking and IT Support
VOCATIONAL: Tailoring and Dressmaking, Hairdressing and Beauty, Bricklaying and Plastering, Painting and Decorating, Catering and Cooking, Baking and Confectionery, Farming and Agriculture, Animal Husbandry, Fish Farming, Driving and Transport, Security Services, Cleaning Services, Childcare, Teaching and Tutoring, Nursing and Healthcare, Photography
SOFT SKILLS: Communication, Leadership, Teamwork, Problem Solving, Customer Service, Sales and Marketing, Project Management, Public Speaking, Negotiation, Financial Management, Research

Return ONLY a JSON object in this exact format:
{
  "extractedSkills": ["Skill1", "Skill2", "Skill3"],
  "summary": "One sentence summary of their professional profile",
  "confidence": "high/medium/low",
  "suggestions": ["Any additional skills they likely have but didn't explicitly mention"]
}

Only include skills from the lists above. Return ONLY valid JSON.`;

      const response = await callGemini(prompt, 'You are a semantic skill extraction AI for the Zambian job market. Analyze text and identify professional skills. Return only valid JSON.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function analyzeMarketTrends(ledgerData, sector, province) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a Zambian market intelligence analyst. Analyze this business's financial data against sector averages for Zambia.

Business Sector: ${sector || 'General Retail'}
Province: ${province || 'Lusaka'}
Business Financial Summary:
${JSON.stringify(ledgerData, null, 2)}

Provide a Market Trends Analysis with these sections:

**MARKET TRENDS ANALYSIS**

**1. COST BENCHMARK COMPARISON**
Compare their key expense categories against typical Zambian ${sector} businesses. Flag any that are significantly above or below average.
Use format: "Your [expense] cost is X% [higher/lower] than the typical [sector] business in [province]."

**2. REVENUE PERFORMANCE**
Compare their revenue to what similar ${sector} businesses typically earn in Zambia.

**3. PROFIT MARGIN ASSESSMENT**
Assess their profit margin against Zambian industry standards for ${sector}.

**4. KEY INSIGHTS**
3 specific, actionable insights based on their data compared to market averages.

**5. RECOMMENDATIONS**
3 specific steps to improve performance based on Zambian market conditions.

Be specific, use Kwacha amounts, and reference real Zambian market conditions.`;

      const response = await callGemini(prompt, 'You are a Zambian business market analyst with knowledge of sector-specific cost and revenue benchmarks for all 10 Zambian provinces. Give specific, data-driven analysis using Kwacha.');
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

  return { loading, error, retrySeconds, validateBusinessIdea, getBusinessAdvice, generateBusinessNames, extractSkillsFromDescription, analyzeMarketTrends };
}

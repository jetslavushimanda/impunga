import { useState, useRef } from 'react';
import { callGemini, callGeminiWithHistory } from '../lib/gemini';

const IDEA_VALIDATOR_SYSTEM = `You are an experienced Zambian business mentor and market analyst. You have deep knowledge of the Zambian economy, consumer behavior, PACRA business registration, ZRA taxation, and market conditions in all 10 provinces. Always respond specifically to the Zambian context. Reference specific Zambian institutions, use Zambian Kwacha for all monetary references, and consider the specific challenges and opportunities of the Zambian market. Use simple plain English at a Grade 10 reading level. Be honest and constructive.`;

const BUSINESS_ADVISOR_SYSTEM = `You are the IMPUNGA AI Assistant — the central intelligence and guide for Zambia's Economic Intelligence Platform.
Your primary role is to help users navigate the IMPUNGA platform and provide tailored Zambian business/skills advice.
If a user asks how to do something, refer them to the specific IMPUNGA module:
- Idea testing? -> "Engine 1: Idea Validator"
- Generating a name? -> "Engine 1: Name Generator"
- Need a business plan? -> "Engine 1: Plan Builder"
- Finances/Pricing? -> "Engine 1: Ledger / Pricing Calculator"
- Building a professional profile? -> "Engine 2: Skill Profile Builder"
- Looking for jobs? -> "Engine 2: Career Matches"
- Want to trade/network? -> "Engine 4: Market (Verified Directory / Portfolio Showcase)"

When giving business advice, you MUST cite official Zambian regulatory sources (PACRA, ZRA, CEEC, etc.) and use Kwacha for all money.
Be direct, helpful, and proudly represent the IMPUNGA ecosystem.`;

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
      const prompt = `Critically analyze this business idea for the Zambian market:

${ideaText}

User context: ${userContext}

CRITICAL INSTRUCTIONS:
1. DO NOT default to a 6/10 or 7/10 score. Be brutal and realistic. If the idea is vague, lacks a clear profit mechanism, or is highly saturated, give it a 2/10 to 4/10. Only give 8/10+ for truly exceptional, well-thought-out ideas.
2. Analyze the CORE MECHANICS: Is this business BUYING, SELLING, PRODUCING, or SERVICING? Focus deeply on the unit economics of that specific angle.
3. DO NOT give generic advice about PACRA or ZRA registration unless absolutely critical. Focus on market demand, supply chain, customer acquisition, and profit margins.

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

**7. SIMILAR / PIVOT IDEAS**
[2-3 brief alternative variations of this idea that might work better in Zambia or have higher margins]

**8. RECOMMENDED NEXT STEPS**
[3-5 specific, practical action steps (e.g., finding suppliers, testing demand). Do NOT mention business registration here; focus on business mechanics.]

Be highly specific to Zambia. Use Kwacha for money references. Be brutally honest - if the idea needs major work, say so constructively and score it low.`;

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

  async function generateComplianceReport(businessProfile, ledgerSummary) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a Zambian tax and regulatory compliance expert. Analyze this business profile and generate a detailed compliance health report.

Business Profile:
${JSON.stringify(businessProfile, null, 2)}

Ledger Summary:
${JSON.stringify(ledgerSummary, null, 2)}

Generate a compliance report in this EXACT JSON format:
{
  "healthScore": 75,
  "summary": "One sentence overall compliance summary",
  "deadlines": [
    {
      "title": "ZRA Monthly VAT Return",
      "authority": "Zambia Revenue Authority",
      "legalRef": "VAT Act Cap 331",
      "dueDate": "2026-07-18",
      "status": "upcoming",
      "description": "Monthly VAT return must be filed by 18th of each month",
      "action": "File on ZRA TaxOnline portal at www.zra.org.zm"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation 1 citing ZRA/PACRA/NAPSA rules",
    "Specific actionable recommendation 2"
  ]
}

Status must be one of: "overdue", "due_soon", "upcoming", "compliant"
Include ALL relevant compliance items for this business type: ZRA PAYE (monthly, due 10th), ZRA VAT if turnover >K800,000 (18th monthly), NAPSA contributions (10th monthly), NHIMA levy, PACRA annual returns (within 90 days of financial year end), Workers Compensation Fund, provisional tax (quarterly).
Return ONLY valid JSON, no other text.`;

      const response = await callGemini(prompt, 'You are a Zambian tax compliance expert. Return only valid JSON compliance reports. Reference exact ZRA, PACRA, NAPSA, NHIMA regulations.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function semanticSearch(query, userContext) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are IMPUNGA's semantic search engine for Zambian entrepreneurs. A user typed: "${query}"

User context: ${userContext || 'General Zambian entrepreneur'}

Available modules in the app:
- /idea-validator: Idea Validator (validate business ideas)
- /business-plan: Business Plan Builder (create business plans)
- /pricing-calculator: Pricing Calculator (set product prices)
- /business-ledger: Business Ledger (track finances)
- /funding-finder: Funding Finder (find funding sources)
- /ai-advisor: AI Business Advisor (get business advice)
- /registration-guide: Registration Guide (PACRA/ZRA registration)
- /name-generator: Business Name Generator
- /invoice-generator: Invoice Generator
- /market-prices: Market Prices (check commodity prices)
- /swot-analysis: SWOT Analysis
- /social-media: Social Media Generator
- /skill-profile-builder: Skill Profile Builder
- /career-matches: Career Matches
- /compliance-tracker: Compliance Tracker (ZRA/PACRA deadlines)
- /market-trends: Market Trend Predictor

Market price categories available: Grains & Staples, Vegetables & Fruits, Meat & Protein, Fuel & Transport

Return a JSON object in this EXACT format:
{
  "intent": "One sentence describing what the user wants to do",
  "modules": [
    {"path": "/registration-guide", "name": "Registration Guide", "reason": "Why this is relevant to their query", "priority": "high"},
    {"path": "/market-prices", "name": "Market Prices", "reason": "Check fish prices in Kasama", "priority": "medium"}
  ],
  "marketCategory": "Grains & Staples or null",
  "fundingKeyword": "agriculture or null",
  "tip": "One specific practical tip for this user's situation in Zambia"
}

Priority must be "high", "medium", or "low". Return maximum 4 modules. Return ONLY valid JSON.`;

      const response = await callGemini(prompt, 'You are a semantic search engine for a Zambian business platform. Understand user intent and return structured JSON results mapping to available app modules.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function generateMarketForecast(category, province, priceData) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a Zambian agricultural and commodity market analyst with deep knowledge of seasonal price patterns.

Category: ${category}
Province: ${province}
Current price data: ${JSON.stringify(priceData, null, 2)}

Generate a market forecast in this EXACT JSON format:
{
  "headline": "Short headline forecast for this category in this province",
  "narrative": "3-4 sentence AI forecast explaining seasonal patterns, peak months, and recommended actions for businesses in ${province}",
  "peakMonths": ["July", "August"],
  "lowMonths": ["February", "March"],
  "monthlyIndex": [
    {"month": "Jan", "index": 85, "label": "Low season"},
    {"month": "Feb", "index": 78, "label": "Lowest prices"},
    {"month": "Mar", "index": 82, "label": "Harvest begins"},
    {"month": "Apr", "index": 88, "label": "Post-harvest"},
    {"month": "May", "index": 95, "label": "Rising"},
    {"month": "Jun", "index": 105, "label": "Dry season"},
    {"month": "Jul", "index": 118, "label": "Peak prices"},
    {"month": "Aug", "index": 122, "label": "Peak season"},
    {"month": "Sep", "index": 115, "label": "Declining"},
    {"month": "Oct", "index": 102, "label": "Normalising"},
    {"month": "Nov", "index": 90, "label": "Rains begin"},
    {"month": "Dec", "index": 88, "label": "Seasonal low"}
  ],
  "businessAdvice": "Specific advice for entrepreneurs buying/selling this category in ${province}",
  "riskFactors": ["Risk 1", "Risk 2"]
}

The monthlyIndex represents price relative to annual average (100 = average, 120 = 20% above average). Base this on real Zambian seasonal agricultural and commodity patterns. Return ONLY valid JSON.`;

      const response = await callGemini(prompt, 'You are a Zambian commodity market analyst. Use real seasonal knowledge of Zambian agriculture, rainfall patterns, harvest cycles, and market dynamics. Return only valid JSON.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function critiqueBusinessPlan(planData) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a strict but helpful Zambian business consultant. Review this draft business plan and provide a constructive critique based on Zambian market realities.
      
Business Plan Draft:
${JSON.stringify(planData, null, 2)}

Provide your critique in this EXACT JSON format:
{
  "overallScore": "X/10",
  "summary": "2-3 sentences summarizing the strengths and weaknesses of the plan",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "marketRealities": ["Insight about the specific Zambian province/sector"],
  "actionableAdvice": ["Action 1", "Action 2"]
}

Base your critique on realistic costs, revenue expectations, and market dynamics in ${planData.province || 'Zambia'} for the ${planData.sector || 'business'} sector. Use Kwacha for any monetary references. Return ONLY valid JSON.`;

      const response = await callGemini(prompt, 'You are an expert Zambian business consultant. Return only valid JSON.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function generatePredictiveRoadmap(career, currentSkills, province) {
    setLoading(true);
    setError(null);
    try {
      const prompt = `You are a Zambian career counselor. Create a predictive career roadmap for someone wanting to become a ${career.name} in Zambia.

Target Career: ${career.name}
User's Current Skills: ${currentSkills.join(', ')}
Location: ${province || 'Zambia'}

Provide a roadmap in this EXACT JSON format:
{
  "summary": "1-2 sentences on their current readiness and what they need",
  "skillGaps": ["Gap 1", "Gap 2"],
  "trainingInstitutions": [
    {"name": "Institution Name", "location": "City/Province or Online", "course": "Course/Program Name"}
  ],
  "steps": [
    {"step": 1, "title": "First step title", "description": "What to do first"},
    {"step": 2, "title": "Second step title", "description": "What to do next"}
  ],
  "jobMarketOutlook": "Brief sentence on the demand for this role in Zambia"
}

Identify local Zambian training institutions (e.g. TEVETA institutions, UNZA, CBU, Evelyn Hone, ZCAS, local trades schools) relevant to their province (${province}) and skill gaps. Return ONLY valid JSON.`;

      const response = await callGemini(prompt, 'You are an expert Zambian career and education counselor. Return only valid JSON.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      const msg = getFriendlyError(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function analyzePricingTrend(costPrice, sellingPrice, sector, province) {
    setLoading(true);
    setError(null);
    try {
      const margin = sellingPrice - costPrice;
      const marginPercent = costPrice > 0 ? (margin / costPrice) * 100 : 0;
      
      const prompt = `You are a Zambian pricing and market analyst. Analyze the following pricing strategy for a small business:
      
Sector: ${sector || 'General Retail'}
Location: ${province || 'Zambia'}
Cost Price: K${costPrice}
Selling Price: K${sellingPrice}
Profit Margin: ${marginPercent.toFixed(1)}%

Determine if this is underpriced, overpriced, or fairly priced based on sector averages in Zambia.
Provide the assessment in this EXACT JSON format:
{
  "verdict": "Underpriced" | "Overpriced" | "Fair",
  "marketAverage": "Estimated average price or margin for this sector in Zambia",
  "advice": "1-2 short sentences of actionable advice"
}
Return ONLY valid JSON.`;

      const response = await callGemini(prompt, 'You are an expert Zambian pricing analyst. Return only valid JSON.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
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

  return { loading, error, retrySeconds, validateBusinessIdea, getBusinessAdvice, generateBusinessNames, extractSkillsFromDescription, analyzeMarketTrends, generateComplianceReport, semanticSearch, generateMarketForecast, critiqueBusinessPlan, generatePredictiveRoadmap, analyzePricingTrend };
}


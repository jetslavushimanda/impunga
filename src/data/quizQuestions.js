export const QUIZ_QUESTIONS = [
  {
    id: 1, category: 'Registration',
    question: 'Which government body registers businesses in Zambia?',
    options: ['ZRA', 'PACRA', 'CEEC', 'ZICA'],
    correct: 1,
    explanation: 'PACRA — the Patents and Companies Registration Agency — is the body responsible for registering all businesses in Zambia.'
  },
  {
    id: 2, category: 'Registration',
    question: 'How much does it cost to register a Sole Trader business name with PACRA?',
    options: ['K50', 'K220', 'K500', 'K1,000'],
    correct: 1,
    explanation: 'Registering a business name (Sole Trader) with PACRA costs approximately K220 — the cheapest and fastest way to start a legal business.'
  },
  {
    id: 3, category: 'Registration',
    question: 'What does TPIN stand for?',
    options: ['Tax Payer Identification Number', 'Trade Person Identity Number', 'Total Payment Invoice Number', 'Tax Processing Invoice Number'],
    correct: 0,
    explanation: 'TPIN stands for Tax Payer Identification Number. Every business owner must register with ZRA to get a TPIN before paying any taxes.'
  },
  {
    id: 4, category: 'Taxation',
    question: 'What is the turnover tax rate for small businesses in Zambia earning under K800,000 per year?',
    options: ['5%', '3%', '16%', '10%'],
    correct: 1,
    explanation: 'Small businesses in Zambia earning under K800,000 per year pay a turnover tax of 3% — much simpler and lower than standard income tax.'
  },
  {
    id: 5, category: 'Taxation',
    question: 'Which government body collects taxes in Zambia?',
    options: ['PACRA', 'CEEC', 'ZRA', 'Bank of Zambia'],
    correct: 2,
    explanation: 'ZRA — the Zambia Revenue Authority — is responsible for collecting all taxes in Zambia, including income tax, VAT and turnover tax.'
  },
  {
    id: 6, category: 'Funding',
    question: 'What does CEEC stand for?',
    options: [
      'Central Economic Empowerment Corporation',
      'Citizens Economic Empowerment Commission',
      'Commercial Enterprise and Export Council',
      'Cooperative Economic Empowerment Centre'
    ],
    correct: 1,
    explanation: 'CEEC — Citizens Economic Empowerment Commission — provides loans and grants to Zambian citizens to start and grow businesses.'
  },
  {
    id: 7, category: 'Funding',
    question: 'The Tony Elumelu Foundation grant for African entrepreneurs is worth approximately:',
    options: ['K5,000', 'K50,000', '$5,000 USD', '$50,000 USD'],
    correct: 2,
    explanation: 'The Tony Elumelu Foundation provides $5,000 USD to selected entrepreneurs across Africa through a competitive annual application process.'
  },
  {
    id: 8, category: 'Funding',
    question: 'What is the CDF in Zambia?',
    options: [
      'Community Development Fund',
      'Constituency Development Fund',
      'Central Development Finance',
      'Cooperative Development Fund'
    ],
    correct: 1,
    explanation: 'The CDF — Constituency Development Fund — is government money allocated to each constituency that can be accessed for small business development.'
  },
  {
    id: 9, category: 'Pricing & Profit',
    question: 'If your product costs K80 to make and you want a 25% profit margin, what should you charge?',
    options: ['K100', 'K105', 'K107', 'K110'],
    correct: 2,
    explanation: 'Price = Cost ÷ (1 - Margin). K80 ÷ (1 - 0.25) = K80 ÷ 0.75 = K106.67 ≈ K107. A common mistake is adding 25% to cost (K100) — that only gives 20% margin!'
  },
  {
    id: 10, category: 'Pricing & Profit',
    question: 'What is "break-even point" in business?',
    options: [
      'When your business makes maximum profit',
      'When your revenue exactly covers your costs with zero profit',
      'When you have no more stock to sell',
      'When your business shuts down'
    ],
    correct: 1,
    explanation: 'Break-even is when your total revenue equals your total costs — you are making no profit but also no loss. Every sale after break-even is pure profit.'
  },
  {
    id: 11, category: 'Pricing & Profit',
    question: 'Which of these kills most Zambian small businesses silently?',
    options: ['High rent', 'Wrong pricing — charging too little', 'Too many customers', 'Too much profit'],
    correct: 1,
    explanation: 'Underpricing is the silent killer of Zambian small businesses. Many owners feel busy and appear successful but make no real profit because they never calculated their true costs.'
  },
  {
    id: 12, category: 'Business Structure',
    question: 'Which business structure protects your personal assets if the business fails?',
    options: ['Sole Trader', 'Partnership', 'Private Limited Company (Ltd)', 'All of the above'],
    correct: 2,
    explanation: 'A Private Limited Company (Ltd) gives you "limited liability" — meaning your personal home, car and savings are protected if the business owes money or fails.'
  },
  {
    id: 13, category: 'Business Structure',
    question: 'What is the minimum number of people required to register a Partnership in Zambia?',
    options: ['1', '2', '3', '5'],
    correct: 1,
    explanation: 'A Partnership requires a minimum of 2 people. It is ideal for family businesses or friends starting together, with shared responsibilities and profits.'
  },
  {
    id: 14, category: 'Marketing',
    question: 'Which social media platform has the most active business users in Zambia in 2026?',
    options: ['Twitter/X', 'LinkedIn', 'Facebook', 'Snapchat'],
    correct: 2,
    explanation: 'Facebook remains the most widely used platform for business marketing in Zambia, followed by WhatsApp. Most Zambian small businesses get customers through Facebook posts and WhatsApp groups.'
  },
  {
    id: 15, category: 'Marketing',
    question: 'What is the most cost-effective marketing method for a new small business in Zambia?',
    options: ['TV advertising', 'Radio commercials', 'Word of mouth and WhatsApp', 'Newspaper ads'],
    correct: 2,
    explanation: 'Word of mouth and WhatsApp sharing cost nothing and are the most trusted forms of marketing in Zambia. A satisfied customer telling 5 friends is more powerful than any paid advertisement.'
  },
  {
    id: 16, category: 'Finance',
    question: 'What is mobile money called in Zambia? (Select the most common platform)',
    options: ['M-Pesa', 'MTN Mobile Money', 'PayPal', 'FNB eWallet'],
    correct: 1,
    explanation: 'MTN Mobile Money (and Airtel Money) are the dominant mobile money platforms in Zambia, widely used for business payments, supplier payments and receiving money from customers.'
  },
  {
    id: 17, category: 'Finance',
    question: 'Why should every business owner keep a SEPARATE bank account for their business?',
    options: [
      'It is required by PACRA',
      'To easily track business profit and expenses separately from personal money',
      'To get a lower bank fee',
      'There is no real reason'
    ],
    correct: 1,
    explanation: 'Mixing business and personal money is one of the biggest mistakes entrepreneurs make. A separate account shows you exactly how much profit the business makes and makes tax filing much easier.'
  },
  {
    id: 18, category: 'Entrepreneurship',
    question: 'What does SWOT stand for in business analysis?',
    options: [
      'Sales, Wages, Operations, Targets',
      'Strengths, Weaknesses, Opportunities, Threats',
      'Strategy, Work, Output, Timeline',
      'Systems, Workflow, Objectives, Targets'
    ],
    correct: 1,
    explanation: 'SWOT — Strengths, Weaknesses, Opportunities, Threats — is a fundamental business analysis tool used to understand your business position and plan your strategy.'
  },
  {
    id: 19, category: 'Entrepreneurship',
    question: 'Zambia has how many provinces?',
    options: ['8', '9', '10', '12'],
    correct: 2,
    explanation: 'Zambia has 10 provinces: Lusaka, Copperbelt, Southern, Eastern, Northern, Western, Luapula, Central, Muchinga and North-Western. Knowing your market geography is key to business planning.'
  },
  {
    id: 20, category: 'Entrepreneurship',
    question: 'What does IMPUNGA mean in Bemba?',
    options: ['Hard work', 'The seed that grows', 'Money tree', 'Business plan'],
    correct: 1,
    explanation: 'IMPUNGA means "the seed that grows" in Bemba. Just like a seed needs the right conditions to grow, every business idea needs the right knowledge, tools and guidance — which is exactly what this app provides!'
  },
];

export const CATEGORIES = [...new Set(QUIZ_QUESTIONS.map(q => q.category))];

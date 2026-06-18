import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Building2, TrendingUp, AlertTriangle, CheckCircle, Percent, Clock, DollarSign, Wallet, Globe, ArrowRight, HelpCircle } from 'lucide-react';
import { formatKwachaSimple } from '../lib/utils';
import PageHeaderCard from '../components/shared/PageHeaderCard';

const LENDERS = {
  commercial: [
    { name: 'Zanaco Bank', desc: 'Standard business & personal salary loans.', link: 'https://www.zanaco.co.zm', badge: 'Commercial Bank' },
    { name: 'Stanbic Bank Zambia', desc: 'SME credit facilities & personal unsecured loans.', link: 'https://www.stanbicbank.co.zm', badge: 'Commercial Bank' },
    { name: 'FNB Zambia', desc: 'Digital-first lending and personal overdrafts.', link: 'https://www.fnbzambia.co.zm', badge: 'Commercial Bank' },
    { name: 'Absa Zambia', desc: 'Capital finance & structured retail loans.', link: 'https://www.absa.co.zm', badge: 'Commercial Bank' }
  ],
  government: [
    { name: 'Citizens Economic Empowerment Commission (CEEC)', desc: 'Low-interest economic empowerment funds & youth/women loans.', link: 'https://www.ceec.org.zm', badge: 'Government Fund' },
    { name: 'Constituency Development Fund (CDF)', desc: 'Community and micro-business development grants.', link: 'https://www.parliament.gov.zm', badge: 'Government Grant' }
  ],
  microfinance: [
    { name: 'Lupiya', desc: 'Fast, digital micro-loans for individuals & small businesses.', link: 'https://www.lupiya.com', badge: 'Digital Microfinance' },
    { name: 'FINCA Zambia', desc: 'Micro-business and group solidarity loans.', link: 'https://www.finca.co.zm', badge: 'Microfinance MFI' },
    { name: 'Izwe Loans', desc: 'Personal loans specifically for civil servants & private sector workers.', link: 'https://www.izwezambia.com', badge: 'Payroll Lender' },
    { name: 'Bayport Financial Services', desc: 'Unsecured personal and payroll consumer loans.', link: 'https://www.bayportzambia.com', badge: 'Consumer Finance' }
  ]
};

const LOAN_TYPES = [
  { id: 'commercial', name: 'Commercial Bank Loan', baseRate: 24.5, description: 'Standard business or personal loans from major Zambian commercial banks.' },
  { id: 'government', name: 'Government/CEEC Fund', baseRate: 12.0, description: 'Subsidized citizen empowerment loans (business-focused).' },
  { id: 'microfinance', name: 'Microfinance (MFI)', baseRate: 48.0, description: 'Fast approvals but high-interest short-term personal or micro-business credit.' },
  { id: 'custom', name: 'Custom Rate', baseRate: 20.0, description: 'Specify your own interest rate.' }
];

export default function LoansPortal() {
  const [loanCategory, setLoanCategory] = useState('personal'); // 'personal' or 'business'
  
  // Calculator states
  const [loanAmount, setLoanAmount] = useState(25000);
  const [loanTerm, setLoanTerm] = useState(12); // months
  const [selectedRateType, setSelectedRateType] = useState('commercial');
  const [customRate, setCustomRate] = useState(24.5);
  
  // Cashflow/Income states
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(8000);
  const [monthlySalary, setMonthlySalary] = useState(10000);
  const [personalLiabilities, setPersonalLiabilities] = useState(3000);

  // Guided assessment quiz states
  const [quizIncomeSource, setQuizIncomeSource] = useState('');
  const [quizPacra, setQuizPacra] = useState('');
  const [quizCollateral, setQuizCollateral] = useState('');
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [quizRecommendation, setQuizRecommendation] = useState('');

  const currentRate = selectedRateType === 'custom' ? customRate : LOAN_TYPES.find(t => t.id === selectedRateType)?.baseRate || 24.5;
  
  // Amortization Math (Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1))
  const monthlyRate = (currentRate / 100) / 12;
  const emi = loanAmount > 0 && currentRate > 0 && loanTerm > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
    : (loanAmount / loanTerm);
    
  const totalRepayment = emi * loanTerm;
  const totalInterest = totalRepayment - loanAmount;
  
  // Capacity calculations
  let netIncome = 0;
  let capacityMetricLabel = '';
  let capacityMetricValue = '';
  let isAffordable = false;
  let explanationText = '';

  if (loanCategory === 'business') {
    netIncome = monthlyRevenue - monthlyExpenses;
    const dscr = emi > 0 ? netIncome / emi : 0;
    capacityMetricLabel = 'Debt Service Coverage Ratio (DSCR)';
    capacityMetricValue = `${dscr.toFixed(2)}x`;
    isAffordable = dscr >= 1.25;
    explanationText = isAffordable 
      ? `Your business net income of ${formatKwachaSimple(netIncome)} comfortably covers the monthly repayment. Lenders generally require a DSCR above 1.25x.` 
      : `Your business net income of ${formatKwachaSimple(netIncome)} is too low to safely support this repayment. Banks will likely flag this as high risk.`;
  } else {
    netIncome = monthlySalary - personalLiabilities;
    const dti = monthlySalary > 0 ? (emi / monthlySalary) * 100 : 0;
    capacityMetricLabel = 'Debt-to-Income (DTI) Ratio';
    capacityMetricValue = `${dti.toFixed(1)}%`;
    isAffordable = dti <= 40; // 40% threshold for personal debt
    explanationText = isAffordable
      ? `Your monthly repayment represents ${dti.toFixed(1)}% of your gross salary. Lenders consider a DTI below 40% as standard and affordable.`
      : `Your monthly repayment consumes ${dti.toFixed(1)}% of your salary. Banks typically reject personal loan applications exceeding a 40% DTI.`;
  }

  const handleRunQuiz = (e) => {
    e.preventDefault();
    if (!quizIncomeSource || !quizPacra || !quizCollateral) return;

    let rec = '';
    if (quizIncomeSource === 'unemployed') {
      rec = 'Grants and CDF: Since you do not currently have a steady income stream, you should avoid taking out commercial debt. Focus on local CDF micro-grants or NGO bursaries that do not require repayments.';
    } else if (quizIncomeSource === 'farming') {
      rec = 'Agricultural Bank Financing: We recommend Zanaco Agribusiness or CEEC Agricultural loans. Having farm land lease/ownership records is crucial to access these specialized low-interest products.';
    } else if (quizIncomeSource === 'salary') {
      if (quizCollateral === 'yes') {
        rec = 'Commercial Bank Personal Loan: Since you have a steady salary and collateral, you are eligible for low-interest bank credit at Stanbic, Zanaco, or FNB. This will offer the best interest rates.';
      } else {
        rec = 'Payroll / Consumer Loan: You qualify for unsecured personal salary loans. Check Commercial Banks first, or look at registered payroll lenders like Izwe Loans or Bayport Financial Services.';
      }
    } else if (quizIncomeSource === 'business') {
      if (quizPacra === 'yes') {
        if (quizCollateral === 'yes') {
          rec = 'Commercial Bank Business Loan: Your registered business and collateral make you a prime candidate for commercial bank capital. You can apply at major banks (Stanbic/Zanaco).';
        } else {
          rec = 'Government CEEC Loan / Digital Business Credit: Since you are PACRA registered but lack collateral, CEEC business loans or digital lenders like Lupiya will be your best matches.';
        }
      } else {
        rec = 'Microfinance Group Lending or CDF: For unregistered/informal businesses, commercial banks will reject applications. We recommend group microfinance (FINCA) or Ward-level CDF grants.';
      }
    }

    setQuizRecommendation(rec);
    setQuizShowResult(true);
  };

  const resetQuiz = () => {
    setQuizIncomeSource('');
    setQuizPacra('');
    setQuizCollateral('');
    setQuizShowResult(false);
    setQuizRecommendation('');
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in px-4">
      <PageHeaderCard 
        title="Loans & Credit"
        description="Calculate loan affordability, check debt capacity, and connect directly with verified lending institutions in Zambia."
        icon={Calculator}
        bg="bg-blue-50"
        text="text-blue-600"
        badge="DEBT FINANCE"
        badgeColor="blue"
      />

      {/* Personal vs Business Toggle */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-sm mb-8">
        <button
          onClick={() => {
            setLoanCategory('personal');
            setSelectedRateType('commercial');
          }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${loanCategory === 'personal' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Personal Loans
        </button>
        <button
          onClick={() => {
            setLoanCategory('business');
            setSelectedRateType('commercial');
          }}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${loanCategory === 'business' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Business Loans
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Calculator inputs & Eligibility Quiz */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Debt Calculator */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" /> Debt Capacity Calculator
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Loan Amount Needed (ZMW)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">K</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Repayment Term (Months)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Clock className="w-4 h-4" /></span>
                  <input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Interest Rates selection */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-3">Lender Category & Expected Interest Rate</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LOAN_TYPES.filter(t => !(loanCategory === 'personal' && t.id === 'government')).map(type => (
                  <div
                    key={type.id}
                    onClick={() => {
                      setSelectedRateType(type.id);
                      if (type.id !== 'custom') setCustomRate(type.baseRate);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedRateType === type.id ? 'border-blue-500 bg-blue-50/35' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 text-sm">{type.name}</span>
                      {type.id !== 'custom' && <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{type.baseRate}%</span>}
                    </div>
                    <p className="text-xs text-gray-500 leading-normal">{type.description}</p>
                  </div>
                ))}
              </div>

              {selectedRateType === 'custom' && (
                <div className="mt-4 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-600 uppercase whitespace-nowrap">Custom Annual Rate (APR):</label>
                  <div className="relative flex-1">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Percent className="w-4 h-4" /></span>
                    <input
                      type="number"
                      step="0.5"
                      value={customRate}
                      onChange={(e) => setCustomRate(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 font-bold text-gray-800 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Income details depending on business/personal */}
            {loanCategory === 'business' ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 text-sm">Monthly Business Operations Cashflow</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Average Monthly Sales / Revenue</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">K</span>
                      <input
                        type="number"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-gray-800 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Average Monthly Expenses</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">K</span>
                      <input
                        type="number"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-gray-800 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 text-sm">Monthly Personal Finances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Gross Monthly Salary / Income</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">K</span>
                      <input
                        type="number"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-gray-800 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Monthly Expenses / Existing Loans</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">K</span>
                      <input
                        type="number"
                        value={personalLiabilities}
                        onChange={(e) => setPersonalLiabilities(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-gray-800 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Guided Assessment Quiz */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" /> Lender Suitability Guide
              </h2>
              {quizShowResult && (
                <button onClick={resetQuiz} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                  Reset Quiz
                </button>
              )}
            </div>

            {!quizShowResult ? (
              <form onSubmit={handleRunQuiz} className="space-y-4">
                <p className="text-xs text-gray-500 font-medium">Answer these 3 quick questions to check which lender best fits your circumstances in Zambia.</p>
                
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">1. What is your primary source of cash?</label>
                  <select 
                    required 
                    value={quizIncomeSource} 
                    onChange={e => setQuizIncomeSource(e.target.value)} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="">-- Choose Option --</option>
                    <option value="salary">Steady payroll salary / payslip</option>
                    <option value="business">Registered or informal business sales</option>
                    <option value="farming">Farming / Livestock sales</option>
                    <option value="unemployed">None/Seeking startup capital (unemployed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">2. Do you have registered PACRA business papers?</label>
                  <select 
                    required 
                    value={quizPacra} 
                    onChange={e => setQuizPacra(e.target.value)} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="">-- Choose Option --</option>
                    <option value="yes">Yes, active registration certificate</option>
                    <option value="no">No, informal/sole proprietor unregistered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">3. Do you have collateral (Land title, vehicle logbook, savings)?</label>
                  <select 
                    required 
                    value={quizCollateral} 
                    onChange={e => setQuizCollateral(e.target.value)} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="">-- Choose Option --</option>
                    <option value="yes">Yes, I have assets or secure collateral</option>
                    <option value="no">No, I do not have collateral</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs mt-2"
                >
                  Analyze Suitability
                </button>
              </form>
            ) : (
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl animate-fade-in space-y-3">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-blue-600" /> Recommended Pathway
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  {quizRecommendation}
                </p>
                <button
                  onClick={resetQuiz}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline block"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations Results & Verified Lenders list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Output Card */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-32 h-32 text-white" />
            </div>
            
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Estimated Monthly Payment (EMI)</h3>
            <div className="text-4xl font-black mb-6 flex items-baseline">
              {formatKwachaSimple(emi)}
              <span className="text-sm font-normal text-slate-400 ml-2">/ month</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                <span className="text-slate-400">Borrowed Principal</span>
                <span className="font-semibold">{formatKwachaSimple(loanAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                <span className="text-slate-400">Total Interest Accrued</span>
                <span className="text-red-400 font-semibold">+{formatKwachaSimple(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                <span className="text-slate-400">Annual Percentage Rate (APR)</span>
                <span className="text-blue-400 font-semibold">{currentRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-3 text-base">
                <span className="text-slate-300 font-bold">Total Cost of Loan</span>
                <span className="font-bold text-white text-lg">{formatKwachaSimple(totalRepayment)}</span>
              </div>
            </div>
          </div>

          {/* Affordability check card */}
          <div className={`rounded-3xl p-6 border ${isAffordable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4">
              {isAffordable ? (
                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
              )}
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isAffordable ? 'text-green-800' : 'text-red-800'}`}>
                  {isAffordable ? 'Affordable Credit Level' : 'High Risk Credit Level'}
                </h3>
                <p className={`text-sm leading-relaxed ${isAffordable ? 'text-green-700' : 'text-red-700'}`}>
                  {explanationText}
                </p>
                <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className={isAffordable ? 'text-green-800' : 'text-red-800'}>{capacityMetricLabel}:</span>
                  <span className={isAffordable ? 'text-green-700' : 'text-red-700'}>{capacityMetricValue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Zambian Lending Institutions */}
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" /> Genuine Lender Matchings
            </h3>

            {/* List matching lenders */}
            <div className="space-y-3">
              {(selectedRateType === 'custom'
                ? [...LENDERS.commercial, ...LENDERS.microfinance]
                : LENDERS[selectedRateType] || []
              ).map((lender, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">
                      {lender.badge}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm">{lender.name}</h4>
                    <p className="text-xs text-gray-500 leading-normal">{lender.desc}</p>
                  </div>
                  <a
                    href={lender.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-[11px] py-2 px-3 font-bold flex items-center gap-1.5 shrink-0 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    Apply Online <Globe className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      {/* Small Legal Footer Note */}
      <p className="text-center text-[11px] text-gray-400 mt-12">
        Simulated calculations for educational purposes only. Review our compliance declarations on the <Link to="/agreement" className="underline font-bold text-gray-500 hover:text-primary">Platform Governance & Disclaimers</Link> page.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Building2, TrendingUp, AlertTriangle, CheckCircle, Percent, Clock, DollarSign, Wallet } from 'lucide-react';
import { formatKwachaSimple } from '../lib/utils';

const LOAN_TYPES = [
  { id: 'commercial', name: 'Commercial Bank Loan', baseRate: 24.5, description: 'Standard business loans from major banks (ZANACO, Stanbic, Absa).' },
  { id: 'government', name: 'Government/CEEC Fund', baseRate: 12.0, description: 'Subsidized citizen economic empowerment funds.' },
  { id: 'microfinance', name: 'Microfinance (MFI)', baseRate: 48.0, description: 'Quick access but high-interest short-term loans.' },
  { id: 'custom', name: 'Custom Rate', baseRate: 20.0, description: 'Enter your own interest rate.' }
];

export default function LoansPortal() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(24); // months
  const [selectedType, setSelectedType] = useState('commercial');
  const [customRate, setCustomRate] = useState(24.5);
  
  const [monthlyRevenue, setMonthlyRevenue] = useState(20000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(12000);

  const currentRate = selectedType === 'custom' ? customRate : LOAN_TYPES.find(t => t.id === selectedType)?.baseRate || 24.5;
  
  // Amortization Math (Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1))
  const monthlyRate = (currentRate / 100) / 12;
  const emi = loanAmount > 0 && currentRate > 0 && loanTerm > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
    : (loanAmount / loanTerm);
    
  const totalRepayment = emi * loanTerm;
  const totalInterest = totalRepayment - loanAmount;
  
  // Capacity Math
  const netIncome = monthlyRevenue - monthlyExpenses;
  const dscr = netIncome / (emi || 1); // Debt Service Coverage Ratio
  const isAffordable = dscr >= 1.25; // Standard banking DSCR requirement

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-fade-in">
      <Link to="/engine/finance" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Finance & Funding
      </Link>

      <div className="mb-10 flex items-start gap-5">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Business Loans & Credit</h1>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            Calculate your debt capacity, understand the real cost of borrowing in Zambia, and match with the right lenders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Calculator Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" /> Debt Capacity Calculator
            </h2>
            
            <div className="space-y-6">
              {/* Loan Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount (ZMW)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">K</span>
                    <input 
                      type="number" 
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Term (Months)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Clock className="w-4 h-4" /></span>
                    <input 
                      type="number" 
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Interest Rate Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Lender Type & Interest Rate (APR)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LOAN_TYPES.map(type => (
                    <div 
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        if (type.id !== 'custom') setCustomRate(type.baseRate);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedType === type.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800 text-sm">{type.name}</span>
                        {type.id !== 'custom' && <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{type.baseRate}%</span>}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{type.description}</p>
                    </div>
                  ))}
                </div>
                
                {selectedType === 'custom' && (
                  <div className="mt-4 flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Custom Interest Rate:</label>
                    <div className="relative flex-1">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Percent className="w-4 h-4" /></span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={customRate}
                        onChange={(e) => setCustomRate(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 font-bold text-gray-800 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Business Cashflow */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Current Monthly Cashflow</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Avg. Monthly Revenue</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">K</span>
                      <input 
                        type="number" 
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-800 focus:outline-none focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Avg. Monthly Expenses</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">K</span>
                      <input 
                        type="number" 
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-800 focus:outline-none focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Results & Analytics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-32 h-32 text-white" />
            </div>
            
            <h3 className="text-slate-400 font-medium mb-1 relative z-10">Estimated Monthly Repayment (EMI)</h3>
            <div className="text-4xl font-black text-white mb-6 relative z-10">
              {formatKwachaSimple(emi)}
              <span className="text-base font-normal text-slate-400 ml-2">/ month</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Principal Amount</span>
                <span className="text-white font-semibold">{formatKwachaSimple(loanAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400 text-sm">Total Interest Cost</span>
                <span className="text-red-400 font-semibold">+{formatKwachaSimple(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400 text-sm">Total Repayment</span>
                <span className="text-white font-bold">{formatKwachaSimple(totalRepayment)}</span>
              </div>
            </div>
          </div>

          {/* Affordability Verdict */}
          <div className={`rounded-3xl p-6 border ${isAffordable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4">
              {isAffordable ? (
                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
              )}
              <div>
                <h3 className={`font-bold text-lg mb-1 ${isAffordable ? 'text-green-800' : 'text-red-800'}`}>
                  {isAffordable ? 'Affordable Loan' : 'High Risk Loan'}
                </h3>
                <p className={`text-sm ${isAffordable ? 'text-green-700' : 'text-red-700'}`}>
                  {isAffordable 
                    ? `Your net income of ${formatKwachaSimple(netIncome)} comfortably covers the ${formatKwachaSimple(emi)} EMI. Banks will view this favorably.`
                    : `Your net income of ${formatKwachaSimple(netIncome)} is too close to (or less than) the ${formatKwachaSimple(emi)} EMI. Banks may reject this application.`
                  }
                </p>
                <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-sm font-semibold">
                  <span className={isAffordable ? 'text-green-800' : 'text-red-800'}>Debt Service Ratio (DSCR):</span>
                  <span className={isAffordable ? 'text-green-700' : 'text-red-700'}>{dscr.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

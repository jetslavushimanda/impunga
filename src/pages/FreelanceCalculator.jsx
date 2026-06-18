import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft, TrendingUp, Clock, Wallet, DollarSign } from 'lucide-react';
import { formatKwacha } from '../lib/utils';

export default function FreelanceCalculator() {
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState({
    desiredMonthlyIncome: '',
    monthlyExpenses: '',
    weeklyHours: '40',
    billablePercentage: '60', // Percentage of hours actually spent working on paid projects vs admin
    vacationWeeks: '4'
  });

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const desiredIncome = parseFloat(inputs.desiredMonthlyIncome) || 0;
  const expenses = parseFloat(inputs.monthlyExpenses) || 0;
  const weeklyHours = parseFloat(inputs.weeklyHours) || 0;
  const billablePct = parseFloat(inputs.billablePercentage) || 0;
  const vacationWeeks = parseFloat(inputs.vacationWeeks) || 0;

  const workingWeeksPerYear = 52 - vacationWeeks;
  const yearlyTargetIncome = desiredIncome * 12;
  const yearlyExpenses = expenses * 12;
  
  // Total Revenue Needed
  const totalYearlyRevenueNeeded = yearlyTargetIncome + yearlyExpenses;
  
  // Billable Hours
  const totalYearlyHours = weeklyHours * workingWeeksPerYear;
  const totalBillableHours = totalYearlyHours * (billablePct / 100);
  
  // Rates
  const hourlyRate = totalBillableHours > 0 ? totalYearlyRevenueNeeded / totalBillableHours : 0;
  const dailyRate = hourlyRate * 8; // Assuming 8 hour work day standard
  const weeklyRate = hourlyRate * (weeklyHours * (billablePct / 100));

  const inpClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-white/50 backdrop-blur-sm transition-all";
  const lblClass = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Piece-Work & Gigs Rate Calculator</h1>
          <p className="text-gray-500 font-medium text-lg">Calculate exactly how much you need to charge for your casual labor or consulting services to hit your income goals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Income Goal */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" /> Income & Expenses
            </h2>
            <div className="space-y-4">
              <div>
                <label className={lblClass}>Desired Monthly Income (Take-Home)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">K</span>
                  <input type="number" min="0" className={`${inpClass} pl-10`} placeholder="0.00" value={inputs.desiredMonthlyIncome} onChange={e => handleInputChange('desiredMonthlyIncome', e.target.value)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">How much profit you want to make for yourself every month.</p>
              </div>
              
              <div>
                <label className={lblClass}>Estimated Monthly Business Expenses</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">K</span>
                  <input type="number" min="0" className={`${inpClass} pl-10`} placeholder="0.00" value={inputs.monthlyExpenses} onChange={e => handleInputChange('monthlyExpenses', e.target.value)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Internet, phone, software, transport, tools, etc.</p>
              </div>
            </div>
          </div>

          {/* Time & Capacity */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Time & Capacity
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lblClass}>Total Hours / Week</label>
                  <input type="number" min="1" className={inpClass} value={inputs.weeklyHours} onChange={e => handleInputChange('weeklyHours', e.target.value)} />
                </div>
                <div>
                  <label className={lblClass}>Vacation Weeks / Year</label>
                  <input type="number" min="0" max="52" className={inpClass} value={inputs.vacationWeeks} onChange={e => handleInputChange('vacationWeeks', e.target.value)} />
                </div>
              </div>
              
              <div>
                <label className={lblClass}>Billable Percentage (%)</label>
                <input type="range" min="10" max="100" step="5" className="w-full accent-orange-500" value={inputs.billablePercentage} onChange={e => handleInputChange('billablePercentage', e.target.value)} />
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-orange-600">{inputs.billablePercentage}% Billable</span>
                  <span className="text-xs font-semibold text-gray-400">{100 - inputs.billablePercentage}% Admin/Marketing</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  You can't charge clients for all the hours you work. You need time for admin, finding clients, and breaks. 60% is a safe baseline.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Results Section */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl sticky top-6 text-white overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-6 h-6 text-orange-400" /> Minimum Rates
            </h2>

            <div className="space-y-6 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Hourly Rate</p>
                <p className="text-4xl font-black text-orange-400">
                  {hourlyRate > 0 ? formatKwacha(hourlyRate) : 'K0.00'}
                </p>
                <p className="text-xs text-gray-300 mt-2">Minimum charge for 1 hour of your time.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Daily Rate</p>
                  <p className="text-xl font-bold text-white">
                    {dailyRate > 0 ? formatKwacha(dailyRate) : 'K0.00'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">For an 8-hour day</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Weekly Rate</p>
                  <p className="text-xl font-bold text-white">
                    {weeklyRate > 0 ? formatKwacha(weeklyRate) : 'K0.00'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">For your billable hours</p>
                </div>
              </div>

              {hourlyRate > 0 && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 mt-4">
                  <p className="text-sm font-medium text-orange-50 leading-relaxed">
                    <span className="font-bold">Pro Tip:</span> Never charge exactly your minimum hourly rate for a project. Add a 20-30% buffer for unexpected delays or client revisions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

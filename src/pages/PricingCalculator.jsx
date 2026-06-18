import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Plus, Trash2, Save, TrendingUp, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFirestore } from '../hooks/useFirestore';
import PageHeaderCard from '../components/shared/PageHeaderCard';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import { formatKwacha, calculateRecommendedPrice } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';
import AIResponse from '../components/shared/AIResponse';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const MARGIN_PRESETS = [
  { label: 'Minimum 10%', value: 10, desc: 'Just covering costs, very tight' },
  { label: 'Standard 30%', value: 30, desc: 'Healthy profit, industry average' },
  { label: 'Premium 50%', value: 50, desc: 'High value or specialized product' },
];

const COST_TYPES = ['Raw Material', 'Labour', 'Transport', 'Packaging', 'Electricity', 'Rent', 'Airtime', 'Other'];

export default function PricingCalculator() {
  const [productName, setProductName] = useState('');
  const [costs, setCosts] = useState([{ name: '', amount: '', type: 'Raw Material' }]);
  const [batchQty, setBatchQty] = useState('');
  const [margin, setMargin] = useState(30);
  const [customMargin, setCustomMargin] = useState('');
  const [competitorPrice, setCompetitorPrice] = useState('');
  const [result, setResult] = useState(null);
  const [marketTrends, setMarketTrends] = useState('');
  const [trendsLoading, setTrendsLoading] = useState(false);
  const { addDocument } = useFirestore();
  const { analyzePricingTrend } = useGemini();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();

  function addCost() {
    setCosts([...costs, { name: '', amount: '', type: 'Raw Material' }]);
  }

  function removeCost(i) {
    setCosts(costs.filter((_, idx) => idx !== i));
  }

  function updateCost(i, field, value) {
    const updated = [...costs];
    updated[i] = { ...updated[i], [field]: value };
    setCosts(updated);
  }

  const totalBatchCost = costs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const qty = parseFloat(batchQty) || 1;
  const costPerUnit = totalBatchCost / qty;
  const activeMargin = customMargin ? parseFloat(customMargin) : margin;

  function calculate() {
    const recommendedPrice = calculateRecommendedPrice(costPerUnit, activeMargin);
    const profitPerUnit = recommendedPrice - costPerUnit;
    const breakEvenUnits = Math.ceil(totalBatchCost / profitPerUnit);

    const projections = [10, 20, 50, 100, 200].map(units => ({
      units,
      revenue: units * recommendedPrice,
      cost: units * costPerUnit,
      profit: units * profitPerUnit,
    }));

    let competitorComparison = null;
    if (competitorPrice) {
      const compPrice = parseFloat(competitorPrice);
      if (recommendedPrice < compPrice * 0.9) competitorComparison = { status: 'cheaper', advice: 'Your price is significantly lower. Consider raising it slightly to improve profit without losing customers.' };
      else if (recommendedPrice > compPrice * 1.1) competitorComparison = { status: 'more expensive', advice: 'Your price is above the market. Make sure your quality justifies the premium, or reduce costs.' };
      else competitorComparison = { status: 'competitive', advice: 'Your price is in line with competitors. This is a healthy position.' };
    }

    setResult({ costPerUnit, recommendedPrice, profitPerUnit, margin: activeMargin, breakEvenUnits, projections, competitorComparison });
  }

  async function handleSave() {
    if (!result) return;
    try {
      await addDocument('pricingCalculations', {
        productName,
        costs,
        recommendedPrice: result.recommendedPrice,
        profitMargin: result.margin,
        costPerUnit: result.costPerUnit,
      });
      show('Calculation saved!');
    } catch {
      show('Save failed. Try again.', 'error');
    }
  }

  async function handleAnalyzeMarketTrends() {
    if (!result) return;
    setTrendsLoading(true);
    try {
      const sector = userProfile?.sector || 'Retail';
      const province = userProfile?.province || 'Lusaka';
      const analysis = await analyzePricingTrend(result.costPerUnit, result.recommendedPrice, sector, province);
      setMarketTrends(analysis);
    } catch {
      setMarketTrends({ verdict: 'Error', advice: 'Failed to load pricing trends. Please try again.' });
    } finally {
      setTrendsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeaderCard 
        title="Pricing Calculator"
        description="Price correctly and actually make profit"
        icon={Calculator}
        bg="bg-green-50"
        text="text-green-600"
        badge="FINANCIALS ZMW"
        badgeColor="orange"
      />

      {/* Form */}
      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-6 relative z-10">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Product or Service Name *</label>
          <input value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm" placeholder="e.g. Homemade Soap, Tailoring Service" />
        </div>

        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-0">Cost Items</label>
            <button onClick={addCost} className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Add Cost
            </button>
          </div>
          <div className="space-y-3">
            {costs.map((cost, i) => (
              <div key={i} className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-gray-50/50 p-2 rounded-2xl">
                <input value={cost.name} onChange={e => updateCost(i, 'name', e.target.value)} className="flex-1 min-w-[120px] bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm" placeholder="Cost name" />
                <input value={cost.amount} onChange={e => updateCost(i, 'amount', e.target.value)} className="w-28 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm" type="number" placeholder="K amount" min="0" />
                <select value={cost.type} onChange={e => updateCost(i, 'type', e.target.value)} className="w-36 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm appearance-none cursor-pointer">
                  {COST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {costs.length > 1 && (
                  <button onClick={() => removeCost(i)} className="p-2.5 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 border border-purple-100/50 rounded-2xl flex justify-between items-center shadow-sm">
            <p className="text-sm font-semibold text-gray-600">Total Batch Cost:</p>
            <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{formatKwacha(totalBatchCost)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">How many units per batch?</label>
            <input value={batchQty} onChange={e => setBatchQty(e.target.value)} type="number" className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm" placeholder="e.g. 10" min="1" />
            {costPerUnit > 0 && <p className="text-sm font-medium text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg inline-block border border-gray-100">Cost per unit: <b className="text-gray-800">{formatKwacha(costPerUnit)}</b></p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Competitor price (optional)</label>
            <input value={competitorPrice} onChange={e => setCompetitorPrice(e.target.value)} type="number" className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm" placeholder="K amount" min="0" />
          </div>
        </div>

        <div className="mb-8 relative z-10">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Profit Margin</label>
          <div className="flex flex-wrap gap-3 mb-4">
            {MARGIN_PRESETS.map(({ label, value, desc }) => (
              <button
                key={value}
                onClick={() => { setMargin(value); setCustomMargin(''); }}
                className={`px-4 py-3 rounded-xl border text-left transition-all flex-1 min-w-[140px] shadow-sm ${!customMargin && margin === value ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-transparent shadow-md shadow-purple-500/20 scale-[1.02]' : 'bg-white/60 border-gray-200 text-gray-700 hover:border-purple-300'}`}
              >
                <p className="font-extrabold text-sm mb-0.5">{label}</p>
                <p className={`text-xs font-medium ${!customMargin && margin === value ? 'text-purple-100' : 'text-gray-500'}`}>{desc}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              value={customMargin}
              onChange={e => setCustomMargin(e.target.value)}
              type="number"
              className="w-32 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm text-center font-bold"
              placeholder="Custom %"
              min="1"
              max="99"
            />
            {customMargin && <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">Custom Margin Active</span>}
          </div>
        </div>

        <button onClick={calculate} disabled={totalBatchCost === 0} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 active:scale-[0.98] text-lg relative z-10">
          Calculate My Price
        </button>
      </div>

      {/* Results */}
      {/* Results */}
      {result && (
        <div className="space-y-6 animate-slide-up pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Cost per Unit', value: formatKwacha(result.costPerUnit) },
              { label: 'Recommended Price', value: formatKwacha(result.recommendedPrice), highlight: true },
              { label: 'Profit per Unit', value: formatKwacha(result.profitPerUnit) },
              { label: 'Profit Margin', value: `${result.margin}%` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-2xl border border-white/60 p-5 text-center shadow-sm overflow-hidden relative ${highlight ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 transform scale-105 z-10' : 'bg-white/85 backdrop-blur-sm text-gray-800'}`}>
                {highlight && <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />}
                <p className={`text-2xl font-extrabold relative z-10 ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                <p className={`text-xs font-bold mt-1.5 uppercase tracking-wider relative z-10 ${highlight ? 'text-green-100' : 'text-gray-400'}`}>{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <p className="text-base text-gray-600 mb-3 font-medium">Break-even: sell at least <b className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-lg">{result.breakEvenUnits} units/batch</b> to cover all costs.</p>
            {result.competitorComparison && (
              <div className={`p-4 rounded-2xl text-sm font-medium border ${result.competitorComparison.status === 'competitive' ? 'bg-green-50/80 border-green-200 text-green-800' : 'bg-amber-50/80 border-amber-200 text-amber-800'}`}>
                <b className="uppercase tracking-wider mr-2">vs Competitors:</b> Your price is {result.competitorComparison.status}. {result.competitorComparison.advice}
              </div>
            )}
          </div>

          <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <h3 className="font-extrabold text-gray-800 mb-6 text-lg">Monthly Profit Projections</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.projections}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="units" label={{ value: 'Units Sold', position: 'insideBottom', offset: -10 }} tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `K${(v/1000).toFixed(0)}k`} tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => formatKwacha(v)} cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="revenue" fill="#6366F1" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10B981" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Pricing Insight */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-indigo-100/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 gap-4">
              <div>
                <h3 className="font-extrabold text-indigo-900 text-lg flex items-center gap-2">
                  Predictive Pricing Insight
                </h3>
                <p className="text-sm font-medium text-indigo-600/70 mt-1">AI compares your price to Zambian sector averages</p>
              </div>
              <button
                onClick={handleAnalyzeMarketTrends}
                disabled={trendsLoading}
                className="flex items-center justify-center gap-2 bg-white text-indigo-700 text-sm font-bold px-5 py-3 rounded-xl hover:bg-indigo-50 border border-indigo-100 shadow-sm transition-colors shrink-0 active:scale-95"
              >
                {trendsLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI Trend</>
                )}
              </button>
            </div>
            
            {marketTrends ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 animate-fade-in border border-indigo-100/50 shadow-sm relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    marketTrends.verdict === 'Underpriced' ? 'bg-red-100 text-red-700' :
                    marketTrends.verdict === 'Overpriced' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {marketTrends.verdict || 'Analysis'}
                  </span>
                  {marketTrends.marketAverage && (
                    <span className="text-sm text-gray-600 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                      Market Avg: {marketTrends.marketAverage}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 font-medium leading-relaxed mt-2">{marketTrends.advice}</p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center border border-indigo-100/30 relative z-10">
                <TrendingUp className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
                <p className="text-sm text-indigo-700 font-semibold max-w-sm mx-auto">Click "AI Trend" to check if you are underpricing for the {userProfile?.province || 'Zambian'} market.</p>
              </div>
            )}
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-2xl transition-colors shadow-sm active:scale-95 mx-auto">
            <Save className="w-5 h-5" /> Save Calculation
          </button>
        </div>
      )}
    </div>
  );
}

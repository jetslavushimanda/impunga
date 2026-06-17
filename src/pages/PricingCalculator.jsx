import { useState } from 'react';
import { Calculator, Plus, Trash2, Save, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFirestore } from '../hooks/useFirestore';
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
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pricing Calculator</h1>
          <p className="text-gray-500 text-sm">Price correctly and actually make profit</p>
        </div>
      </div>

      {/* Form */}
      <div className="card mb-4">
        <div className="mb-4">
          <label className="label">Product or Service Name *</label>
          <input value={productName} onChange={e => setProductName(e.target.value)} className="input-field" placeholder="e.g. Homemade Soap, Tailoring Service" />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Cost Items</label>
            <button onClick={addCost} className="text-primary text-sm font-medium flex items-center gap-1 hover:text-primary-dark">
              <Plus className="w-4 h-4" /> Add Cost
            </button>
          </div>
          <div className="space-y-2">
            {costs.map((cost, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={cost.name} onChange={e => updateCost(i, 'name', e.target.value)} className="input-field flex-1" placeholder="Cost name" />
                <input value={cost.amount} onChange={e => updateCost(i, 'amount', e.target.value)} className="input-field w-28" type="number" placeholder="K amount" min="0" />
                <select value={cost.type} onChange={e => updateCost(i, 'type', e.target.value)} className="select-field w-36">
                  {COST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {costs.length > 1 && (
                  <button onClick={() => removeCost(i)} className="p-2 text-red-400 hover:text-red-600 mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 p-3 bg-surface-blue rounded-lg">
            <p className="text-sm font-medium text-gray-700">Total Batch Cost: <span className="text-primary font-bold">{formatKwacha(totalBatchCost)}</span></p>
          </div>
        </div>

        <div className="mb-4">
          <label className="label">How many units per batch?</label>
          <input value={batchQty} onChange={e => setBatchQty(e.target.value)} type="number" className="input-field w-40" placeholder="e.g. 10" min="1" />
          {costPerUnit > 0 && <p className="text-sm text-gray-500 mt-1">Cost per unit: <b className="text-gray-800">{formatKwacha(costPerUnit)}</b></p>}
        </div>

        <div className="mb-4">
          <label className="label">Profit Margin</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {MARGIN_PRESETS.map(({ label, value, desc }) => (
              <button
                key={value}
                onClick={() => { setMargin(value); setCustomMargin(''); }}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${!customMargin && margin === value ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'}`}
              >
                <p className="font-semibold">{label}</p>
                <p className="text-xs opacity-70">{desc}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={customMargin}
              onChange={e => setCustomMargin(e.target.value)}
              type="number"
              className="input-field w-24"
              placeholder="Custom %"
              min="1"
              max="99"
            />
            {customMargin && <span className="text-sm text-gray-500">custom margin</span>}
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Competitor price (optional)</label>
          <input value={competitorPrice} onChange={e => setCompetitorPrice(e.target.value)} type="number" className="input-field w-40" placeholder="K amount" min="0" />
        </div>

        <button onClick={calculate} disabled={totalBatchCost === 0} className="btn-green w-full">
          Calculate My Price
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Cost per Unit', value: formatKwacha(result.costPerUnit) },
              { label: 'Recommended Price', value: formatKwacha(result.recommendedPrice), highlight: true },
              { label: 'Profit per Unit', value: formatKwacha(result.profitPerUnit) },
              { label: 'Profit Margin', value: `${result.margin}%` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`card text-center ${highlight ? 'bg-primary text-white' : ''}`}>
                <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-primary'}`}>{value}</p>
                <p className={`text-xs mt-1 ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>{label}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-2">Break-even: sell at least <b className="text-primary">{result.breakEvenUnits} units/batch</b> to cover all costs.</p>
            {result.competitorComparison && (
              <div className={`p-3 rounded-lg text-sm mt-2 ${result.competitorComparison.status === 'competitive' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                <b>vs Competitors:</b> Your price is {result.competitorComparison.status}. {result.competitorComparison.advice}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3">Monthly Profit Projections</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={result.projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="units" label={{ value: 'Units Sold', position: 'insideBottom', offset: -2 }} />
                <YAxis tickFormatter={v => `K${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatKwacha(v)} />
                <Legend />
                <Bar dataKey="revenue" fill="#2E86C1" name="Revenue" />
                <Bar dataKey="profit" fill="#1E8449" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Pricing Insight */}
          <div className="card border-l-4 border-l-indigo-400">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800">Predictive Pricing Insight</h3>
                <p className="text-xs text-gray-400 mt-0.5">AI compares your price to Zambian sector averages</p>
              </div>
              <button
                onClick={handleAnalyzeMarketTrends}
                disabled={trendsLoading}
                className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
              >
                {trendsLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI Trend</>
                )}
              </button>
            </div>
            
            {marketTrends ? (
              <div className="bg-indigo-50/50 rounded-xl p-4 animate-fade-in border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    marketTrends.verdict === 'Underpriced' ? 'bg-red-100 text-red-700' :
                    marketTrends.verdict === 'Overpriced' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {marketTrends.verdict || 'Analysis'}
                  </span>
                  {marketTrends.marketAverage && (
                    <span className="text-xs text-gray-500 font-medium">
                      Market Avg: {marketTrends.marketAverage}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">{marketTrends.advice}</p>
              </div>
            ) : (
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <TrendingUp className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                <p className="text-sm text-indigo-600 font-medium">Click "AI Trend" to check if you are underpricing for the {userProfile?.province || 'Zambian'} market.</p>
              </div>
            )}
          </div>

          <button onClick={handleSave} className="btn-primary gap-2">
            <Save className="w-4 h-4" /> Save Calculation
          </button>
        </div>
      )}
    </div>
  );
}

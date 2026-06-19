import { useState } from 'react';
import { ShoppingCart, TrendingUp, MapPin, Wheat, Leaf, Package, Zap, Smartphone, HardHat, Bot, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MARKET_PRICES, PROVINCES } from '../data/marketPrices';
import { useAI } from '../hooks/useAI';
import useAuthStore from '../store/authStore';
import AIResponse from '../components/shared/AIResponse';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const CATEGORY_ICONS = {
  'Grains & Staples': Wheat,
  'Vegetables & Fruits': Leaf,
  'Meat & Protein': Package,
  'Fuel & Transport': Zap,
  'Mobile & Airtime': Smartphone,
  'Building Materials': HardHat,
};

const TABS = [
  { id: 'prices', label: '📋 Current Prices' },
  { id: 'forecast', label: '📈 Market Forecast' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const isAbove = val > 100;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-bold text-gray-700">{label}</p>
      <p className={`font-bold ${isAbove ? 'text-red-500' : 'text-green-600'}`}>
        {isAbove ? '▲' : '▼'} Price Index: {val}
      </p>
      {payload[0]?.payload?.label && <p className="text-gray-500">{payload[0].payload.label}</p>}
    </div>
  );
}

export default function MarketPrices() {
  const [tab, setTab] = useState('prices');
  const [province, setProvince] = useState('Lusaka');
  const [category, setCategory] = useState('All');
  const [forecastCategory, setForecastCategory] = useState('Grains & Staples');
  const [forecastProvince, setForecastProvince] = useState('Lusaka');
  const [forecast, setForecast] = useState(null);
  const { generateMarketForecast, loading } = useAI();
  const { userProfile } = useAuthStore();

  const categories = ['All', ...MARKET_PRICES.map(c => c.category)];
  const filtered = category === 'All' ? MARKET_PRICES : MARKET_PRICES.filter(c => c.category === category);

  async function handleForecast() {
    const priceData = MARKET_PRICES.find(c => c.category === forecastCategory);
    try {
      const result = await generateMarketForecast(forecastCategory, forecastProvince, priceData);
      setForecast(result);
    } catch { /* error shown by hook */ }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-sm font-semibold py-2 px-3 rounded-xl transition-all ${
              tab === t.id ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Current Prices ── */}
      {tab === 'prices' && (
        <>
          <div className="card mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Your Province
                </label>
                <select value={province} onChange={e => setProvince(e.target.value)} className="select-field">
                  {PROVINCES.sort().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="select-field">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
            <span><b>Note:</b> These are typical market price ranges for <b>{province} Province</b>. Prices vary by vendor, season and location.</span>
          </div>

          <div className="space-y-4">
            {filtered.map(cat => {
              const Icon = CATEGORY_ICONS[cat.category] || Package;
              return (
                <div key={cat.category} className="card">
                  <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" /> {cat.category}
                  </h2>
                  <div className="divide-y divide-gray-50">
                    {cat.items.map(item => {
                      const [min, max] = item.prices[province] || [0, 0];
                      const mid = Math.round((min + max) / 2);
                      return (
                        <div key={item.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">per {item.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">K{min} – K{max}</p>
                            <p className="text-xs text-gray-400">avg K{mid}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card mt-4 bg-surface-blue border border-primary/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-primary text-sm">Use This for Your Business</p>
                <p className="text-gray-600 text-sm mt-1">Know your input costs then go to the <b>Pricing Calculator</b> to set the right selling price and make real profit.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: Market Forecast ── */}
      {tab === 'forecast' && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" /> AI Market Trend Predictor
            </h2>
            <p className="text-sm text-gray-500 mb-4">Select a product category and province. AI will analyse Zambian seasonal patterns and generate a price forecast with monthly index chart.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label flex items-center gap-1"><MapPin className="w-4 h-4" /> Province</label>
                <select value={forecastProvince} onChange={e => setForecastProvince(e.target.value)} className="select-field">
                  {PROVINCES.sort().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Product Category</label>
                <select value={forecastCategory} onChange={e => { setForecastCategory(e.target.value); setForecast(null); }} className="select-field">
                  {MARKET_PRICES.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={handleForecast}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {loading ? <><LoadingSpinner size="sm" /> Generating Forecast...</> : <><RefreshCw className="w-4 h-4" /> Generate AI Forecast</>}
            </button>
          </div>

          {/* Placeholder when no forecast */}
          {!forecast && !loading && (
            <div className="bg-indigo-50 rounded-2xl p-8 text-center">
              <Calendar className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
              <p className="font-bold text-indigo-700 mb-1">No Forecast Generated Yet</p>
              <p className="text-sm text-indigo-500">Select your province and category above, then click "Generate AI Forecast" to see seasonal price predictions for Zambia.</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bot className="w-7 h-7 text-indigo-500 animate-pulse" />
              </div>
              <p className="font-semibold text-gray-700">Analysing seasonal patterns...</p>
              <p className="text-xs text-gray-400 mt-1">AI is reviewing Zambian agricultural cycles and market data</p>
            </div>
          )}

          {/* Forecast Results */}
          {forecast && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Headline */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-indigo-200" />
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{forecastCategory} · {forecastProvince}</span>
                </div>
                <p className="text-lg font-bold mb-3">{forecast.headline}</p>
                <p className="text-indigo-100 text-sm leading-relaxed">{forecast.narrative}</p>
                <div className="flex gap-4 mt-3 flex-wrap">
                  {forecast.peakMonths?.length > 0 && (
                    <div>
                      <p className="text-xs text-indigo-300 font-semibold">Peak Months</p>
                      <p className="text-sm font-bold text-white">{forecast.peakMonths.join(', ')}</p>
                    </div>
                  )}
                  {forecast.lowMonths?.length > 0 && (
                    <div>
                      <p className="text-xs text-indigo-300 font-semibold">Low Price Months</p>
                      <p className="text-sm font-bold text-white">{forecast.lowMonths.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Index Chart */}
              {forecast.monthlyIndex?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-1">Seasonal Price Index</h3>
                  <p className="text-xs text-gray-400 mb-4">100 = annual average price. Above 100 = more expensive than average.</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={forecast.monthlyIndex} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={v => `${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: 'Average', position: 'right', fontSize: 10, fill: '#9ca3af' }} />
                      <Area type="monotone" dataKey="index" stroke="#6366f1" strokeWidth={2.5} fill="url(#priceGradient)" dot={{ r: 3, fill: '#6366f1' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Business Advice */}
              {forecast.businessAdvice && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-sm mb-1">Business Advice for {forecastProvince}</p>
                    <p className="text-sm text-green-700">{forecast.businessAdvice}</p>
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {forecast.riskFactors?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="font-bold text-yellow-800 text-sm">Risk Factors to Watch</p>
                  </div>
                  <ul className="space-y-1">
                    {forecast.riskFactors.map((risk, i) => (
                      <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                        <span className="text-yellow-400 font-bold shrink-0">•</span> {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

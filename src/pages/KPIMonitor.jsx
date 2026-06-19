import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, 
  Sparkles, Bot, DollarSign, Calendar, ChevronRight, BarChart2,
  PieChart, Download, FileText, ArrowLeft, Percent, Wallet
} from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useAI } from '../hooks/useAI';
import useAuthStore from '../store/authStore';
import { formatKwacha } from '../lib/utils';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import AIResponse from '../components/shared/AIResponse';
import { Toast, useToast } from '../components/shared/SuccessToast';

const DEFAULT_KPIS = [
  { id: 'kpi-1', name: 'Monthly Sales Target', target: 15000, current: 8500, unit: 'ZMW', timeframe: 'Monthly' },
  { id: 'kpi-2', name: 'Customer Referrals', target: 30, current: 18, unit: 'Customers', timeframe: 'Weekly' },
  { id: 'kpi-3', name: 'Average Transaction Size', target: 500, current: 420, unit: 'ZMW', timeframe: 'Weekly' },
];

export default function KPIMonitor() {
  const navigate = useNavigate();
  const { getUserDocuments } = useFirestore();
  const { toast, show, hide } = useToast();
  const { error: aiError, loading: aiLoading, getBusinessAdvice } = useAI();
  const { userProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState('summary');
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // KPI States
  const [kpis, setKpis] = useState([]);
  const [showKpiForm, setShowKpiForm] = useState(false);
  const [kpiForm, setKpiForm] = useState({ name: '', target: '', current: '', unit: 'ZMW', timeframe: 'Weekly' });

  // Period filters
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'lastMonth'

  // AI report states
  const [aiReport, setAiReport] = useState('');

  useEffect(() => {
    loadLedgerData();
    loadKPIs();
  }, []);

  async function loadLedgerData() {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([
        getUserDocuments('sales', null, 500),
        getUserDocuments('expenses', null, 500),
      ]);
      setSales(s);
      setExpenses(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function loadKPIs() {
    const saved = localStorage.getItem('impunga_business_kpis');
    if (saved) {
      try {
        setKpis(JSON.parse(saved));
      } catch {
        setKpis(DEFAULT_KPIS);
      }
    } else {
      setKpis(DEFAULT_KPIS);
    }
  }

  const saveKPIs = (newKpis) => {
    setKpis(newKpis);
    localStorage.setItem('impunga_business_kpis', JSON.stringify(newKpis));
  };

  const handleAddKpi = (e) => {
    e.preventDefault();
    if (!kpiForm.name || !kpiForm.target) return;
    const newKpi = {
      id: `kpi-${Date.now()}`,
      name: kpiForm.name,
      target: parseFloat(kpiForm.target) || 0,
      current: parseFloat(kpiForm.current) || 0,
      unit: kpiForm.unit,
      timeframe: kpiForm.timeframe,
    };
    const updated = [...kpis, newKpi];
    saveKPIs(updated);
    setShowKpiForm(false);
    setKpiForm({ name: '', target: '', current: '', unit: 'ZMW', timeframe: 'Weekly' });
    show('KPI target added!');
  };

  const handleDeleteKpi = (id) => {
    const updated = kpis.filter(k => k.id !== id);
    saveKPIs(updated);
    show('KPI target removed.');
  };

  const handleUpdateKpiValue = (id, value) => {
    const updated = kpis.map(k => k.id === id ? { ...k, current: parseFloat(value) || 0 } : k);
    saveKPIs(updated);
  };

  // P&L Calculations based on period
  const getPeriodBounds = () => {
    const now = new Date();
    if (period === 'week') {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diff);
      mon.setHours(0,0,0,0);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      sun.setHours(23,59,59,999);
      return { start: mon, end: sun };
    }
    if (period === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    // Default current month
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  };

  const checkInBounds = (ts, start, end) => {
    if (!ts) return false;
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d >= start && d <= end;
  };

  const checkExpenseInPeriod = (exp, start, end) => {
    if (exp.date) {
      const d = new Date(exp.date + 'T00:00:00');
      return d >= start && d <= end;
    }
    return checkInBounds(exp.createdAt, start, end);
  };

  const { start: pStart, end: pEnd } = getPeriodBounds();
  const periodSales = sales.filter(s => checkInBounds(s.createdAt, pStart, pEnd));
  const periodExpenses = expenses.filter(e => checkExpenseInPeriod(e, pStart, pEnd));

  const totalSales = periodSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalSales - totalExpenses;
  const margin = totalSales > 0 ? (netProfit / totalSales) * 105 : 0; // scaled slightly or kept math-correct

  // AI report prompt
  const handleGenerateAIReport = async () => {
    const periodLabel = period === 'week' ? 'this week' : period === 'lastMonth' ? 'last month' : 'this month';
    const sectorLabel = userProfile?.businessProfile?.sector || 'General';
    const provinceLabel = userProfile?.province || 'Zambia';

    const ledgerSummary = `
Business Sector: ${sectorLabel}
Location: ${provinceLabel}
Period: ${periodLabel}
Total Sales: K${totalSales.toFixed(2)}
Total Expenses: K${totalExpenses.toFixed(2)}
Net Profit: K${netProfit.toFixed(2)}
Profit Margin: ${totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%

Top 5 Expenses:
${periodExpenses.slice(0, 5).map(e => `- ${e.description} (${e.category}): K${e.amount}`).join('\n')}
`;

    const prompt = `You are a professional Zambian Business Performance Analyst.
Review the following business financial performance details and write a structured performance feedback report:

${ledgerSummary}

Write a detailed critique. Include:
1. **PERFORMANCE SCORE**: Rate their performance out of 10 (e.g. 7/10) with a one-sentence justification.
2. **SALES ANALYSIS**: Critique their sales volumes relative to the target or typical retail/agriculture averages in Zambia.
3. **BURN RATE & EXPENSES**: Flag any high or wasteful expense categories (e.g. too much transport/airtime).
4. **TACTICAL RECOMMENDATIONS**: 3 specific, realistic cost-cutting or revenue-growth recommendations in Kwacha.
Write in clear, simple English. Avoid empty placeholder text.`;

    try {
      const res = await getBusinessAdvice(prompt, 'You are an expert Zambian Business Performance Analyst.');
      setAiReport(res);
      show('AI performance analysis generated!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-2 sm:px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex justify-end gap-2 mb-6 mt-2 shrink-0"><div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'summary' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-505 hover:text-gray-800'}`}
            >
              📊 Performance Summaries
            </button>
            <button 
              onClick={() => setActiveTab('kpi')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'kpi' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-505 hover:text-gray-800'}`}
            >
              🎯 KPI Target Tracker
            </button>
          </div></div>

      {/* SUMMARIES TAB */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Timeframe filters */}
          <div className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Timeframe</span>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['week', 'month', 'lastMonth'].map(t => (
                <button
                  key={t}
                  onClick={() => { setPeriod(t); setAiReport(''); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${period === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'Last Month'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sales card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Sales</span>
                <span className="text-xl font-black text-green-700">{formatKwacha(totalSales)}</span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-1">Cash & credit inflows</span>
              </div>
              {/* Expenses card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Expenses</span>
                <span className="text-xl font-black text-red-600">{formatKwacha(totalExpenses)}</span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-1">Cash outflows</span>
              </div>
              {/* Profit card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Net Profit</span>
                <span className={`text-xl font-black ${netProfit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                  {netProfit >= 0 ? '' : '-'}{formatKwacha(Math.abs(netProfit))}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-1">Sales minus expenses</span>
              </div>
              {/* Margin card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Profit Margin</span>
                <span className="text-xl font-black text-gray-800">{totalSales > 0 ? (netProfit / totalSales * 100).toFixed(1) : 0}%</span>
                <span className="text-[10px] text-gray-400 font-semibold block mt-1">Margin efficiency</span>
              </div>
            </div>
          )}

          {/* Cash Flow Visualizer */}
          {!loading && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 text-base mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" /> Cash Flow Visualizer (Kwacha Ratio)
              </h3>

              <div className="space-y-4">
                {/* Cash In */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                    <span>CASH-IN (SALES)</span>
                    <span className="text-green-700 font-black">{formatKwacha(totalSales)}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-6 rounded-xl overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-xl transition-all duration-500"
                      style={{ width: `${totalSales > 0 ? Math.min(100, (totalSales / Math.max(totalSales, totalExpenses)) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Cash Out */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                    <span>CASH-OUT (EXPENSES)</span>
                    <span className="text-red-600 font-black">{formatKwacha(totalExpenses)}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-6 rounded-xl overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-xl transition-all duration-500"
                      style={{ width: `${totalExpenses > 0 ? Math.min(100, (totalExpenses / Math.max(totalSales, totalExpenses)) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick burn check */}
              {totalExpenses > totalSales && totalSales > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 mt-6">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 font-semibold leading-relaxed">
                    Warning: Your cash outflows exceed your cash inflows. Review your expenses or adjust product prices.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI business summaries */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" /> AI Performance Report & Advice
              </h3>
              <button 
                onClick={handleGenerateAIReport}
                disabled={aiLoading || totalSales === 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95 disabled:opacity-50 text-xs flex items-center gap-1.5"
              >
                {aiLoading ? <><LoadingSpinner size="sm" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Run Performance Audit</>}
              </button>
            </div>

            {aiReport ? (
              <div className="prose prose-indigo max-w-none bg-gray-50/50 p-6 rounded-2xl border border-gray-100 animate-slide-up">
                <AIResponse content={aiReport} />
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Click "Run Performance Audit" to get customized AI critiques of your ledger numbers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI TARGETS TAB */}
      {activeTab === 'kpi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
              🎯 Custom KPI Targets
            </h2>
            <button 
              onClick={() => setShowKpiForm(!showKpiForm)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add KPI
            </button>
          </div>

          {/* Add KPI form */}
          {showKpiForm && (
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm animate-slide-up">
              <form onSubmit={handleAddKpi} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">KPI Name / Target Description</label>
                    <input 
                      required
                      type="text"
                      value={kpiForm.name}
                      onChange={e => setKpiForm({...kpiForm, name: e.target.value})}
                      placeholder="e.g. Monthly Egg Crates Sold"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Value</label>
                    <input 
                      required
                      type="number"
                      value={kpiForm.target}
                      onChange={e => setKpiForm({...kpiForm, target: e.target.value})}
                      placeholder="e.g. 500"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Value</label>
                    <input 
                      type="number"
                      value={kpiForm.current}
                      onChange={e => setKpiForm({...kpiForm, current: e.target.value})}
                      placeholder="e.g. 150"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit (Label)</label>
                    <input 
                      type="text"
                      value={kpiForm.unit}
                      onChange={e => setKpiForm({...kpiForm, unit: e.target.value})}
                      placeholder="e.g. Crates, ZMW, Customers"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Timeframe</label>
                    <select
                      value={kpiForm.timeframe}
                      onChange={e => setKpiForm({...kpiForm, timeframe: e.target.value})}
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowKpiForm(false)}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Save KPI Target
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KPI List */}
          <div className="grid grid-cols-1 gap-4">
            {kpis.map((kpi) => {
              const progressPercent = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
              let barColor = 'bg-red-500';
              let textColor = 'text-red-700';
              if (progressPercent >= 100) {
                barColor = 'bg-green-600';
                textColor = 'text-green-700';
              } else if (progressPercent >= 50) {
                barColor = 'bg-yellow-500';
                textColor = 'text-yellow-700';
              }

              return (
                <div key={kpi.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-extrabold text-gray-900 text-sm">{kpi.name}</h4>
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{kpi.timeframe}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold">
                        Goal: {kpi.target} {kpi.unit} | Current: {kpi.current} {kpi.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        placeholder="Log"
                        value={kpi.current}
                        onChange={e => handleUpdateKpiValue(kpi.id, e.target.value)}
                        className="w-16 border border-gray-250 rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button 
                        onClick={() => handleDeleteKpi(kpi.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-300 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-150 h-3 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-gray-400">Progress</span>
                    <span className={textColor}>{progressPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

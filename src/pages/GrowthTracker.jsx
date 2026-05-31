import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trophy, Target, FileDown, ShoppingBag, DollarSign, Users, ClipboardList, Landmark, MapPin, Rocket, Star } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import { formatKwacha, formatKwachaSimple, getCurrentMonthYear } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';
import jsPDF from 'jspdf';

const MILESTONES = [
  { id: 'first_sale', label: 'First Sale Ever', Icon: ShoppingBag },
  { id: 'first_1000', label: 'First K1,000 Month', Icon: DollarSign },
  { id: 'first_employee', label: 'First Employee Hired', Icon: Users },
  { id: 'registered', label: 'Business Registered', Icon: ClipboardList },
  { id: 'first_funding', label: 'First Funding Secured', Icon: Landmark },
  { id: 'new_location', label: 'New Location Opened', Icon: MapPin },
  { id: 'first_10k', label: 'First K10,000 Month', Icon: Rocket },
  { id: 'first_50k', label: 'First K50,000 Month', Icon: Star },
];

export default function GrowthTracker() {
  const { userProfile } = useAuthStore();
  const { addDocument, getUserDocuments, updateDocument } = useFirestore();
  const { toast, show, hide } = useToast();
  const [reports, setReports] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showAddMonth, setShowAddMonth] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [monthData, setMonthData] = useState({ revenue: '', expenses: '', customers: '', bestProduct: '', win: '', challenge: '' });
  const [newGoal, setNewGoal] = useState({ type: 'Revenue', target: '', targetDate: '', description: '' });

  const { month, year } = getCurrentMonthYear();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [r, a, g] = await Promise.all([
      getUserDocuments('monthlyReports', 'createdAt'),
      getUserDocuments('milestones', 'achievedAt'),
      getUserDocuments('goals', 'createdAt'),
    ]);
    setReports(r.reverse());
    setAchievements(a);
    setGoals(g);
  }

  async function saveMonth() {
    const revenue = parseFloat(monthData.revenue) || 0;
    const expenses = parseFloat(monthData.expenses) || 0;
    await addDocument('monthlyReports', {
      month, year, revenue, expenses,
      profit: revenue - expenses,
      customers: parseInt(monthData.customers) || 0,
      bestProduct: monthData.bestProduct,
      win: monthData.win,
      challenge: monthData.challenge,
    });
    setMonthData({ revenue: '', expenses: '', customers: '', bestProduct: '', win: '', challenge: '' });
    setShowAddMonth(false);
    loadData();
    show('Month saved!');
  }

  async function addAchievement(milestone) {
    if (achievements.find(a => a.milestoneId === milestone.id)) return;
    await addDocument('milestones', { milestoneId: milestone.id, label: milestone.label });
    loadData();
    show(`Congratulations! ${milestone.label} achieved!`);
  }

  async function saveGoal() {
    await addDocument('goals', { ...newGoal, progress: 0 });
    setNewGoal({ type: 'Revenue', target: '', targetDate: '', description: '' });
    setShowAddGoal(false);
    loadData();
    show('Goal set!');
  }

  function downloadReport(report) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(27, 79, 114);
    doc.text('IMPUNGA', 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Monthly Report — ${report.month} ${report.year}`, 20, 32);
    doc.setFontSize(12);
    let y = 50;
    const rows = [
      ['Revenue', formatKwacha(report.revenue)],
      ['Expenses', formatKwacha(report.expenses)],
      ['Profit / Loss', formatKwacha(report.profit)],
      ['Customers Served', String(report.customers)],
    ];
    rows.forEach(([label, value]) => {
      doc.text(label + ':', 20, y);
      doc.text(value, 100, y);
      y += 10;
    });
    if (report.win) { doc.text('Main Win:', 20, y + 5); doc.text(report.win, 20, y + 13); y += 25; }
    if (report.challenge) { doc.text('Main Challenge:', 20, y); doc.text(report.challenge, 20, y + 8); }
    doc.save(`IMPUNGA_Report_${report.month}_${report.year}.pdf`);
  }

  const totalRevenue = reports.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalProfit = reports.reduce((sum, r) => sum + (r.profit || 0), 0);
  const chartData = reports.slice(-6).map(r => ({ month: `${r.month?.substring(0, 3)} ${r.year}`, revenue: r.revenue, expenses: r.expenses, profit: r.profit }));

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Growth Tracker</h1>
            <p className="text-gray-500 text-sm">Track your business from seed to harvest</p>
          </div>
        </div>
        <button onClick={() => setShowAddMonth(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Month
        </button>
      </div>

      {/* Summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stat-card"><p className="text-xl font-bold text-primary">{formatKwachaSimple(totalRevenue)}</p><p className="text-xs text-gray-500">Total Revenue</p></div>
          <div className="stat-card"><p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatKwachaSimple(totalProfit)}</p><p className="text-xs text-gray-500">Total Profit</p></div>
          <div className="stat-card"><p className="text-xl font-bold text-primary">{reports.length}</p><p className="text-xs text-gray-500">Months Tracked</p></div>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => formatKwachaSimple(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => formatKwacha(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1E8449" name="Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#C0392B" name="Expenses" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly reports */}
      {reports.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-800 mb-3">Monthly Records</h3>
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-surface-light rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{r.month} {r.year}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>Revenue: {formatKwachaSimple(r.revenue)}</span>
                    <span className={r.profit >= 0 ? 'text-accent-green' : 'text-accent-red'}>Profit: {formatKwachaSimple(r.profit)}</span>
                  </div>
                </div>
                <button onClick={() => downloadReport(r)} className="text-gray-400 hover:text-primary p-1">
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="card mb-4">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-accent-gold" /> Business Milestones</h3>
        <div className="grid grid-cols-2 gap-2">
          {MILESTONES.map(m => {
            const achieved = achievements.find(a => a.milestoneId === m.id);
            return (
              <button
                key={m.id}
                onClick={() => !achieved && addAchievement(m)}
                className={`p-3 rounded-xl border text-left transition-all ${achieved ? 'border-accent-gold bg-yellow-50' : 'border-gray-200 hover:border-accent-gold hover:bg-yellow-50'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${achieved ? 'bg-accent-gold' : 'bg-gray-100'}`}>
                  <m.Icon className={`w-4 h-4 ${achieved ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className="text-xs font-medium text-gray-700">{m.label}</p>
                {achieved && <p className="text-xs text-accent-gold font-bold mt-0.5">Achieved</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Goals</h3>
          <button onClick={() => setShowAddGoal(true)} className="text-primary text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </div>
        {goals.length === 0 ? (
          <p className="text-gray-400 text-sm">No goals set yet. Set your first business goal!</p>
        ) : (
          <div className="space-y-3">
            {goals.map(g => (
              <div key={g.id} className="p-3 bg-surface-light rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="badge badge-government text-xs">{g.type}</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{g.description || `${g.type}: ${formatKwachaSimple(g.target)}`}</p>
                  </div>
                  {g.targetDate && <span className="text-xs text-gray-400">{g.targetDate}</span>}
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, ((g.progress || 0) / (g.target || 1)) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(((g.progress || 0) / (g.target || 1)) * 100)}% complete</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Month Modal */}
      {showAddMonth && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h3 className="font-bold text-gray-800 mb-4">Add Monthly Data — {month} {year}</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Revenue (K)', key: 'revenue', type: 'number' },
                { label: 'Total Expenses (K)', key: 'expenses', type: 'number' },
                { label: 'Customers Served', key: 'customers', type: 'number' },
                { label: 'Best Selling Product/Service', key: 'bestProduct', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input type={type} value={monthData[key]} onChange={e => setMonthData(p => ({ ...p, [key]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <div>
                <label className="label">Main Win This Month</label>
                <textarea value={monthData.win} onChange={e => setMonthData(p => ({ ...p, win: e.target.value }))} className="textarea-field" rows={2} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAddMonth(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveMonth} className="btn-green flex-1">Save Month</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h3 className="font-bold text-gray-800 mb-4">Set a New Goal</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Goal Type</label>
                <select value={newGoal.type} onChange={e => setNewGoal(p => ({ ...p, type: e.target.value }))} className="select-field">
                  <option>Revenue</option><option>Customers</option><option>Profit</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Target Amount or Description</label>
                <input value={newGoal.description} onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="e.g. Earn K50,000 in revenue" />
              </div>
              <div>
                <label className="label">Target Number (for progress tracking)</label>
                <input type="number" value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Target Date</label>
                <input type="date" value={newGoal.targetDate} onChange={e => setNewGoal(p => ({ ...p, targetDate: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAddGoal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveGoal} className="btn-green flex-1">Set Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

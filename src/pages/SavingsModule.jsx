import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Plus, Trash2, Calendar, TrendingUp, TrendingDown,
  Info, Award, ArrowLeft, Target, Wallet, AlertCircle, Percent
} from 'lucide-react';
import { formatKwacha } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';

const DEFAULT_GOALS = [
  { id: 'goal-1', name: 'Emergency Working Capital Buffer', target: 5000, current: 2400, dueDate: '2026-08-30' },
  { id: 'goal-2', name: 'Upgrade Machinery & Solar Backup', target: 20000, current: 4500, dueDate: '2026-12-15' }
];

const DEFAULT_TRANSACTIONS = [
  { id: 'tx-1', goalId: 'goal-1', type: 'deposit', amount: 500, date: '2026-06-10', description: 'Weekly ledger transfer' },
  { id: 'tx-2', goalId: 'goal-2', type: 'deposit', amount: 1500, date: '2026-06-12', description: 'Tomato peak harvest sales savings' },
  { id: 'tx-3', goalId: 'goal-1', type: 'withdrawal', amount: 200, date: '2026-06-15', description: 'Emergency repairs' }
];

export default function SavingsModule() {
  const navigate = useNavigate();
  const { toast, show, hide } = useToast();

  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showTxForm, setShowTxForm] = useState(false);

  // Form states
  const [goalForm, setGoalForm] = useState({ name: '', target: '', current: '', dueDate: '' });
  const [txForm, setTxForm] = useState({ goalId: '', type: 'deposit', amount: '', date: new Date().toISOString().split('T')[0], description: '' });

  useEffect(() => {
    const savedGoals = localStorage.getItem('impunga_savings_goals');
    const savedTxs = localStorage.getItem('impunga_savings_txs');
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    else setGoals(DEFAULT_GOALS);

    if (savedTxs) setTransactions(JSON.parse(savedTxs));
    else setTransactions(DEFAULT_TRANSACTIONS);
  }, []);

  const saveAll = (updatedGoals, updatedTxs) => {
    if (updatedGoals) {
      setGoals(updatedGoals);
      localStorage.setItem('impunga_savings_goals', JSON.stringify(updatedGoals));
    }
    if (updatedTxs) {
      setTransactions(updatedTxs);
      localStorage.setItem('impunga_savings_txs', JSON.stringify(updatedTxs));
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.target) return;
    const newGoal = {
      id: `goal-${Date.now()}`,
      name: goalForm.name,
      target: parseFloat(goalForm.target) || 0,
      current: parseFloat(goalForm.current) || 0,
      dueDate: goalForm.dueDate || '',
    };
    const updated = [...goals, newGoal];
    saveAll(updated, null);
    setShowGoalForm(false);
    setGoalForm({ name: '', target: '', current: '', dueDate: '' });
    show('Savings Goal added!');
  };

  const handleDeleteGoal = (id) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    const updatedTxs = transactions.filter(t => t.goalId !== id);
    saveAll(updatedGoals, updatedTxs);
    show('Goal removed.');
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!txForm.goalId || !txForm.amount) return;
    const amount = parseFloat(txForm.amount) || 0;
    if (amount <= 0) return;

    const targetGoal = goals.find(g => g.id === txForm.goalId);
    if (!targetGoal) return;

    let updatedCurrent = targetGoal.current;
    if (txForm.type === 'deposit') {
      updatedCurrent += amount;
    } else {
      if (amount > targetGoal.current) {
        show('Insufficient goal savings for withdrawal!', 'error');
        return;
      }
      updatedCurrent -= amount;
    }

    const updatedGoals = goals.map(g => g.id === txForm.goalId ? { ...g, current: updatedCurrent } : g);
    const newTx = {
      id: `tx-${Date.now()}`,
      goalId: txForm.goalId,
      type: txForm.type,
      amount,
      date: txForm.date,
      description: txForm.description.trim() || (txForm.type === 'deposit' ? 'Deposit' : 'Withdrawal'),
    };
    const updatedTxs = [newTx, ...transactions];

    saveAll(updatedGoals, updatedTxs);
    setShowTxForm(false);
    setTxForm({ goalId: '', type: 'deposit', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    show(txForm.type === 'deposit' ? 'Savings deposit logged!' : 'Savings withdrawal logged!');
  };

  // Speed Calculations helper
  const getSavingsRequirements = (goal) => {
    if (!goal.dueDate) return null;
    const target = new Date(goal.dueDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { expired: true };

    const deficit = goal.target - goal.current;
    if (deficit <= 0) return { complete: true };

    const daily = deficit / diffDays;
    const weekly = deficit / (diffDays / 7);

    return {
      daysRemaining: diffDays,
      weeksRemaining: Math.ceil(diffDays / 7),
      daily: Math.max(0, daily),
      weekly: Math.max(0, weekly),
    };
  };

  const totalBalance = goals.reduce((sum, g) => sum + g.current, 0);

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-2 sm:px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-amber-500" /> Savings Tracker
          </h1>
          <p className="text-gray-500 font-medium font-outfit">Define target vaults, simulate Kwacha deposits, and evaluate savings target speeds.</p>
        </div>

        {/* Balance */}
        <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl shadow-sm text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Total Savings Balance</span>
          <span className="text-2xl font-black text-amber-600">{formatKwacha(totalBalance)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Goals List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
              🎯 Savings Targets
            </h2>
            <button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="bg-amber-550 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-amber-550/15"
            >
              <Plus className="w-4 h-4" /> Create Goal
            </button>
          </div>

          {/* Goal form */}
          {showGoalForm && (
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm animate-slide-up">
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Goal Description / Target Asset</label>
                    <input 
                      required
                      type="text"
                      value={goalForm.name}
                      onChange={e => setGoalForm({...goalForm, name: e.target.value})}
                      placeholder="e.g. Purchase cold-storage delivery truck"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Savings (K)</label>
                    <input 
                      required
                      type="number"
                      value={goalForm.target}
                      onChange={e => setGoalForm({...goalForm, target: e.target.value})}
                      placeholder="e.g. 15000"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Initial Saved (K)</label>
                    <input 
                      type="number"
                      value={goalForm.current}
                      onChange={e => setGoalForm({...goalForm, current: e.target.value})}
                      placeholder="0.00"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Deadline Date</label>
                    <input 
                      required
                      type="date"
                      value={goalForm.dueDate}
                      onChange={e => setGoalForm({...goalForm, dueDate: e.target.value})}
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Goals mapping */}
          <div className="space-y-4">
            {goals.map((g) => {
              const progressPercent = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
              const reqs = getSavingsRequirements(g);

              return (
                <div key={g.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-extrabold text-gray-800 text-base mb-1">{g.name}</h4>
                      <p className="text-xs text-gray-400 font-semibold">
                        Deadline: {g.dueDate ? new Date(g.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Date Set'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-2 hover:bg-red-50 hover:text-red-500 text-gray-300 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress values */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-black text-amber-600">{formatKwacha(g.current)} <span className="text-[10px] text-gray-400 font-semibold">saved</span></span>
                    <span className="text-sm font-extrabold text-gray-700">{formatKwacha(g.target)} <span className="text-[10px] text-gray-400 font-semibold">target</span></span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden mb-4 relative">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>

                  {/* Smart target speed calculator */}
                  {reqs && (
                    <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                      {reqs.complete ? (
                        <span className="text-xs text-green-700 font-bold flex items-center gap-1.5"><Award className="w-4 h-4" /> Goal Achieved! Great Job.</span>
                      ) : reqs.expired ? (
                        <span className="text-xs text-red-600 font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Target date has passed.</span>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Daily Savings Needed</span>
                            <span className="text-sm font-bold text-gray-800">{formatKwacha(reqs.daily)}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Weekly Savings Needed</span>
                            <span className="text-sm font-bold text-gray-800">{formatKwacha(reqs.weekly)}</span>
                          </div>
                          <div className="flex-1 text-right shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Days Left</span>
                            <span className="text-sm font-bold text-indigo-600">{reqs.daysRemaining} days</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ledger Log & Tips */}
        <div className="space-y-6">
          {/* Quick Transaction Button */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <button 
              onClick={() => setShowTxForm(!showTxForm)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-650 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Log Savings Deposit
            </button>
          </div>

          {/* Deposit form */}
          {showTxForm && (
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm animate-slide-up">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Log Savings Transaction</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Savings Goal</label>
                  <select
                    required
                    value={txForm.goalId}
                    onChange={e => setTxForm({...txForm, goalId: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select Goal...</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                    <select
                      value={txForm.type}
                      onChange={e => setTxForm({...txForm, type: e.target.value})}
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 bg-white"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount (K)</label>
                    <input 
                      required
                      type="number"
                      value={txForm.amount}
                      onChange={e => setTxForm({...txForm, amount: e.target.value})}
                      placeholder="0.00"
                      className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <input 
                    type="text"
                    value={txForm.description}
                    onChange={e => setTxForm({...txForm, description: e.target.value})}
                    placeholder="e.g. Weekly surplus ledger transfer"
                    className="w-full border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowTxForm(false)}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Confirm Transaction
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Savings Tips Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6">
            <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-1.5">
              <Info className="w-5 h-5 text-amber-600" /> Zambian Savings Wisdom
            </h3>
            
            <ul className="space-y-3 text-xs text-amber-800 leading-relaxed font-medium">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">→</span>
                <span><b>High-Yield Wallets:</b> Keep short-term reserves in Mobile Money interest-earning wallets (MTN MoMo Interest/Airtel 3-tier) rather than standard cash boxes.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">→</span>
                <span><b>Harvest Cushioning:</b> For agricultural businesses, save 40% of peak-season dry harvest profits to cover seedling and input purchases during rainy planting months.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">→</span>
                <span><b>Matching Funds:</b> Government grants (like CEEC or CDF) often favor groups or businesses that already demonstrate active micro-savings habits.</span>
              </li>
            </ul>
          </div>

          {/* Transactions Log */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-h-[350px] overflow-y-auto">
            <h3 className="font-extrabold text-gray-800 text-sm mb-4">Savings Transactions Log</h3>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center gap-3 border-b border-gray-50 pb-2.5">
                  <div>
                    <span className="font-bold text-gray-800 text-xs block">{tx.description}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{tx.date}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-black text-xs ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatKwacha(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

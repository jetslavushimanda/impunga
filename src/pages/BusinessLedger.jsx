import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, TrendingUp, TrendingDown, Users,
  Plus, Trash2, ChevronDown, ChevronUp, Download,
  AlertCircle, Clock, CheckCircle2, Copy, ShoppingBag,
  Award, Bot, Loader2, Sparkles, ArrowLeft
} from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import { formatKwacha } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const EXPENSE_CATEGORIES = [
  'Stock/Inventory', 'Transport', 'Rent', 'Airtime/Data',
  'Wages/Labour', 'Equipment', 'Marketing', 'Other',
];

const CATEGORY_COLORS = {
  'Stock/Inventory': 'bg-blue-100 text-blue-700',
  'Transport': 'bg-yellow-100 text-yellow-700',
  'Rent': 'bg-red-100 text-red-700',
  'Airtime/Data': 'bg-purple-100 text-purple-700',
  'Wages/Labour': 'bg-orange-100 text-orange-700',
  'Equipment': 'bg-teal-100 text-teal-700',
  'Marketing': 'bg-pink-100 text-pink-700',
  'Other': 'bg-gray-100 text-gray-700',
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function toTimeStr(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getDateKey(ts) {
  if (!ts) return 'Unknown';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function groupByDateKey(items) {
  const groups = {};
  const keys = [];
  items.forEach(item => {
    const key = getDateKey(item.createdAt);
    if (!groups[key]) { groups[key] = []; keys.push(key); }
    groups[key].push(item);
  });
  return { groups, keys };
}

function groupExpensesByDate(items) {
  const groups = {};
  const keys = [];
  items.forEach(item => {
    const key = item.date
      ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      : getDateKey(item.createdAt);
    if (!groups[key]) { groups[key] = []; keys.push(key); }
    groups[key].push(item);
  });
  return { groups, keys };
}

function isToday(ts) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toDateString() === new Date().toDateString();
}

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon, end: sun };
}

function getMonthBounds(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function inBounds(ts, start, end) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d >= start && d <= end;
}

function expenseInPeriod(exp, start, end) {
  if (exp.date) {
    const d = new Date(exp.date + 'T00:00:00');
    return d >= start && d <= end;
  }
  return inBounds(exp.createdAt, start, end);
}

function profitMarginVerdict(margin) {
  if (margin > 30) return { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50 border-green-200', tip: 'Keep reinvesting in the products your customers love most.' };
  if (margin > 20) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50 border-green-100', tip: 'Look for ways to reduce your two biggest expense categories.' };
  if (margin > 10) return { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', tip: 'Review your pricing — you may be charging too little for your work.' };
  if (margin > 0) return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50 border-red-200', tip: 'Track every expense this week and cut anything not essential.' };
  return { label: 'Loss', color: 'text-red-800', bg: 'bg-red-100 border-red-300', tip: 'Pause new spending and focus on collecting any outstanding debts first.' };
}

function marginColor(margin) {
  if (margin > 30) return 'text-green-700';
  if (margin > 20) return 'text-green-600';
  if (margin > 10) return 'text-orange-500';
  if (margin > 0) return 'text-red-500';
  return 'text-red-700';
}

function DebtorCard({ debtor, type, onMarkPaid, onReminder }) {
  return (
    <div className="px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm">{debtor.customerName}</p>
        {debtor.description && <p className="text-xs text-gray-500 mt-0.5">{debtor.description}</p>}
        <p className="text-base font-bold text-gray-800 mt-1">{formatKwacha(debtor.amount)}</p>
        {type === 'overdue' && (
          <p className="text-xs font-semibold text-red-600 mt-0.5">{debtor.daysOverdue} day{debtor.daysOverdue !== 1 ? 's' : ''} overdue</p>
        )}
        {debtor.dueDate && type !== 'overdue' && (
          <p className="text-xs text-gray-400 mt-0.5">
            Due: {new Date(debtor.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
        {debtor.note && <p className="text-xs text-gray-400 italic mt-0.5">{debtor.note}</p>}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onMarkPaid(debtor)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark as Paid
        </button>
        <button
          onClick={() => onReminder(debtor)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold py-2 rounded-xl transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Send Reminder
        </button>
      </div>
    </div>
  );
}

export default function BusinessLedger() {
  const [activeTab, setActiveTab] = useState('menu');
  const { addDocument, updateDocument, deleteDocument, getUserDocuments } = useFirestore();
  const { user, userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();
  
  const [loadingCredit, setLoadingCredit] = useState(false);
  const [creditResult, setCreditResult] = useState(null);

  const { analyzeMarketTrends, loading: aiHealthLoading } = useGemini();
  const [aiHealthResult, setAiHealthResult] = useState(null);

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debtors, setDebtors] = useState([]);

  const [saleForm, setSaleForm] = useState({
    item: '', quantity: '', pricePerUnit: '', paymentMethod: 'Cash',
    customerName: '', dueDate: '', note: '',
  });
  const [expenseForm, setExpenseForm] = useState({
    description: '', amount: '', category: 'Stock/Inventory',
    date: todayStr(), note: '',
  });
  const [debtorForm, setDebtorForm] = useState({
    customerName: '', description: '', amount: '',
    dateCredited: todayStr(), dueDate: '', note: '',
  });

  const [showDebtorForm, setShowDebtorForm] = useState(false);
  const [weekSalesOpen, setWeekSalesOpen] = useState(false);
  const [monthSalesOpen, setMonthSalesOpen] = useState(false);
  const [plPeriod, setPlPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (activeTab !== 'credit' || !user) return;

    async function calculateScore() {
      setLoadingCredit(true);
      try {
        const [plans, pricings, s, e, d] = await Promise.all([
          getUserDocuments('businessPlans', 'createdAt', 100),
          getUserDocuments('pricingCalculations', 'createdAt', 100),
          getUserDocuments('sales', 'createdAt', 300),
          getUserDocuments('expenses', 'createdAt', 300),
          getUserDocuments('debtors', 'createdAt', 300),
        ]);

        // 1. Business Plan Completed (20 points)
        const hasPlan = plans.length > 0;
        const score1 = hasPlan ? 20 : 0;

        // 2. Pricing Above 20 Percent Margin (15 points)
        const hasHighMargin = pricings.some(p => (p.profitMargin || 0) > 20);
        const score2 = hasHighMargin ? 15 : 0;

        // 3. Consistent Sales Recording (20 points)
        const uniqueMonths = new Set();
        s.forEach(sale => {
          if (!sale.createdAt) return;
          const date = sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt);
          if (isNaN(date.getTime())) return;
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          uniqueMonths.add(yearMonth);
        });
        const salesMonths = uniqueMonths.size;
        let score3 = 0;
        if (salesMonths >= 3) score3 = 20;
        else if (salesMonths === 2) score3 = 13;
        else if (salesMonths === 1) score3 = 7;

        // 4. Expenses Below 70 Percent of Revenue (15 points)
        const totalRev = s.reduce((sum, item) => sum + (item.total || 0), 0);
        const totalExp = e.reduce((sum, item) => sum + (item.amount || 0), 0);
        const score4 = (totalRev > 0 && totalExp < 0.7 * totalRev) ? 15 : 0;

        // 5. Debtors Paying on Time (15 points)
        let score5 = 8;
        if (d.length > 0) {
          const activeDebtors = d.filter(item => item.status !== 'paid');
          const now = new Date();
          const hasOverdue = activeDebtors.some(item => item.dueDate && new Date(item.dueDate) < now);
          score5 = hasOverdue ? 0 : 15;
        }

        // 6. Business Formally Registered (15 points)
        const isRegistered = !!userProfile?.businessRegistered;
        const score6 = isRegistered ? 15 : 0;

        const totalScore = score1 + score2 + score3 + score4 + score5 + score6;

        setCreditResult({
          totalScore,
          breakdown: [
            {
              name: 'Business Plan Completed',
              earned: score1,
              max: 20,
              tip: score1 === 20 ? 'Great! You have completed your business plan.' : 'Go to the Business Plan Builder to write and complete your business plan.'
            },
            {
              name: 'Pricing Above 20% Margin',
              earned: score2,
              max: 15,
              tip: score2 === 15 ? 'Excellent! Your products/services are priced profitably.' : 'Use the Pricing Calculator to price your products/services with a profit margin above 20%.'
            },
            {
              name: 'Consistent Sales Recording',
              earned: score3,
              max: 20,
              tip: score3 === 20 ? 'Fantastic! You have consistent sales records.' : 'Record at least one sale per month for 3 consecutive months to demonstrate business consistency.'
            },
            {
              name: 'Expenses Below 70% of Revenue',
              earned: score4,
              max: 15,
              tip: score4 === 15 ? 'Great! Your expenses are kept well below revenue.' : 'Optimize your operations to reduce total expenses below 70% of your total revenue.'
            },
            {
              name: 'Debtors Paying on Time',
              earned: score5,
              max: 15,
              tip: score5 === 15 ? 'Perfect! No overdue debtors exist.' : score5 === 8 ? 'Record credit transactions in the Debtors Book and collect payments on time to build history.' : 'Collect payments from outstanding overdue debtors to restore your credit standing.'
            },
            {
              name: 'Business Formally Registered',
              earned: score6,
              max: 15,
              tip: score6 === 15 ? 'Awesome! Your business is registered.' : 'Register your business formally with PACRA and ZRA to unlock legal and financial benefits.'
            }
          ]
        });
      } catch (err) {
        console.error('Failed to calculate credit score:', err);
      } finally {
        setLoadingCredit(false);
      }
    }

    calculateScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user, userProfile]);

  async function loadData() {
    const [s, e, d] = await Promise.all([
      getUserDocuments('sales', null, 500),
      getUserDocuments('expenses', null, 500),
      getUserDocuments('debtors', null, 500),
    ]);
    
    const sortByDate = (a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return db - da;
    };
    
    setSales(s.sort(sortByDate));
    setExpenses(e.sort(sortByDate));
    setDebtors(d.sort(sortByDate));
  }

  async function handleAddSale() {
    const qty = parseFloat(saleForm.quantity) || 0;
    const price = parseFloat(saleForm.pricePerUnit) || 0;
    if (!saleForm.item.trim()) { show('Item name is required', 'error'); return; }
    if (qty <= 0) { show('Quantity must be greater than 0', 'error'); return; }
    if (price <= 0) { show('Price must be greater than 0', 'error'); return; }
    if (saleForm.paymentMethod === 'Credit' && !saleForm.customerName.trim()) {
      show('Customer name is required for credit sales', 'error'); return;
    }
    const total = qty * price;
    try {
      await addDocument('sales', {
        item: saleForm.item.trim(),
        quantity: qty,
        pricePerUnit: price,
        total,
        paymentMethod: saleForm.paymentMethod,
        customerName: saleForm.customerName.trim() || null,
        dueDate: saleForm.dueDate || null,
        note: saleForm.note.trim() || null,
      });
      if (saleForm.paymentMethod === 'Credit') {
        await addDocument('debtors', {
          customerName: saleForm.customerName.trim(),
          description: saleForm.item.trim(),
          amount: total,
          dateCredited: todayStr(),
          dueDate: saleForm.dueDate || null,
          status: 'current',
          note: saleForm.note.trim() || null,
        });
      }
      setSaleForm({ item: '', quantity: '', pricePerUnit: '', paymentMethod: 'Cash', customerName: '', dueDate: '', note: '' });
      loadData();
      show('Sale recorded!');
    } catch (err) {
      console.error(err);
      show(err.message || 'Failed to save sale', 'error');
    }
  }

  async function handleDeleteSale(id) {
    await deleteDocument('sales', id);
    loadData();
  }

  async function handleAddExpense() {
    const amt = parseFloat(expenseForm.amount) || 0;
    if (!expenseForm.description.trim()) { show('Description is required', 'error'); return; }
    if (amt <= 0) { show('Amount must be greater than 0', 'error'); return; }
    try {
      await addDocument('expenses', {
        description: expenseForm.description.trim(),
        amount: amt,
        category: expenseForm.category,
        date: expenseForm.date,
        note: expenseForm.note.trim() || null,
      });
      setExpenseForm({ description: '', amount: '', category: 'Stock/Inventory', date: todayStr(), note: '' });
      loadData();
      show('Expense recorded!');
    } catch (err) {
      console.error(err);
      show(err.message || 'Failed to save expense', 'error');
    }
  }

  async function handleDeleteExpense(id) {
    await deleteDocument('expenses', id);
    loadData();
  }

  async function handleAddDebtor() {
    const amt = parseFloat(debtorForm.amount) || 0;
    if (!debtorForm.customerName.trim()) { show('Customer name is required', 'error'); return; }
    if (amt <= 0) { show('Amount must be greater than 0', 'error'); return; }
    try {
      await addDocument('debtors', {
        customerName: debtorForm.customerName.trim(),
        description: debtorForm.description.trim() || null,
        amount: amt,
        dateCredited: debtorForm.dateCredited,
        dueDate: debtorForm.dueDate || null,
        status: 'current',
        note: debtorForm.note.trim() || null,
      });
      setDebtorForm({ customerName: '', description: '', amount: '', dateCredited: todayStr(), dueDate: '', note: '' });
      setShowDebtorForm(false);
      loadData();
      show('Debtor added!');
    } catch (err) {
      console.error(err);
      show(err.message || 'Failed to save debtor', 'error');
    }
  }

  async function handleMarkPaid(debtor) {
    await updateDocument('debtors', debtor.id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    });
    await addDocument('sales', {
      item: debtor.description || 'Debt payment',
      quantity: 1,
      pricePerUnit: debtor.amount,
      total: debtor.amount,
      paymentMethod: 'Cash',
      customerName: debtor.customerName,
      note: 'Credit payment received',
      isDebtPayment: true,
    });
    loadData();
    show(`${debtor.customerName} marked as paid!`);
  }

  function handleSendReminder(debtor) {
    const dueDateStr = debtor.dueDate
      ? new Date(debtor.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'the agreed date';
    const msg = `Hello ${debtor.customerName}, this is a reminder that you owe K${debtor.amount} for ${debtor.description || 'goods/services'} which was due on ${dueDateStr}. Please pay at your earliest convenience. Thank you.`;
    navigator.clipboard.writeText(msg)
      .then(() => show('WhatsApp message copied to clipboard!'))
      .catch(() => show('Could not copy — please copy manually', 'error'));
  }

  const sumSales = arr => arr.reduce((s, x) => s + (x.total || 0), 0);
  const sumAmt = arr => arr.reduce((s, x) => s + (x.amount || 0), 0);

  const { start: wStart, end: wEnd } = getWeekBounds();
  const { start: mStart, end: mEnd } = getMonthBounds(0);

  const todaySales = sales.filter(s => isToday(s.createdAt));
  const weekSales = sales.filter(s => inBounds(s.createdAt, wStart, wEnd));
  const monthSales = sales.filter(s => inBounds(s.createdAt, mStart, mEnd));
  const weekExpenses = expenses.filter(e => expenseInPeriod(e, wStart, wEnd));

  const todayTotal = sumSales(todaySales);
  const todayCash = sumSales(todaySales.filter(s => s.paymentMethod === 'Cash'));
  const todayMobile = sumSales(todaySales.filter(s => s.paymentMethod === 'Mobile Money'));
  const todayCredit = sumSales(todaySales.filter(s => s.paymentMethod === 'Credit'));

  function getPLBounds() {
    if (plPeriod === 'week') return getWeekBounds();
    if (plPeriod === 'lastMonth') return getMonthBounds(1);
    if (plPeriod === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd + 'T23:59:59') };
    }
    return getMonthBounds(0);
  }

  const { start: plStart, end: plEnd } = getPLBounds();
  const plSales = sales.filter(s => inBounds(s.createdAt, plStart, plEnd));
  const plExpenses = expenses.filter(e => expenseInPeriod(e, plStart, plEnd));
  const plIncome = sumSales(plSales);
  const plExpTotal = sumAmt(plExpenses);
  const plProfit = plIncome - plExpTotal;
  const plMargin = plIncome > 0 ? (plProfit / plIncome) * 100 : 0;

  const plExpCatBreakdown = EXPENSE_CATEGORIES
    .map(cat => ({ cat, amount: plExpenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0) }))
    .filter(x => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const expCatBreakdown = EXPENSE_CATEGORIES
    .map(cat => ({ cat, amount: weekExpenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0) }))
    .filter(x => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const maxExpCat = Math.max(...expCatBreakdown.map(x => x.amount), 1);

  async function handleAIHealthCheck() {
    try {
      const ledgerData = { plIncome, plExpTotal, plProfit, plMargin, plExpCatBreakdown };
      const res = await analyzeMarketTrends(ledgerData, userProfile?.sector, userProfile?.province);
      setAiHealthResult(res);
    } catch (err) {
      show(err.message || 'AI Health Check failed', 'error');
    }
  }

  function getChartWeeks() {
    const weeks = [];
    const cursor = new Date(plStart);
    const dayOfWeek = cursor.getDay();
    cursor.setDate(cursor.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= plEnd) {
      const wS = new Date(cursor);
      const wE = new Date(cursor);
      wE.setDate(wE.getDate() + 6);
      wE.setHours(23, 59, 59, 999);
      const wInc = sumSales(plSales.filter(s => inBounds(s.createdAt, wS, wE)));
      const wExp = sumAmt(plExpenses.filter(e => expenseInPeriod(e, wS, wE)));
      if (wInc > 0 || wExp > 0) {
        weeks.push({ label: wS.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), income: wInc, expense: wExp });
      }
      cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
  }
  const chartWeeks = getChartWeeks();
  const chartMax = Math.max(...chartWeeks.flatMap(w => [w.income, w.expense]), 1);

  const activeDebtors = debtors.filter(d => d.status !== 'paid');
  const now = new Date();
  const overdueDebtors = activeDebtors
    .filter(d => d.dueDate && new Date(d.dueDate) < now)
    .map(d => ({ ...d, daysOverdue: Math.floor((now - new Date(d.dueDate)) / 86400000) }));
  const dueSoonDebtors = activeDebtors.filter(d => {
    if (!d.dueDate) return false;
    const days = Math.floor((new Date(d.dueDate) - now) / 86400000);
    return days >= 0 && days <= 7;
  });
  const currentDebtors = activeDebtors.filter(d => {
    if (!d.dueDate) return true;
    return Math.floor((new Date(d.dueDate) - now) / 86400000) > 7;
  });
  const totalOutstanding = sumAmt(activeDebtors);
  const totalOverdue = sumAmt(overdueDebtors);

  async function downloadPDF() {
    const { start, end } = getMonthBounds(0);
    const mSales = sales.filter(s => inBounds(s.createdAt, start, end));
    const mExp = expenses.filter(e => expenseInPeriod(e, start, end));
    const inc = sumSales(mSales);
    const exp = sumAmt(mExp);
    const net = inc - exp;
    const monthLabel = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    const doc = new jsPDF();
    doc.setFillColor(27, 79, 114);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('IMPUNGA', 20, 16);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Business Ledger — Profit & Loss Statement', 20, 24);
    doc.text(`Period: ${monthLabel}`, 20, 31);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', 20, 52);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 132, 73);
    doc.text(`Total Income:    K${inc.toFixed(2)}`, 20, 62);
    doc.setTextColor(192, 57, 43);
    doc.text(`Total Expenses:  K${exp.toFixed(2)}`, 20, 70);
    doc.setTextColor(net >= 0 ? 30 : 192, net >= 0 ? 132 : 57, net >= 0 ? 73 : 43);
    doc.setFont(undefined, 'bold');
    doc.text(`Net ${net >= 0 ? 'Profit' : 'Loss'}:       K${Math.abs(net).toFixed(2)}`, 20, 78);

    let y = 96;
    doc.setTextColor(27, 79, 114);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Sales', 20, y); y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    if (mSales.length === 0) { doc.text('No sales recorded for this period.', 22, y); y += 7; }
    mSales.forEach(s => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${s.item}   ${s.quantity} x K${s.pricePerUnit} = K${(s.total || 0).toFixed(2)}  (${s.paymentMethod})`, 22, y);
      y += 6;
    });

    y += 8;
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setTextColor(27, 79, 114);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Expenses', 20, y); y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    if (mExp.length === 0) { doc.text('No expenses recorded for this period.', 22, y); y += 7; }
    mExp.forEach(e => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${e.description}  [${e.category}]  K${(e.amount || 0).toFixed(2)}`, 22, y);
      y += 6;
    });

    y += 12;
    if (y > 280) { doc.addPage(); y = 20; }
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(`Generated by IMPUNGA — JETS 2026 · Zambia  |  ${new Date().toLocaleDateString('en-GB')}`, 20, y);

    doc.save(`impunga-pl-${monthLabel.replace(' ', '-').toLowerCase()}.pdf`);
    show('PDF downloaded!');
  }

  function downloadExcel(data, filename) {
    if (!data.length) return show('No data to export', 'error');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  function exportSalesExcel() {
    const data = sales.map(s => ({
      Date: getDateKey(s.createdAt),
      Item: s.item,
      Quantity: s.quantity,
      Price: s.pricePerUnit,
      Total: s.total,
      Method: s.paymentMethod,
      Customer: s.customerName || '',
      Note: s.note || ''
    }));
    downloadExcel(data, 'Sales_Book');
  }

  function exportExpensesExcel() {
    const data = expenses.map(e => ({
      Date: e.date || getDateKey(e.createdAt),
      Category: e.category,
      Description: e.description,
      Amount: e.amount,
      Note: e.note || ''
    }));
    downloadExcel(data, 'Expense_Book');
  }

  function exportDebtorsExcel() {
    const data = debtors.map(d => ({
      Customer: d.customerName,
      Description: d.description,
      Amount: d.amount,
      Credited: d.dateCredited,
      Due: d.dueDate || '',
      Status: d.status,
      Note: d.note || ''
    }));
    downloadExcel(data, 'Debtors_Book');
  }

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white';
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

  const TABS = [
    { id: 'sales', label: 'Sales Book', Icon: ShoppingBag, desc: 'Record daily sales and revenue', bg: 'bg-green-100', text: 'text-green-600' },
    { id: 'expenses', label: 'Expense Book', Icon: TrendingDown, desc: 'Track all business costs', bg: 'bg-red-100', text: 'text-red-600' },
    { id: 'pl', label: 'Profit & Loss', Icon: TrendingUp, desc: 'View financial performance', bg: 'bg-blue-100', text: 'text-blue-600' },
    { id: 'debtors', label: 'Debtors Book', Icon: Users, desc: 'Manage people who owe you money', bg: 'bg-orange-100', text: 'text-orange-600' },
    { id: 'credit', label: 'Credit Score', Icon: Award, desc: 'Check your business credit health', bg: 'bg-purple-100', text: 'text-purple-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => activeTab === 'menu' ? navigate(-1) : setActiveTab('menu')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {activeTab === 'menu' ? 'Back' : 'Back to Ledger Menu'}
      </button>

      {/* Menu Header */}
      {activeTab === 'menu' && (
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Business Ledger</h1>
          <p className="text-gray-500 font-medium">Manage your financial books and track business health</p>
        </div>
      )}

      {/* Menu Grid */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {TABS.map(({ id, label, Icon, desc, bg, text }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-left hover:shadow-lg transition-all hover:-translate-y-1 group active:scale-95"
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${bg} ${text}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{label}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* ─── TAB: SALES BOOK ─── */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" /> Sales Book
            </h2>
            <button onClick={exportSalesExcel} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>

          {/* Add Sale Form */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm mb-4">Record a Sale</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Item Sold</label>
                <input className={inp} placeholder="e.g. Tomatoes, Chitenge, Phone cover"
                  value={saleForm.item} onChange={e => setSaleForm(f => ({ ...f, item: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Quantity</label>
                <input type="number" min="0" className={inp} placeholder="0"
                  value={saleForm.quantity} onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Price per Unit (K)</label>
                <input type="number" min="0" className={inp} placeholder="0.00"
                  value={saleForm.pricePerUnit} onChange={e => setSaleForm(f => ({ ...f, pricePerUnit: e.target.value }))} />
              </div>
              {saleForm.quantity && saleForm.pricePerUnit && (
                <div className="col-span-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-green-700 font-medium">Total</span>
                  <span className="text-lg font-bold text-green-700">
                    {formatKwacha((parseFloat(saleForm.quantity) || 0) * (parseFloat(saleForm.pricePerUnit) || 0))}
                  </span>
                </div>
              )}
              <div className="col-span-2">
                <label className={lbl}>Payment Method</label>
                <select className={inp} value={saleForm.paymentMethod}
                  onChange={e => setSaleForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Credit</option>
                </select>
              </div>
              {saleForm.paymentMethod === 'Credit' && (
                <>
                  <div className="col-span-2">
                    <label className={lbl}>Customer Name <span className="text-red-400">*</span></label>
                    <input className={inp} placeholder="Full name of customer"
                      value={saleForm.customerName} onChange={e => setSaleForm(f => ({ ...f, customerName: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Due Date</label>
                    <input type="date" className={inp}
                      value={saleForm.dueDate} onChange={e => setSaleForm(f => ({ ...f, dueDate: e.target.value }))} />
                  </div>
                  <div className="col-span-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                    This credit sale will be automatically added to the Debtors Book.
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className={lbl}>Note (optional)</label>
                <input className={inp} placeholder="Any extra details..."
                  value={saleForm.note} onChange={e => setSaleForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>
            <button onClick={handleAddSale}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              Record Sale
            </button>
          </div>

          {/* Daily Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today's Summary</h3>
            <div className="mb-3">
              <p className="text-2xl font-bold text-green-700">{formatKwacha(todayTotal)}</p>
              <p className="text-xs text-gray-400">{todaySales.length} transaction{todaySales.length !== 1 ? 's' : ''} today</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Cash', val: todayCash, color: 'text-green-600' },
                { label: 'Mobile', val: todayMobile, color: 'text-blue-600' },
                { label: 'Credit', val: todayCredit, color: 'text-orange-600' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <p className={`font-bold text-sm ${color}`}>{formatKwacha(val)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales list grouped by date */}
          {(() => {
            const { groups, keys } = groupByDateKey(sales);
            if (keys.length === 0) return (
              <p className="text-center py-8 text-gray-400 text-sm">No sales recorded yet. Add your first sale above.</p>
            );
            return keys.map(key => (
              <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500">{key}</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {groups[key].map(sale => (
                    <div key={sale.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">{sale.item}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                            sale.paymentMethod === 'Mobile Money' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>{sale.paymentMethod}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sale.quantity} × {formatKwacha(sale.pricePerUnit)} = <span className="font-bold text-gray-700">{formatKwacha(sale.total)}</span>
                        </p>
                        {sale.customerName && <p className="text-xs text-gray-400 mt-0.5">Customer: {sale.customerName}</p>}
                        {sale.note && <p className="text-xs text-gray-300 italic mt-0.5">{sale.note}</p>}
                        <p className="text-xs text-gray-300 mt-0.5">{toTimeStr(sale.createdAt)}</p>
                      </div>
                      <button onClick={() => handleDeleteSale(sale.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <p className="text-xs font-bold text-gray-600">Day total: {formatKwacha(sumSales(groups[key]))}</p>
                </div>
              </div>
            ));
          })()}

          {/* Weekly accordion */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setWeekSalesOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <span>This Week: {formatKwacha(sumSales(weekSales))}</span>
              {weekSalesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {weekSalesOpen && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: 'Cash', val: sumSales(weekSales.filter(s => s.paymentMethod === 'Cash')) },
                    { label: 'Mobile', val: sumSales(weekSales.filter(s => s.paymentMethod === 'Mobile Money')) },
                    { label: 'Credit', val: sumSales(weekSales.filter(s => s.paymentMethod === 'Credit')) },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <p className="font-bold text-gray-700 text-sm">{formatKwacha(val)}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{weekSales.length} transactions</p>
              </div>
            )}
          </div>

          {/* Monthly accordion */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setMonthSalesOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <span>This Month: {formatKwacha(sumSales(monthSales))}</span>
              {monthSalesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {monthSalesOpen && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: 'Cash', val: sumSales(monthSales.filter(s => s.paymentMethod === 'Cash')) },
                    { label: 'Mobile', val: sumSales(monthSales.filter(s => s.paymentMethod === 'Mobile Money')) },
                    { label: 'Credit', val: sumSales(monthSales.filter(s => s.paymentMethod === 'Credit')) },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <p className="font-bold text-gray-700 text-sm">{formatKwacha(val)}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{monthSales.length} transactions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: EXPENSE BOOK ─── */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" /> Expense Book
            </h2>
            <button onClick={exportExpensesExcel} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>

          {/* Add Expense Form */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm mb-4">Record an Expense</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={lbl}>Description</label>
                <input className={inp} placeholder="What did you spend on?"
                  value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Amount (K)</label>
                <input type="number" min="0" className={inp} placeholder="0.00"
                  value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Date</label>
                <input type="date" className={inp}
                  value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Category</label>
                <select className={inp} value={expenseForm.category}
                  onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Note (optional)</label>
                <input className={inp} placeholder="Any extra details..."
                  value={expenseForm.note} onChange={e => setExpenseForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </div>
            <button onClick={handleAddExpense}
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              Record Expense
            </button>
          </div>

          {/* Weekly summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">This Week's Expenses</h3>
            <p className="text-2xl font-bold text-red-600 mb-3">{formatKwacha(sumAmt(weekExpenses))}</p>
            {expCatBreakdown.length > 0 ? (
              <div className="space-y-2.5">
                {expCatBreakdown.map(({ cat, amount }) => (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                      <span className="text-xs font-bold text-gray-700">{formatKwacha(amount)}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div className="bg-orange-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${(amount / maxExpCat) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs font-bold text-orange-700 pt-1">
                  Biggest category: {expCatBreakdown[0].cat}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No expenses this week.</p>
            )}
          </div>

          {/* Expense list grouped by date */}
          {(() => {
            const { groups, keys } = groupExpensesByDate(expenses);
            if (keys.length === 0) return (
              <p className="text-center py-8 text-gray-400 text-sm">No expenses recorded yet. Add your first expense above.</p>
            );
            return keys.map(key => (
              <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500">{key}</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {groups[key].map(exp => (
                    <div key={exp.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">{exp.description}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[exp.category] || 'bg-gray-100 text-gray-600'}`}>
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-red-600 mt-0.5">{formatKwacha(exp.amount)}</p>
                        {exp.note && <p className="text-xs text-gray-400 italic mt-0.5">{exp.note}</p>}
                      </div>
                      <button onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <p className="text-xs font-bold text-gray-600">Day total: {formatKwacha(sumAmt(groups[key]))}</p>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ─── TAB: PROFIT & LOSS ─── */}
      {activeTab === 'pl' && (
        <div className="space-y-4">

          {/* Period selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'lastMonth', label: 'Last Month' },
                { id: 'custom', label: 'Custom' },
              ].map(p => (
                <button key={p.id} onClick={() => setPlPeriod(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    plPeriod === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            {plPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={lbl}>From</label>
                  <input type="date" className={inp} value={customStart} onChange={e => setCustomStart(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>To</label>
                  <input type="date" className={inp} value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Summary cards 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 border-l-green-400">
              <p className="text-xs text-gray-400 mb-1">Total Income</p>
              <p className="text-xl font-bold text-green-700">{formatKwacha(plIncome)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 border-l-red-400">
              <p className="text-xs text-gray-400 mb-1">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">{formatKwacha(plExpTotal)}</p>
            </div>
            <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${plProfit >= 0 ? 'border-l-green-500' : 'border-l-red-600'}`}>
              <p className="text-xs text-gray-400 mb-1">Net {plProfit >= 0 ? 'Profit' : 'Loss'}</p>
              <p className={`text-xl font-bold ${plProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatKwacha(Math.abs(plProfit))}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 border-l-blue-400">
              <p className="text-xs text-gray-400 mb-1">Profit Margin</p>
              <p className={`text-xl font-bold ${marginColor(plMargin)}`}>{plIncome > 0 ? plMargin.toFixed(1) : '—'}%</p>
            </div>
          </div>

          {/* CSS Bar chart */}
          {chartWeeks.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Weekly Breakdown</h3>
              <div className="flex items-end gap-4 justify-center overflow-x-auto pb-1" style={{ minHeight: 110 }}>
                {chartWeeks.map(w => (
                  <div key={w.label} className="flex flex-col items-center gap-1 shrink-0">
                    <div className="flex items-end gap-1">
                      <div className="w-7 bg-green-400 rounded-t-md transition-all"
                        style={{ height: `${Math.max(4, (w.income / chartMax) * 90)}px` }}
                        title={`Income: ${formatKwacha(w.income)}`} />
                      <div className="w-7 bg-red-400 rounded-t-md transition-all"
                        style={{ height: `${Math.max(4, (w.expense / chartMax) * 90)}px` }}
                        title={`Expenses: ${formatKwacha(w.expense)}`} />
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{w.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-5 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-400 rounded-sm" /><span className="text-xs text-gray-500">Income</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-sm" /><span className="text-xs text-gray-500">Expenses</span></div>
              </div>
            </div>
          )}

          {/* Income breakdown */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Income Breakdown</h3>
            <div className="space-y-0">
              {[
                { label: 'Cash Sales', val: sumSales(plSales.filter(s => s.paymentMethod === 'Cash' && !s.isDebtPayment)), color: 'text-green-600' },
                { label: 'Mobile Money', val: sumSales(plSales.filter(s => s.paymentMethod === 'Mobile Money')), color: 'text-blue-600' },
                { label: 'Credit Given', val: sumSales(plSales.filter(s => s.paymentMethod === 'Credit')), color: 'text-orange-600' },
                { label: 'Credit Received', val: sumSales(plSales.filter(s => s.isDebtPayment)), color: 'text-purple-600' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`font-bold text-sm ${color}`}>{formatKwacha(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense breakdown */}
          {plExpCatBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Expense Breakdown</h3>
              <div className="space-y-3">
                {plExpCatBreakdown.map(({ cat, amount }) => {
                  const pct = plExpTotal > 0 ? (amount / plExpTotal) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                        <div>
                          <span className="text-sm font-bold text-gray-700">{formatKwacha(amount)}</span>
                          <span className="text-xs text-gray-400 ml-1">({pct.toFixed(0)}%)</span>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Health verdict */}
          {plIncome > 0 && (() => {
            const verdict = profitMarginVerdict(plMargin);
            const messages = {
              Excellent: 'Your business is very healthy. Keep growing!',
              Good: 'Your business is profitable. Keep it up!',
              Fair: 'Your margins need some attention.',
              Poor: 'Your business may be losing money.',
              Loss: 'Your business is currently running at a loss.',
            };
            return (
              <div className={`rounded-2xl p-4 border ${verdict.bg}`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${verdict.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`font-bold text-sm ${verdict.color}`}>Business Health: {verdict.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{messages[verdict.label]}</p>
                    <p className="text-xs text-gray-500 mt-1.5 italic">{verdict.tip}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* AI Financial Health Check */}
          {plIncome > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" /> AI Financial Health Check
                </h3>
                {!aiHealthResult && (
                  <button onClick={handleAIHealthCheck} disabled={aiHealthLoading} className="btn-primary py-1.5 text-sm gap-2">
                    {aiHealthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze against Zambian averages
                  </button>
                )}
              </div>
              
              {aiHealthResult && (
                <div className="space-y-4 animate-fade-in text-sm">
                  {aiHealthResult.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split('\n\n').map((section, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-blue-100 text-blue-900 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Download PDF */}
          <button onClick={downloadPDF}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors">
            <Download className="w-4 h-4" />
            Download Monthly P&L Statement (PDF)
          </button>
        </div>
      )}

      {/* ─── TAB: DEBTORS ─── */}
      {activeTab === 'debtors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" /> Debtors Book
            </h2>
            <button onClick={exportDebtorsExcel} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-gray-800">{formatKwacha(totalOutstanding)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Outstanding</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{activeDebtors.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Debtors</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{formatKwacha(totalOverdue)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Overdue</p>
              </div>
            </div>
          </div>

          {/* Add debtor toggle */}
          <button onClick={() => setShowDebtorForm(o => !o)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-2xl py-3 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            <Plus className="w-4 h-4" />
            Add Debtor Manually
          </button>

          {showDebtorForm && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm mb-4">Add Debtor</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={lbl}>Customer Name <span className="text-red-400">*</span></label>
                  <input className={inp} placeholder="Full name"
                    value={debtorForm.customerName} onChange={e => setDebtorForm(f => ({ ...f, customerName: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Item / Description</label>
                  <input className={inp} placeholder="What was sold or owed"
                    value={debtorForm.description} onChange={e => setDebtorForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Amount Owed (K) <span className="text-red-400">*</span></label>
                  <input type="number" min="0" className={inp} placeholder="0.00"
                    value={debtorForm.amount} onChange={e => setDebtorForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Date Credit Given</label>
                  <input type="date" className={inp}
                    value={debtorForm.dateCredited} onChange={e => setDebtorForm(f => ({ ...f, dateCredited: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Due Date</label>
                  <input type="date" className={inp}
                    value={debtorForm.dueDate} onChange={e => setDebtorForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Note (optional)</label>
                  <input className={inp} placeholder="Any details..."
                    value={debtorForm.note} onChange={e => setDebtorForm(f => ({ ...f, note: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowDebtorForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddDebtor}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Add Debtor
                </button>
              </div>
            </div>
          )}

          {/* Overdue */}
          {overdueDebtors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Overdue ({overdueDebtors.length})</p>
              </div>
              <div className="divide-y divide-gray-50">
                {overdueDebtors.map(d => (
                  <DebtorCard key={d.id} debtor={d} type="overdue" onMarkPaid={handleMarkPaid} onReminder={handleSendReminder} />
                ))}
              </div>
            </div>
          )}

          {/* Due Soon */}
          {dueSoonDebtors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Due Soon ({dueSoonDebtors.length})</p>
              </div>
              <div className="divide-y divide-gray-50">
                {dueSoonDebtors.map(d => (
                  <DebtorCard key={d.id} debtor={d} type="dueSoon" onMarkPaid={handleMarkPaid} onReminder={handleSendReminder} />
                ))}
              </div>
            </div>
          )}

          {/* Current */}
          {currentDebtors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current ({currentDebtors.length})</p>
              </div>
              <div className="divide-y divide-gray-50">
                {currentDebtors.map(d => (
                  <DebtorCard key={d.id} debtor={d} type="current" onMarkPaid={handleMarkPaid} onReminder={handleSendReminder} />
                ))}
              </div>
            </div>
          )}

          {activeDebtors.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">No active debtors. Great job!</p>
          )}
        </div>
      )}

      {/* ─── TAB: CREDIT SCORE ─── */}
      {activeTab === 'credit' && (
        <div className="space-y-4">
          {loadingCredit ? (
            <div className="py-12 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
              <LoadingSpinner text="Calculating Business Credit Score..." />
            </div>
          ) : creditResult ? (
            (() => {
              const radius = 70;
              const strokeWidth = 14;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (creditResult.totalScore / 100) * circumference;

              const getTierInfo = (score) => {
                if (score < 40) {
                  return {
                    color: '#EF4444',
                    textClass: 'text-red-600',
                    bgClass: 'bg-red-50',
                    borderClass: 'border-red-200',
                    label: 'Needs Attention',
                    message: 'Start recording your sales and completing your business plan to build your score.'
                  };
                }
                if (score < 60) {
                  return {
                    color: '#F97316',
                    textClass: 'text-orange-600',
                    bgClass: 'bg-orange-50',
                    borderClass: 'border-orange-200',
                    label: 'Developing',
                    message: 'You are building momentum. Consistent record keeping will grow your score quickly.'
                  };
                }
                if (score < 80) {
                  return {
                    color: '#2563EB',
                    textClass: 'text-blue-600',
                    bgClass: 'bg-blue-50',
                    borderClass: 'border-blue-200',
                    label: 'Good Standing',
                    message: 'Good standing. Focus on expense management and debt collection to reach the top tier.'
                  };
                }
                return {
                  color: '#16A34A',
                  textClass: 'text-green-600',
                  bgClass: 'bg-green-50',
                  borderClass: 'border-green-200',
                  label: 'Excellent',
                  message: 'Excellent. Your business health is strong. Share this score with funders and financial institutions.'
                };
              };

              const tier = getTierInfo(creditResult.totalScore);

              return (
                <>
                  {/* Circular Gauge */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-44 h-44 transform -rotate-90">
                        <circle
                          cx="88"
                          cy="88"
                          r={radius}
                          className="stroke-gray-100"
                          strokeWidth={strokeWidth}
                          fill="none"
                        />
                        <circle
                          cx="88"
                          cy="88"
                          r={radius}
                          stroke={tier.color}
                          strokeWidth={strokeWidth}
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-4xl font-extrabold text-gray-800">{creditResult.totalScore}</span>
                        <span className="text-gray-400 text-sm font-semibold block">/ 100</span>
                      </div>
                    </div>
                    <p className={`mt-4 text-lg font-bold ${tier.textClass}`}>{tier.label}</p>
                  </div>

                  {/* Breakdown Cards */}
                  <div className="space-y-3 mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Dimension Breakdown</h3>
                    {creditResult.breakdown.map((item, idx) => {
                      const isMax = item.earned === item.max;
                      return (
                        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.tip}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-base font-extrabold ${isMax ? 'text-green-600' : 'text-gray-700'}`}>
                              {item.earned}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold"> / {item.max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Motivational Message */}
                  <div className={`rounded-2xl p-4 border ${tier.bgClass} ${tier.borderClass} flex items-start gap-3`}>
                    <AlertCircle className={`w-5 h-5 ${tier.textClass} shrink-0 mt-0.5`} />
                    <div>
                      <p className={`font-bold text-sm ${tier.textClass}`}>Your Business Standing</p>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{tier.message}</p>
                    </div>
                  </div>
                </>
              );
            })()
          ) : null}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  );
}

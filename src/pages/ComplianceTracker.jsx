import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, AlertCircle, Bot, RefreshCw, ExternalLink, Calendar } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import AIResponse from '../components/shared/AIResponse';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Static known deadlines that apply to ALL registered Zambian businesses
const STATIC_DEADLINES = [
  {
    title: 'ZRA PAYE Monthly Return',
    authority: 'Zambia Revenue Authority',
    legalRef: 'Income Tax Act Cap 323, S.72',
    dayOfMonth: 10,
    frequency: 'Monthly',
    description: 'Pay As You Earn must be remitted by the 10th of each following month if you have employees.',
    action: 'File and pay on ZRA TaxOnline: www.zra.org.zm',
    appliesIf: 'hasEmployees',
  },
  {
    title: 'NAPSA Monthly Contributions',
    authority: 'National Pension Scheme Authority',
    legalRef: 'Pension Scheme Regulation Act 28 of 1996',
    dayOfMonth: 10,
    frequency: 'Monthly',
    description: 'Employer contributes 5% and employee 5% of gross pay. Due by 10th of following month.',
    action: 'Pay via NAPSA portal: www.napsa.co.zm',
    appliesIf: 'hasEmployees',
  },
  {
    title: 'NHIMA Monthly Levy',
    authority: 'National Health Insurance Management Authority',
    legalRef: 'National Health Insurance Act 2 of 2018',
    dayOfMonth: 10,
    frequency: 'Monthly',
    description: 'NHIMA levy of 1% employer + 1% employee of gross salary, due 10th of each month.',
    action: 'Pay via employer portal: www.nhima.co.zm',
    appliesIf: 'hasEmployees',
  },
  {
    title: 'ZRA VAT Monthly Return',
    authority: 'Zambia Revenue Authority',
    legalRef: 'Value Added Tax Act Cap 331',
    dayOfMonth: 18,
    frequency: 'Monthly',
    description: 'VAT-registered businesses (turnover >K800,000/year) must file monthly VAT returns by the 18th.',
    action: 'File on ZRA TaxOnline portal',
    appliesIf: 'vatRegistered',
  },
  {
    title: 'Workers Compensation Contribution',
    authority: "Workers' Compensation Fund Control Board",
    legalRef: "Workers' Compensation Act Cap 271",
    dayOfMonth: 31,
    frequency: 'Monthly',
    description: 'Monthly contributions to Workers Compensation Fund for all employees doing manual or field work.',
    action: 'Pay at WCF offices or via bank transfer',
    appliesIf: 'hasEmployees',
  },
];

function getStatusConfig(status) {
  switch (status) {
    case 'overdue':
      return { label: 'Overdue', bg: 'bg-red-50', border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', icon: AlertCircle, iconColor: 'text-red-500' };
    case 'due_soon':
      return { label: 'Due Soon', bg: 'bg-yellow-50', border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle, iconColor: 'text-yellow-500' };
    case 'upcoming':
      return { label: 'Upcoming', bg: 'bg-blue-50', border: 'border-l-blue-400', badge: 'bg-blue-100 text-blue-700', icon: Clock, iconColor: 'text-blue-500' };
    default:
      return { label: 'Compliant', bg: 'bg-green-50', border: 'border-l-green-400', badge: 'bg-green-100 text-green-700', icon: CheckCircle2, iconColor: 'text-green-500' };
  }
}

function getDaysUntil(dateStr) {
  const now = new Date();
  const due = new Date(dateStr);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getStatusFromDays(days) {
  if (days < 0) return 'overdue';
  if (days <= 7) return 'due_soon';
  if (days <= 30) return 'upcoming';
  return 'compliant';
}

function buildStaticDeadlines(userProfile) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const hasEmployees = userProfile?.hasEmployees === 'yes' || false;
  const vatRegistered = false; // Would need a user flag; defaults to not registered

  return STATIC_DEADLINES
    .filter(d => {
      if (d.appliesIf === 'hasEmployees') return hasEmployees;
      if (d.appliesIf === 'vatRegistered') return vatRegistered;
      return true;
    })
    .map(d => {
      let dueDate = new Date(year, month, d.dayOfMonth);
      if (dueDate < now) {
        // Roll to next month
        dueDate = new Date(year, month + 1, d.dayOfMonth);
      }
      const dueDateStr = dueDate.toISOString().split('T')[0];
      const days = getDaysUntil(dueDateStr);
      return {
        title: d.title,
        authority: d.authority,
        legalRef: d.legalRef,
        dueDate: dueDateStr,
        status: getStatusFromDays(days),
        description: d.description,
        action: d.action,
        frequency: d.frequency,
        daysUntil: days,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export default function ComplianceTracker() {
  const { userProfile } = useAuthStore();
  const { getUserDocumentCount } = useFirestore();
  const { generateComplianceReport, loading, error } = useAI();

  const [staticDeadlines] = useState(() => buildStaticDeadlines(userProfile));
  const [aiReport, setAiReport] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [counts, setCounts] = useState({ ideas: 0, plans: 0, ledger: 0 });

  useEffect(() => {
    async function loadCounts() {
      const [ideas, plans, ledger] = await Promise.all([
        getUserDocumentCount('businessIdeas'),
        getUserDocumentCount('businessPlans'),
        getUserDocumentCount('sales'),
      ]);
      setCounts({ ideas, plans, ledger });
    }
    loadCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAIHealthCheck() {
    setAiRunning(true);
    try {
      const businessProfile = {
        province: userProfile?.province || 'Unknown',
        occupation: userProfile?.occupation || 'General business',
        experience: userProfile?.experience || 'Unknown',
        selectedPath: userProfile?.selectedPath || 'both',
        registrationStatus: userProfile?.registrationStatus || 'unknown',
      };
      const ledgerSummary = {
        savedIdeas: counts.ideas,
        savedPlans: counts.plans,
        ledgerEntries: counts.ledger,
        currentMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      };
      const report = await generateComplianceReport(businessProfile, ledgerSummary);
      setAiReport(report);
    } catch {
      // error shown by hook
    } finally {
      setAiRunning(false);
    }
  }

  const overdueCount = staticDeadlines.filter(d => d.status === 'overdue').length;
  const dueSoonCount = staticDeadlines.filter(d => d.status === 'due_soon').length;

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl p-5 mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #7D3C98 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Compliance Tracker</h1>
              <p className="text-purple-200 text-xs">ZRA · PACRA · NAPSA · NHIMA regulatory deadlines</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm">Stay compliant with Zambian law. Never miss a tax or regulatory deadline.</p>

          {/* Score pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {overdueCount > 0 && (
              <span className="text-xs bg-red-500/80 text-white font-bold px-3 py-1 rounded-full">
                {overdueCount} Overdue
              </span>
            )}
            {dueSoonCount > 0 && (
              <span className="text-xs bg-yellow-400/80 text-gray-900 font-bold px-3 py-1 rounded-full">
                {dueSoonCount} Due Soon
              </span>
            )}
            {overdueCount === 0 && dueSoonCount === 0 && (
              <span className="text-xs bg-green-400/80 text-white font-bold px-3 py-1 rounded-full">
                ✓ All Clear
              </span>
            )}
          </div>
        </div>
        <ShieldCheck className="absolute right-4 top-4 w-20 h-20 text-white/5" />
      </div>

      {/* Compliance Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            <Calendar className="w-4 h-4 inline mr-1" />Compliance Calendar
          </h2>
          <span className="text-xs text-gray-400">Auto-calculated for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        </div>

        {staticDeadlines.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No mandatory deadlines detected for your current profile.</p>
            <p className="text-xs text-gray-400 mt-1">Run the AI Health Check below for a full personalised compliance audit.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staticDeadlines.map((deadline, idx) => {
              const cfg = getStatusConfig(deadline.status);
              const StatusIcon = cfg.icon;
              return (
                <div key={idx} className={`${cfg.bg} rounded-2xl p-4 border border-l-4 ${cfg.border} border-gray-100`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`w-5 h-5 ${cfg.iconColor} shrink-0 mt-0.5`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-gray-800 text-sm">{deadline.title}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-semibold">{deadline.authority}</span> · <span className="italic">{deadline.legalRef}</span>
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{deadline.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-gray-700">
                            Due: {new Date(deadline.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {deadline.daysUntil >= 0 ? ` (${deadline.daysUntil} days)` : ` (${Math.abs(deadline.daysUntil)} days ago)`}
                          </span>
                          <span className="text-xs text-gray-400">· {deadline.frequency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-600"><span className="font-semibold">Action:</span> {deadline.action}</p>
                    <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PACRA Annual Returns Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-l-4 border-blue-200 border-l-blue-500 mb-6">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-gray-800 text-sm">PACRA Annual Returns</p>
            <p className="text-xs text-gray-500 mb-1"><span className="font-semibold">Patents & Companies Registration Agency</span> · <span className="italic">Companies Act 10 of 2017, S.138</span></p>
            <p className="text-xs text-gray-600">All registered companies must file Annual Returns with PACRA within 90 days of the end of each financial year. Late filing incurs penalties of K500–K5,000.</p>
            <a href="https://www.pacra.org.zm" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2 hover:underline">
              File at pacra.org.zm <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* AI Compliance Health Check */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" /> AI Compliance Health Check
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Full AI audit of your business compliance posture — citing specific Zambian law</p>
          </div>
          <button
            onClick={runAIHealthCheck}
            disabled={aiRunning || loading}
            className="flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors shrink-0"
          >
            {aiRunning ? (
              <><LoadingSpinner size="sm" /> Auditing...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Run Health Check</>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-3">{error}</div>
        )}

        {!aiReport && !aiRunning && (
          <div className="bg-purple-50 rounded-xl p-5 text-center">
            <Bot className="w-10 h-10 text-purple-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-700">Click "Run Health Check" for a personalised AI compliance audit</p>
            <p className="text-xs text-purple-500 mt-1">AI will analyse your business profile and generate a full ZRA/PACRA/NAPSA compliance report</p>
          </div>
        )}

        {aiReport && (
          <div className="space-y-4 animate-fade-in">
            {/* Health Score */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke={aiReport.healthScore >= 70 ? '#22c55e' : aiReport.healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    strokeDasharray={`${(aiReport.healthScore / 100) * 163} 163`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                  {aiReport.healthScore}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-800">Compliance Health Score</p>
                <p className="text-sm text-gray-500 mt-0.5">{aiReport.summary}</p>
              </div>
            </div>

            {/* AI Deadlines */}
            {aiReport.deadlines?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI-Generated Deadline List</h3>
                <div className="space-y-2">
                  {aiReport.deadlines.map((d, i) => {
                    const cfg = getStatusConfig(d.status);
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={i} className={`${cfg.bg} rounded-xl p-3 border-l-4 ${cfg.border}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={`w-4 h-4 ${cfg.iconColor} shrink-0`} />
                          <p className="font-semibold text-gray-800 text-sm">{d.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cfg.badge}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 pl-6"><span className="font-medium">{d.authority}</span> · <span className="italic">{d.legalRef}</span></p>
                        <p className="text-xs text-gray-600 pl-6 mt-1">{d.description}</p>
                        <p className="text-xs text-primary pl-6 mt-1 font-medium">→ {d.action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {aiReport.recommendations?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Recommendations</h3>
                <div className="space-y-2">
                  {aiReport.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Deadlines are based on Zambian law as of 2026. Always verify with your accountant or ZRA directly.
      </p>
    </div>
  );
}

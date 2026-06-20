import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, GraduationCap, DollarSign,
  Clock, ChevronRight, Lightbulb, Star, CheckCircle2,
  Newspaper, TrendingDown, AlertCircle, ArrowRight, Zap,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getGreeting, getFirstName } from '../lib/utils';
import { Skeleton } from '../components/shared/Skeleton';

const ROUTE_LABELS = {
  '/idea-validator': 'Idea Validator',
  '/registration-guide': 'Registration Guide',
  '/business-plan': 'Business Plan Builder',
  '/pitch-deck': 'Pitch Deck Generator',
  '/investment-matchmaker': 'Investment Matchmaker',
  '/pricing-calculator': 'Pricing Calculator',
  '/grants-portal': 'Grants & Subsidies',
  '/loans-portal': 'Loans & Credit',
  '/ai-advisor': 'AI Assistant',
  '/name-generator': 'Business Name Generator',
  '/invoice-generator': 'Invoice Generator',
  '/market-prices': 'Market Prices',
  '/whatsapp-templates': 'WhatsApp Templates',
  '/swot-analysis': 'SWOT Analysis',
  '/social-media': 'Marketing Tools',
  '/market-directory': 'Verified Directory',
  '/business-ledger': 'Business Ledger',
  '/skill-profile-builder': 'Skill Profile Builder',
  '/career-matches': 'Career Matches',
  '/zambian-jobs': 'Zambian Jobs',
  '/compliance-tracker': 'Compliance Tracker',
  '/cv-generator': 'CV Generator',
  '/cover-letter-generator': 'Cover Letter AI',
  '/interview-prep': 'Interview Prep Wizard',
  '/skill-gap-closer': 'Skill Gap Closer',
  '/portfolio-showcase': 'Portfolio Showcase',
  '/b2b-tenders': 'B2B Tenders',
  '/gig-board': 'Piece-Work Board',
  '/asset-sharing': 'Asset Rentals',
  '/kpi-tracker': 'KPI & Summaries',
  '/savings-module': 'Savings Tracker',
};

const ECONOMIC_INTEL = [
  { id: 1, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', title: 'Copper prices rise 2.3%', body: "LME copper hit $9,420/tonne, boosting Zambia's export outlook for Q3 2026.", tag: 'Markets', time: '2h ago' },
  { id: 2, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', title: 'PACRA eases registration fees', body: 'Business name reservation now K150 for youth entrepreneurs under 35 — valid until Dec 2026.', tag: 'Policy', time: '5h ago' },
  { id: 3, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', title: 'ZMW strengthens vs USD', body: 'Rate at K26.8/USD today. Good window to lock in import contracts.', tag: 'Exchange', time: '8h ago' },
];

const ALERTS = [
  { id: 1, icon: AlertCircle, color: 'text-amber-500', text: 'Compliance renewal due in 14 days', path: '/compliance-tracker' },
  { id: 2, icon: Zap, color: 'text-blue-500', text: '3 new grants match your business profile', path: '/grants-portal' },
  { id: 3, icon: Star, color: 'text-purple-500', text: 'New piece-work opportunities near Lusaka', path: '/gig-board' },
];

const NEXT_STEPS = [
  { id: 1, path: '/registration-guide', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Formalise Your Business', desc: 'Follow the PACRA step-by-step guide to register your business name.', tag: 'Business' },
  { id: 2, path: '/skill-profile-builder', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Build Your Skill Profile', desc: 'Map your strengths to unlock career matches and job opportunities.', tag: 'Career' },
  { id: 3, path: '/grants-portal', icon: Lightbulb, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Find Available Grants', desc: 'K3.2M in Zambian grants are open for applications right now.', tag: 'Funding' },
];

const JOURNEY_ENGINES = [
  { key: 'business', label: 'Business', icon: TrendingUp, barColor: 'bg-blue-500', trackColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400', path: '/engine/business', totalModules: 6, storageKey: 'impunga_visited_business' },
  { key: 'skills', label: 'Career', icon: GraduationCap, barColor: 'bg-purple-500', trackColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600 dark:text-purple-400', path: '/engine/skills', totalModules: 7, storageKey: 'impunga_visited_skills' },
  { key: 'finance', label: 'Funding', icon: DollarSign, barColor: 'bg-emerald-500', trackColor: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-600 dark:text-emerald-400', path: '/engine/finance', totalModules: 3, storageKey: 'impunga_visited_finance' },
];

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const card = 'bg-white dark:bg-[#1e2128] border border-gray-100 dark:border-[#2d3139] rounded-2xl shadow-sm';

export default function Dashboard() {
  const { userProfile, loading } = useAuthStore();
  const [recentRoute, setRecentRoute] = useState(null);
  const [journeyProgress, setJourneyProgress] = useState({ business: 0, skills: 0, finance: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load all data from localStorage (instant — no async needed)
    try {
      const stored = localStorage.getItem('impunga_last_route');
      if (stored) {
        const { path, time } = JSON.parse(stored);
        const title = ROUTE_LABELS[path];
        if (title) setRecentRoute({ path, title, time });
      }
    } catch {}

    const progress = {};
    JOURNEY_ENGINES.forEach(({ key, storageKey, totalModules }) => {
      try {
        const visited = JSON.parse(localStorage.getItem(storageKey) || '[]');
        progress[key] = Math.min(100, Math.round((visited.length / totalModules) * 100));
      } catch { progress[key] = 0; }
    });
    setJourneyProgress(progress);
    setReady(true);
  }, []);

  const firstName = getFirstName(userProfile?.fullName || '');

  if (!ready || loading) {
    return (
      <div className="pb-28 space-y-4 px-1 sm:px-2 pt-2">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-28 space-y-4 px-1 sm:px-2 pt-2">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#e8eaed] tracking-tight">
          {getGreeting()}, {firstName || 'there'}!
        </h1>
        <p className="text-gray-400 dark:text-[#9aa0a6] text-sm mt-1 font-medium">Here's your briefing for today.</p>
      </div>

      {/* Recent Activity */}
      {recentRoute ? (
        <Link to={recentRoute.path} className={`flex items-center gap-4 ${card} p-4 hover:shadow-md hover:border-primary/20 dark:hover:border-primary/40 transition-all group`}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 dark:text-[#9aa0a6] uppercase tracking-wider mb-0.5">Continue where you left off</p>
            <p className="text-sm font-bold text-gray-800 dark:text-[#e8eaed] truncate">{recentRoute.title}</p>
            <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-0.5">{timeAgo(recentRoute.time)}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors shrink-0" />
        </Link>
      ) : (
        <div className={`flex items-center gap-4 ${card} p-4`}>
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#252830] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-[#9aa0a6] uppercase tracking-wider mb-0.5">Recent Activity</p>
            <p className="text-sm text-gray-500 dark:text-[#9aa0a6]">Start exploring a module — it'll show here next time.</p>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-extrabold text-gray-500 dark:text-[#9aa0a6] uppercase tracking-wider">Alerts</h2>
          <span className="text-[11px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-full">{ALERTS.length} new</span>
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-[#252830]">
          {ALERTS.map(({ id, icon: Icon, color, text, path }) => (
            <li key={id}>
              <Link to={path} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors group">
                <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-snug">{text}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Zambia Economic Intelligence */}
      <div>
        <h2 className="text-[11px] font-extrabold text-gray-500 dark:text-[#9aa0a6] uppercase tracking-wider mb-3 px-1">Zambia Economic Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ECONOMIC_INTEL.map(({ id, icon: Icon, color, bg, title, body, tag, time }) => (
            <div key={id} className={`${card} p-4 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#9aa0a6] uppercase">{time}</span>
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-[#e8eaed] leading-snug">{title}</p>
              <p className="text-xs text-gray-500 dark:text-[#9aa0a6] leading-relaxed flex-1">{body}</p>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full self-start ${bg} ${color}`}>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Progress */}
      <div className={`${card} p-4`}>
        <h2 className="text-[11px] font-extrabold text-gray-500 dark:text-[#9aa0a6] uppercase tracking-wider mb-4">Your Journey Progress</h2>
        <div className="space-y-4">
          {JOURNEY_ENGINES.map(({ key, label, icon: Icon, barColor, trackColor, textColor, path, totalModules }) => {
            const pct = journeyProgress[key] ?? 0;
            const visited = Math.round((pct / 100) * totalModules);
            return (
              <Link key={key} to={path} className="block group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${textColor}`} />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-[#9aa0a6] font-semibold">{visited}/{totalModules} modules</span>
                </div>
                <div className={`h-2 rounded-full ${trackColor} overflow-hidden`}>
                  <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: pct === 0 ? '3%' : `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div>
        <h2 className="text-[11px] font-extrabold text-gray-500 dark:text-[#9aa0a6] uppercase tracking-wider mb-3 px-1">Recommended Next Steps</h2>
        <div className="space-y-3">
          {NEXT_STEPS.map(({ id, path, icon: Icon, color, bg, label, desc }) => (
            <Link key={id} to={path} className={`flex items-center gap-4 ${card} p-4 hover:shadow-md transition-all group`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-[#e8eaed]">{label}</p>
                <p className="text-xs text-gray-500 dark:text-[#9aa0a6] leading-snug mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

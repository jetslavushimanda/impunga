import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb, Building2, FileText, Target, Sparkles,
  Calculator, Receipt, ShoppingCart, BookOpen,
  DollarSign, Share2, MessageCircle,
  Bot, GraduationCap,
  ArrowRight, Sprout, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useFirestore } from '../hooks/useFirestore';
import { getGreeting, getFirstName, getDaysSince } from '../lib/utils';
import { getDailyTip } from '../data/dailyTips';
import { PageLoader } from '../components/shared/LoadingSpinner';

const CATEGORIES = [
  {
    label: 'Get Started',
    color: '#F39C12',
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-l-yellow-400',
    modules: [
      { path: '/idea-validator', icon: Lightbulb, name: 'Idea Validator', desc: 'Test if your idea works in Zambia' },
      { path: '/registration-guide', icon: Building2, name: 'Registration Guide', desc: 'Step-by-step PACRA and ZRA guide' },
    ],
  },
  {
    label: 'Build Your Business',
    color: '#1B4F72',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-l-blue-400',
    modules: [
      { path: '/business-plan', icon: FileText, name: 'Business Plan Builder', desc: 'Build and download your plan as PDF' },
      { path: '/swot-analysis', icon: Target, name: 'SWOT Analysis', desc: 'Analyse strengths and opportunities' },
      { path: '/name-generator', icon: Sparkles, name: 'Name Generator', desc: 'AI generates Zambian business names' },
    ],
  },
  {
    label: 'Money and Finance',
    color: '#1E8449',
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-l-green-400',
    modules: [
      { path: '/pricing-calculator', icon: Calculator, name: 'Pricing Calculator', desc: 'Calculate true costs and profit margins' },
      { path: '/business-ledger', icon: BookOpen, name: 'Business Ledger', desc: 'Track sales, expenses and debtors' },
      { path: '/invoice-generator', icon: Receipt, name: 'Invoice Generator', desc: 'Create professional Kwacha invoices' },
      { path: '/market-prices', icon: ShoppingCart, name: 'Market Prices', desc: 'Current prices across Zambian markets' },
    ],
  },
  {
    label: 'Grow and Market',
    color: '#7D3C98',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-l-purple-400',
    modules: [
      { path: '/funding-finder', icon: DollarSign, name: 'Funding Finder', desc: '25+ real Zambian funding sources' },
      { path: '/social-media', icon: Share2, name: 'Social Media Generator', desc: 'AI writes your marketing posts' },
      { path: '/whatsapp-templates', icon: MessageCircle, name: 'WhatsApp Templates', desc: 'Professional business messages' },
    ],
  },
];

function ModuleCard({ path, icon: Icon, name, desc, bg, text, border }) {
  return (
    <Link
      to={path}
      className={`group flex flex-col gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${text}`} />
        </div>
        <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0" />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm leading-tight">{name}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-snug">{desc}</p>
      </div>
    </Link>
  );
}

function FullWidthCard({ path, icon: Icon, name, desc, bg, text, badge }) {
  return (
    <Link
      to={path}
      className="group flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 col-span-2"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-gray-800">{name}</p>
            {badge && <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
          <p className="text-gray-400 text-sm">{desc}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
    </Link>
  );
}

export default function Dashboard() {
  const { user, userProfile, loading } = useAuthStore();
  const { getUserDocumentCount } = useFirestore();
  const [counts, setCounts] = useState({ ideas: 0, plans: 0, calcs: 0, funding: 0 });
  const [tipIndex, setTipIndex] = useState(0);
  const tip = getDailyTip(tipIndex);

  useEffect(() => {
    if (!user) return;
    async function loadCounts() {
      const [ideas, plans, calcs, funding] = await Promise.all([
        getUserDocumentCount('businessIdeas'),
        getUserDocumentCount('businessPlans'),
        getUserDocumentCount('pricingCalculations'),
        getUserDocumentCount('bookmarkedFunding'),
      ]);
      setCounts({ ideas, plans, calcs, funding });
    }
    loadCounts();
  }, [user]);

  if (loading) return <PageLoader />;

  const firstName = getFirstName(userProfile?.fullName || '');
  const daysSince = getDaysSince(userProfile?.createdAt);

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-fade-in">

      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #1E8449 100%)' }}>
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">{userProfile?.fullName || 'Entrepreneur'}</h1>
          <p className="text-blue-200 text-sm mt-1">Plant Your Idea. Grow Your Business.</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">Day {daysSince + 1} on IMPUNGA</span>
            {userProfile?.province && <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">{userProfile.province}</span>}
          </div>
        </div>
        <Sprout className="absolute right-4 top-4 w-16 h-16 text-white/10" />
      </div>

      {/* Quick Stats 2x2 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Ideas Validated', value: counts.ideas, color: 'text-yellow-600', border: 'border-l-yellow-400' },
          { label: 'Business Plans', value: counts.plans, color: 'text-blue-600', border: 'border-l-blue-400' },
          { label: 'Pricing Done', value: counts.calcs, color: 'text-green-600', border: 'border-l-green-400' },
          { label: 'Funding Saved', value: counts.funding, color: 'text-purple-600', border: 'border-l-purple-400' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${border}`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily Tip Card */}
      <div className="rounded-2xl p-4 mb-6 border border-yellow-200" style={{ background: '#FFFBEB' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">Tip of the Day — {tip.category}</p>
              <p className="font-semibold text-gray-800 text-sm">{tip.title}</p>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">{tip.tip}</p>
            </div>
          </div>
          <button onClick={() => setTipIndex(i => i + 1)} className="shrink-0 text-xs font-bold text-yellow-600 hover:text-yellow-800 flex items-center gap-1 mt-1 whitespace-nowrap">
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Categorised Module Grid */}
      {CATEGORIES.map(({ label, bg, text, border, modules }) => (
        <div key={label} className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{label}</h2>
          <div className="grid grid-cols-2 gap-3">
            {modules.map(mod => (
              <ModuleCard key={mod.path} {...mod} bg={bg} text={text} border={border} />
            ))}
          </div>
        </div>
      ))}

      {/* AI Powered — Full Width */}
      <div className="mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Powered</h2>
        <div className="grid grid-cols-2 gap-3">
          <FullWidthCard
            path="/ai-advisor"
            icon={Bot}
            name="AI Business Advisor"
            desc="Your personal AI mentor available 24 hours a day"
            bg="bg-orange-50"
            text="text-orange-600"
            badge="Premium"
          />
        </div>
      </div>

      {/* Business Quiz — Full Width */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Test Your Knowledge</h2>
        <div className="grid grid-cols-2 gap-3">
          <FullWidthCard
            path="/business-quiz"
            icon={GraduationCap}
            name="Business Quiz"
            desc="20 questions on Zambian entrepreneurship knowledge"
            bg="bg-indigo-50"
            text="text-indigo-600"
          />
        </div>
      </div>
    </div>
  );
}

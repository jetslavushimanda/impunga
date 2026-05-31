import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb, Building2, FileText, Calculator,
  DollarSign, Bot, TrendingUp, ArrowRight, Sprout
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useFirestore } from '../hooks/useFirestore';
import { getGreeting, getFirstName, getDaysSince, formatDate } from '../lib/utils';
import { getDailyTip } from '../data/dailyTips';
import { PageLoader } from '../components/shared/LoadingSpinner';

const MODULES = [
  { path: '/idea-validator', icon: Lightbulb, name: 'Idea Validator', desc: 'Test if your business idea works in Zambia', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { path: '/registration-guide', icon: Building2, name: 'Registration Guide', desc: 'Step-by-step PACRA and ZRA registration', color: 'text-blue-500', bg: 'bg-blue-50' },
  { path: '/business-plan', icon: FileText, name: 'Business Plan Builder', desc: 'Build and download your business plan PDF', color: 'text-green-500', bg: 'bg-green-50' },
  { path: '/pricing-calculator', icon: Calculator, name: 'Pricing Calculator', desc: 'Price correctly and actually make profit', color: 'text-purple-500', bg: 'bg-purple-50' },
  { path: '/funding-finder', icon: DollarSign, name: 'Funding Finder', desc: '25+ real Zambian funding sources', color: 'text-accent-gold', bg: 'bg-yellow-50' },
  { path: '/ai-advisor', icon: Bot, name: 'AI Business Advisor', desc: 'Chat with your Gemini AI business mentor', color: 'text-primary', bg: 'bg-blue-50' },
  { path: '/growth-tracker', icon: TrendingUp, name: 'Growth Tracker', desc: 'Track revenue, profit and milestones', color: 'text-accent-green', bg: 'bg-green-50' },
];

export default function Dashboard() {
  const { user, userProfile, loading } = useAuthStore();
  const { getUserDocumentCount } = useFirestore();
  const [counts, setCounts] = useState({ ideas: 0, plans: 0, calcs: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const { getUserDocuments } = useFirestore();
  const tip = getDailyTip();

  useEffect(() => {
    if (!user) return;
    async function loadCounts() {
      const [ideas, plans, calcs] = await Promise.all([
        getUserDocumentCount('businessIdeas'),
        getUserDocumentCount('businessPlans'),
        getUserDocumentCount('pricingCalculations'),
      ]);
      setCounts({ ideas, plans, calcs });
    }
    async function loadActivity() {
      const [ideas, plans] = await Promise.all([
        getUserDocuments('businessIdeas', 'createdAt', 3),
        getUserDocuments('businessPlans', 'createdAt', 2),
      ]);
      const merged = [
        ...ideas.map(i => ({ type: 'idea', text: `Validated: "${i.ideaText?.substring(0, 40)}..."`, date: i.createdAt })),
        ...plans.map(p => ({ type: 'plan', text: `Business plan: ${p.businessName}`, date: p.createdAt })),
      ].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)).slice(0, 5);
      setRecentActivity(merged);
    }
    loadCounts();
    loadActivity();
  }, [user]);

  if (loading) return <PageLoader />;

  const firstName = getFirstName(userProfile?.fullName || '');
  const daysSince = getDaysSince(userProfile?.createdAt);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Welcome card */}
      <div className="card bg-gradient-to-r from-primary to-primary-light text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold mb-2">{userProfile?.fullName || 'Entrepreneur'}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              {userProfile?.province && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full">{userProfile.province}, {userProfile.district}</span>
              )}
              {userProfile?.occupation && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full capitalize">{userProfile.occupation}</span>
              )}
              <span className="bg-white/20 px-2 py-0.5 rounded-full">Day {daysSince + 1} on IMPUNGA</span>
            </div>
          </div>
          <Sprout className="w-10 h-10 text-accent-gold opacity-80 hidden sm:block" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Ideas Validated', value: counts.ideas },
          { label: 'Business Plans', value: counts.plans },
          { label: 'Pricing Done', value: counts.calcs },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">Your Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {MODULES.map(({ path, icon: Icon, name, desc, color, bg }) => (
          <Link key={path} to={path} className="module-card group">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors mt-auto self-end" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity yet. Start with the Idea Validator!</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-gray-700 flex-1">{item.text}</span>
                  <span className="text-gray-400 text-xs whitespace-nowrap">{formatDate(item.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daily tip */}
        <div className="card border-l-4 border-accent-gold">
          <div className="flex items-start gap-2 mb-2">
            <span className="badge bg-yellow-100 text-yellow-800">{tip.category}</span>
          </div>
          <h3 className="font-bold text-gray-800 mb-1">{tip.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{tip.tip}</p>
          <p className="text-primary text-xs font-semibold">→ {tip.action}</p>
        </div>
      </div>
    </div>
  );
}

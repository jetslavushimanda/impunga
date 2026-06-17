import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb, Building2, FileText, Target, Sparkles,
  Calculator, Receipt, ShoppingCart, BookOpen,
  DollarSign, Share2, MessageCircle,
  Bot, GraduationCap, User, Briefcase,
  ArrowRight, Sprout, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useFirestore } from '../hooks/useFirestore';
import { getGreeting, getFirstName, getDaysSince } from '../lib/utils';
import { getDailyTip } from '../data/dailyTips';
import { PageLoader } from '../components/shared/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { CAREERS } from './CareerMatches';

const SECTION_1_MODULES = [
  { path: '/idea-validator', icon: Lightbulb, name: 'Idea Validator', desc: 'Test if your idea works in Zambia', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-l-yellow-400' },
  { path: '/business-plan', icon: FileText, name: 'Business Plan Builder', desc: 'Build and download your plan as PDF', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
  { path: '/pricing-calculator', icon: Calculator, name: 'Pricing Calculator', desc: 'Calculate true costs and profit margins', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
  { path: '/funding-finder', icon: DollarSign, name: 'Funding Finder', desc: '25+ real Zambian funding sources', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400' },
  { path: '/ai-advisor', icon: Bot, name: 'AI Business Advisor', desc: 'Your personal AI mentor available 24 hours a day', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-400' },
  { path: '/invoice-generator', icon: Receipt, name: 'Invoice Generator', desc: 'Create professional Kwacha invoices', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
  { path: '/registration-guide', icon: Building2, name: 'Registration Guide', desc: 'Step-by-step PACRA and ZRA guide', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-l-yellow-400' },
  { path: '/swot-analysis', icon: Target, name: 'SWOT Analysis', desc: 'Analyse strengths and opportunities', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
  { path: '/name-generator', icon: Sparkles, name: 'Business Name Generator', desc: 'AI generates Zambian business names', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
  { path: '/business-ledger', icon: BookOpen, name: 'Business Ledger', desc: 'Track sales, expenses and debtors', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
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

function ComingSoonCard({ icon: Icon, name, desc }) {
  return (
    <div
      className="flex flex-col gap-3 bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 border-l-gray-300 opacity-70 cursor-not-allowed"
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 bg-gray-200/50 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-[10px] bg-gray-200/80 text-gray-500 font-semibold px-2 py-0.5 rounded-full">Coming Soon</span>
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm leading-tight">{name}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, userProfile, loading, selectedPath, setSelectedPath } = useAuthStore();
  const { updateProfile } = useAuth();
  const { getUserDocumentCount, getDocument } = useFirestore();
  const [counts, setCounts] = useState({ ideas: 0, plans: 0, calcs: 0, funding: 0 });
  const [skillsStats, setSkillsStats] = useState({
    skillsCount: 0,
    topMatch: 'None',
    matchScore: '0%',
    missingSkills: 0
  });
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

    async function loadSkillsStats() {
      try {
        const profile = await getDocument('skillProfiles', user.uid);
        if (profile) {
          const userSkills = profile.selectedSkills || [];
          // Calculate matches using the same algorithm
          const scored = CAREERS.map(career => {
            const matched = career.requiredSkills.filter(skill => userSkills.includes(skill));
            const missing = career.requiredSkills.filter(skill => !userSkills.includes(skill));
            const totalRequired = career.requiredSkills.length;
            const baseScore = totalRequired > 0 ? (matched.length / totalRequired) * 100 : 0;
            
            let bonus = 0;
            if (career.sector === profile.topIndustry) {
              bonus += 20;
            }
            if (career.sector === profile.secondIndustry) {
              bonus += 10;
            }
            
            const score = Math.min(100, Math.round(baseScore + bonus));
            return { name: career.name, score, missing };
          });
          
          scored.sort((a, b) => b.score - a.score);
          
          if (scored.length > 0) {
            setSkillsStats({
              skillsCount: userSkills.length,
              topMatch: scored[0].name,
              matchScore: `${scored[0].score}%`,
              missingSkills: scored[0].missing.length
            });
          }
        }
      } catch (err) {
        console.error('Failed to load skills stats:', err);
      }
    }

    loadCounts();
    loadSkillsStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleUnlock() {
    try {
      await updateProfile({ selectedPath: 'both' });
      setSelectedPath('both');
    } catch (err) {
      console.error('Failed to unlock path:', err);
    }
  }

  if (loading) return <PageLoader />;

  const firstName = getFirstName(userProfile?.fullName || '');
  const daysSince = getDaysSince(userProfile?.createdAt);
  const currentPath = selectedPath || userProfile?.selectedPath || 'both';

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-fade-in">

      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #1E8449 100%)' }}>
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">{userProfile?.fullName || 'Entrepreneur'}</h1>
          <p className="text-blue-100 text-xs font-medium mt-0.5">Zambia's Economic Intelligence Platform</p>
          <p className="text-blue-200 text-sm mt-1">Start. Match. Build Zambia.</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">Day {daysSince + 1} on IMPUNGA</span>
            {userProfile?.province && <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">{userProfile.province}</span>}
          </div>
        </div>
        <Sprout className="absolute right-4 top-4 w-16 h-16 text-white/10" />
      </div>

      {/* Dynamic Summary Cards */}
      {(currentPath === 'engine1' || currentPath === 'both') && (
        <div className="mb-5">
          {currentPath === 'both' && (
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Business Summary</h3>
          )}
          <div className="grid grid-cols-2 gap-3">
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
        </div>
      )}

      {(currentPath === 'engine2' || currentPath === 'both') && (
        <div className="mb-5">
          {currentPath === 'both' && (
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4 px-1">Skills Summary</h3>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Skills Registered', value: skillsStats.skillsCount, color: 'text-blue-600', border: 'border-l-blue-400' },
              { label: 'Top Career Match', value: skillsStats.topMatch, color: 'text-purple-600', border: 'border-l-purple-400', isText: true },
              { label: 'Top Match Score', value: skillsStats.matchScore, color: 'text-green-600', border: 'border-l-green-400' },
              { label: 'Missing Skills', value: skillsStats.missingSkills, color: 'text-orange-600', border: 'border-l-orange-400' },
            ].map(({ label, value, color, border, isText }) => (
              <div key={label} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${border} flex flex-col justify-between`}>
                <p className={`font-bold ${color} ${isText ? 'text-xs sm:text-sm leading-snug line-clamp-2 h-10 flex items-center' : 'text-3xl'}`}>
                  {value}
                </p>
                <p className="text-gray-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Engine 1 — Start Your Business */}
      {(currentPath === 'engine1' || currentPath === 'both') && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
            Engine 1 — Start Your Business
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {SECTION_1_MODULES.map(mod => (
              <ModuleCard key={mod.path} {...mod} />
            ))}
          </div>
        </div>
      )}

      {/* Engine 2 — Match Your Skills */}
      {(currentPath === 'engine2' || currentPath === 'both') && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
            Engine 2 — Match Your Skills
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ModuleCard
              path="/skill-profile-builder"
              icon={User}
              name="Skill Profile Builder"
              desc="Build your professional skill portfolio"
              bg="bg-blue-50"
              text="text-blue-600"
              border="border-l-blue-400"
            />
            <ModuleCard
              path="/career-matches"
              icon={Briefcase}
              name="Career Matches"
              desc="Match your skills with Zambian job opportunities"
              bg="bg-purple-50"
              text="text-purple-600"
              border="border-l-purple-400"
            />
          </div>
        </div>
      )}

      {/* Unlock banners */}
      {currentPath === 'engine1' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div>
            <p className="font-bold text-gray-800 text-sm">Want to match your skills too?</p>
            <p className="text-gray-500 text-xs mt-0.5">Switch to full access to unlock career matching tools.</p>
          </div>
          <button
            onClick={handleUnlock}
            className="btn-primary text-xs py-2 px-4 whitespace-nowrap min-h-[36px]"
          >
            Unlock Engine 2
          </button>
        </div>
      )}

      {currentPath === 'engine2' && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div>
            <p className="font-bold text-gray-800 text-sm">Want to start a business too?</p>
            <p className="text-gray-500 text-xs mt-0.5">Switch to full access to unlock entrepreneurship tools.</p>
          </div>
          <button
            onClick={handleUnlock}
            className="btn-green text-xs py-2 px-4 whitespace-nowrap min-h-[36px]"
          >
            Unlock Engine 1
          </button>
        </div>
      )}
    </div>
  );
}

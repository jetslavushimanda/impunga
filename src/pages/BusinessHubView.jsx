import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Briefcase, ChevronRight, CheckCircle2, Lightbulb, Sparkles, ArrowRight, Trash2, Target, FileText, Presentation, Share2, Calculator, Building2, FolderOpen, X, Handshake, DollarSign } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';
import useAuthStore from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { ModuleCard } from './EngineView'; 
import LoadingSpinner from '../components/shared/LoadingSpinner';

const STARTUP_TOOLS = [
  {
    path: '/name-generator',
    icon: Sparkles,
    name: 'Name Generator',
    desc: 'Generate catchy, brandable business names tailored for Zambia.',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'AI Brand Engine'
  },
  {
    path: '/swot-analysis',
    icon: Target,
    name: 'SWOT Analysis',
    desc: 'Assess your strengths, weaknesses, opportunities, and threats.',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    badge: 'Strategy'
  },
  {
    path: '/business-plan',
    icon: FileText,
    name: 'Business Plan',
    desc: 'Generate a structured business plan outline and strategic roadmap.',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    badge: 'Roadmap'
  },
  {
    path: '/registration-guide',
    icon: Building2,
    name: 'PACRA Setup Guide',
    desc: 'Step-by-step instructions for formalising your business in Zambia.',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    badge: 'Compliance'
  },
  {
    path: '/pitch-deck',
    icon: Presentation,
    name: 'Pitch Deck Generator',
    desc: 'Structure a compelling presentation for potential investors or partners.',
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-600',
    badge: 'Investor Ready'
  },

  {
    path: '/pricing-calculator',
    icon: Calculator,
    name: 'Pricing Calculator',
    desc: 'Determine unit economics, cost structures, and optimal pricing.',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'Financials ZMW'
  }
];



function SectionHeader({ title, description, icon: Icon, badge, gradient = "from-indigo-500 to-purple-600", rightAction }) {
  return (
    <div className="relative pb-6 mb-8 border-b border-gray-200/60 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
      {/* Very subtle ambient background glow */}
      <div className={`absolute -left-10 -top-10 w-48 h-48 bg-gradient-to-br ${gradient} opacity-[0.03] blur-3xl rounded-full pointer-events-none`} />
      
      <div className="relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
            {badge}
          </div>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/10`}>
              <Icon className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 tracking-tight pb-0.5">
            {title}
          </h1>
        </div>
        <p className="text-gray-500 font-medium text-sm mt-2 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
      
      {rightAction && (
        <div className="relative z-10 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          {rightAction}
        </div>
      )}
    </div>
  );
}

export default function BusinessHubView() {
  const { userProfile } = useAuthStore();
  const { updateProfile } = useAuth();
  const { getUserDocuments, deleteDocument } = useFirestore();
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'paths';
  
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [showSavedBlueprints, setShowSavedBlueprints] = useState(false);

  useEffect(() => {
    if (view === 'ideation') {
      loadSavedIdeas();
    }
  }, [view]);

  async function loadSavedIdeas() {
    setLoadingIdeas(true);
    try {
      const ideas = await getUserDocuments('businessIdeas');
      // Sort by newest
      setSavedIdeas(ideas.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Failed to load saved ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function handleDeleteIdea(id, e) {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this saved blueprint?')) {
      try {
        await deleteDocument('businessIdeas', id);
        loadSavedIdeas();
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleReopenIdea(idea) {
    const wd = idea.wizardData || {
      businessType: 'other',
      problem: idea.ideaText || '',
      solution: '',
      budget: 'Under K5,000',
      location: 'Lusaka',
      extraInfo: ''
    };

    const compiledIdeaText = "Business Type: " + wd.businessType + "\nProblem: " + wd.problem + "\nSolution: " + wd.solution + "\nBudget: " + wd.budget + "\nLocation: " + wd.location + (wd.extraInfo ? "\nExtra: " + wd.extraInfo : "");

    localStorage.setItem('impunga_idea_pipeline', JSON.stringify({
      ideaText: compiledIdeaText,
      aiAnalysis: JSON.stringify(idea.result || {}, null, 2),
      viabilityScore: idea.score || 0,
      location: wd.location,
      budget: wd.budget,
      businessType: wd.businessType,
      timestamp: Date.now(),
      savedResult: idea.result || {},
      savedWizardData: wd
    }));
    navigate('/idea-validator');
  }

  const setView = (v) => {
    if (v === 'paths') {
      setSearchParams({});
    } else {
      setSearchParams({ view: v });
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('Growth Pro');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [momoProvider, setMomoProvider] = useState('mtn');
  const [momoPhone, setMomoPhone] = useState('');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [paymentMessage, setPaymentMessage] = useState('');
  
  // Registration form state
  const [formData, setFormData] = useState({
    businessName: '',
    sector: '',
    isRegistered: 'no'
  });

  const businessEngine = ENGINE_MODULES.business;

  function handlePathBClick() {
    if (userProfile?.businessProfile) {
      setView('operations');
    } else {
      setView('registration');
    }
  }

  function handleStep1Submit(e) {
    e.preventDefault();
    setRegistrationStep(2);
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const messages = [
      "Connecting to Kwacha Mobile Money gateway...",
      "Sending USSD push request to " + (paymentMethod === 'momo' ? momoPhone : 'card processor') + "...",
      "Authorizing subscription transaction...",
      "Payment received! Setting up your operational tools..."
    ];
    
    for (let i = 0; i < messages.length; i++) {
      setPaymentMessage(messages[i]);
      await new Promise(r => setTimeout(r, 900));
    }
    
    try {
      await updateProfile({ 
        businessProfile: { 
          ...formData, 
          subscriptionPlan: selectedPlan,
          subscriptionActive: true,
          subscriptionDate: Date.now()
        } 
      });
      setView('operations');
    } catch (error) {
      console.error('Failed to register business profile:', error);
    } finally {
      setIsSubmitting(false);
      setRegistrationStep(1);
    }
  }

  return (
    <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto pb-24 animate-fade-in px-2 sm:px-4">
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          onClick={(e) => {
            if (view !== 'paths') {
              e.preventDefault();
              setView('paths');
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {view === 'paths' ? 'Back to Home' : 'Back to Business Hub'}
        </Link>
      </div>

      {view === 'paths' && (
        <div className="animate-slide-up">
          <SectionHeader 
            title="Business Hub" 
            description="Choose your path. Whether you are just starting out with an idea or managing an existing operation, we have the tools for you."
            icon={Building2}
            gradient="from-blue-600 to-indigo-600"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            {/* Path A */}
            <button 
              onClick={() => setView('ideation')}
              className="group text-left bg-white rounded-2xl p-6 border border-gray-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-blue-300 hover:bg-blue-50/10 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between cursor-pointer w-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Rocket className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Start a Business</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">I have an idea or need guidance on how to start a business in Zambia.</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4 w-full">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-wide">Explore Tools</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Path B */}
            <button 
              onClick={handlePathBClick}
              className="group text-left bg-white rounded-2xl p-6 border border-gray-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-indigo-300 hover:bg-indigo-50/10 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between cursor-pointer w-full"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Manage my Business</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">I already have a business and need operational tools to run it.</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4 w-full">
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-wide">Enter Workspace</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>
        </div>
      )}

      {view === 'ideation' && (
        <div className="animate-fade-in relative z-0">
          <SectionHeader 
            title="Start a Business" 
            description="Everything you need to validate your idea, structure a plan, and prepare for launch."
            icon={Rocket}
            gradient="from-blue-500 to-cyan-500"
          />

          {/* Startup Planning Modules Grid */}
          <div className="animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Validate New Idea */}
              <ModuleCard 
                onClick={() => {
                  localStorage.removeItem('impunga_idea_pipeline');
                  navigate('/idea-validator');
                }}
                icon={Lightbulb}
                name="Validate Idea"
                desc="Run your idea through our AI wizard for a viability score."
                bg="bg-indigo-50"
                text="text-indigo-600"
                badge="AI Wizard"
              />

              {/* Saved Blueprints Folder */}
              <ModuleCard 
                onClick={() => setShowSavedBlueprints(true)}
                icon={FolderOpen}
                name="Saved Blueprints"
                desc="Access and review your previously validated business ideas."
                bg="bg-yellow-50"
                text="text-yellow-600"
                badge="Folder"
              />

              {/* Other Tools */}
              {STARTUP_TOOLS.map((tool) => (
                <ModuleCard key={tool.path} {...tool} />
              ))}
            </div>
          </div>

          {/* Saved Blueprints Modal */}
          {showSavedBlueprints && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => setShowSavedBlueprints(false)}
              />
              
              {/* Modal Content */}
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up border border-white/20">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-yellow-500" /> Saved Blueprints Folder
                  </h3>
                  <button 
                    onClick={() => setShowSavedBlueprints(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
                  {loadingIdeas ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 py-12">
                      Loading saved ideas...
                    </div>
                  ) : savedIdeas.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-gray-300 shadow-sm">
                        <FolderOpen className="w-8 h-8" />
                      </div>
                      <p className="text-gray-500 font-semibold mb-1">Folder is empty</p>
                      <p className="text-sm text-gray-400 max-w-[280px]">Your validated startup ideas and blueprints will show up here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          onClick={() => handleReopenIdea(idea)}
                          className="group cursor-pointer p-4 bg-white hover:bg-indigo-50/50 border border-gray-100 hover:border-indigo-100/80 rounded-2xl transition-all duration-300 flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-bold text-sm text-gray-900 uppercase tracking-wide truncate max-w-[200px]">
                                {idea.wizardData?.businessType || 'General Idea'}
                              </span>
                              <span className="text-xs text-gray-400 font-semibold">
                                {new Date(idea.timestamp || Date.now()).toLocaleDateString('en-GB')}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-auto shrink-0 ${idea.verdict === 'PROCEED' ? 'bg-green-100 text-green-700 border border-green-200' : idea.verdict === 'REFINE' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                {idea.verdict || 'NEW'}
                              </span>
                              <span className="text-xs font-black text-indigo-700 bg-indigo-50/80 border border-indigo-100/40 px-2.5 py-1 rounded-full shrink-0">
                                {idea.score}/10
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium truncate">
                              {idea.wizardData?.solution || 'No description provided'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0 pl-2">
                            <button
                              onClick={(e) => handleDeleteIdea(idea.id, e)}
                              className="p-2 hover:bg-red-50 hover:text-red-500 text-gray-300 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'registration' && (
        <div className="max-w-xl mx-auto bg-white/95 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] p-8 sm:p-10 relative overflow-hidden animate-slide-up mt-8">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-100 rounded-full pointer-events-none" />
          
          {registrationStep === 1 ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 relative z-10">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-3 relative z-10">Step 1: Workspace Profile</h2>
              <p className="text-center text-gray-500 font-medium mb-10 relative z-10">
                Before accessing the operational tools, please tell us about your business.
              </p>

              <form onSubmit={handleStep1Submit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business or Project Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                    className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm"
                    placeholder="e.g. Kalulu Farms"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Sector</label>
                  <select 
                    required
                    value={formData.sector}
                    onChange={e => setFormData({...formData, sector: e.target.value})}
                    className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a sector...</option>
                    <option value="agriculture">Agriculture & Farming</option>
                    <option value="retail">Retail & Trade</option>
                    <option value="services">Professional Services</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="tech">Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Is it registered with PACRA?</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="registered" 
                        value="yes"
                        checked={formData.isRegistered === 'yes'}
                        onChange={e => setFormData({...formData, isRegistered: e.target.value})}
                        className="sr-only peer"
                      />
                      <div className="text-center py-4 border border-gray-200 bg-white/50 backdrop-blur-sm rounded-2xl peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 peer-checked:text-white font-bold text-gray-600 transition-all shadow-sm peer-checked:shadow-lg peer-checked:shadow-indigo-500/30">
                        Yes, Registered
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="registered" 
                        value="no"
                        checked={formData.isRegistered === 'no'}
                        onChange={e => setFormData({...formData, isRegistered: e.target.value})}
                        className="sr-only peer"
                      />
                      <div className="text-center py-4 border border-gray-200 bg-white/50 backdrop-blur-sm rounded-2xl peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-gray-600 peer-checked:to-gray-800 peer-checked:text-white font-bold text-gray-600 transition-all shadow-sm peer-checked:shadow-lg peer-checked:shadow-gray-900/30">
                        Not Yet
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!formData.businessName || !formData.sector}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all mt-6 shadow-lg shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                >
                  Continue to Subscription <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-2 relative z-10">Step 2: Operational Workspace Tier</h2>
              <p className="text-center text-gray-500 text-sm font-medium mb-4 relative z-10">
                Unlock full access to Ledger, SWOT, Invoicing, AI Summaries & KPI tracker.
              </p>

              {/* Premium / Paid tier notice banner */}
              <div className="mb-6 bg-indigo-50/70 border border-indigo-100 text-indigo-950 p-4 rounded-2xl text-xs font-medium leading-relaxed relative z-10 flex items-start gap-2.5">
                <span className="text-base shrink-0 select-none">💡</span>
                <div>
                  <strong className="block mb-0.5 text-indigo-900">Premium Upgrade Screen</strong>
                  This screen demonstrates the paid tier onboarding flow. To view/test the workspace tools without simulated payment details, click the <strong className="text-indigo-700 font-bold">"Bypass with Free Beta Access"</strong> button below.
                </div>
              </div>

              {isSubmitting ? (
                <div className="py-12 flex flex-col items-center justify-center relative z-10 text-indigo-600 animate-fade-in">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 font-bold text-gray-800 animate-pulse text-center">{paymentMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-6 relative z-10">
                  {/* Plan Cards */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select a Plan</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { id: 'Basic Monitor', price: 'K150', desc: 'Financial ledger tracking & invoicing' },
                        { id: 'Growth Pro', price: 'K350', desc: 'KPI tracking, SWOT, AI summaries & Savings' },
                        { id: 'Enterprise Elite', price: 'K950', desc: 'Full suite & custom AI Co-Founder advice' }
                      ].map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedPlan(p.id)}
                          className={`cursor-pointer p-4 border rounded-2xl transition-all flex items-center justify-between ${selectedPlan === p.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-gray-250 hover:border-indigo-300 bg-white'}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-800">{p.id}</span>
                              {p.id === 'Growth Pro' && <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">POPULAR</span>}
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block font-medium">{p.desc}</span>
                          </div>
                          <span className="text-lg font-black text-indigo-700">{p.price}<span className="text-[10px] text-gray-400 font-semibold">/mo</span></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'momo' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        📱 Mobile Money
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        💳 Debit/Credit Card
                      </button>
                    </div>

                    {paymentMethod === 'momo' ? (
                      <div className="space-y-3 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl animate-fade-in">
                        {/* MoMo Provider Logo Toggle */}
                        <div className="flex gap-2">
                          {[
                            { id: 'mtn', label: 'MTN MoMo', color: 'peer-checked:bg-yellow-500 peer-checked:text-white border-yellow-200 text-yellow-600' },
                            { id: 'airtel', label: 'Airtel Money', color: 'peer-checked:bg-red-600 peer-checked:text-white border-red-200 text-red-600' },
                            { id: 'zamtel', label: 'Zamtel Kwacha', color: 'peer-checked:bg-green-600 peer-checked:text-white border-green-200 text-green-600' }
                          ].map(provider => (
                            <label key={provider.id} className="flex-1 cursor-pointer">
                              <input 
                                type="radio" 
                                name="momo_provider" 
                                value={provider.id}
                                checked={momoProvider === provider.id}
                                onChange={e => setMomoProvider(e.target.value)}
                                className="sr-only peer"
                              />
                              <div className={`text-center py-2.5 border bg-white rounded-xl text-xs font-bold transition-all peer-checked:border-transparent peer-checked:shadow-sm ${provider.color}`}>
                                {provider.label}
                              </div>
                            </label>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mobile Money Phone Number</label>
                          <input 
                            required={paymentMethod === 'momo'}
                            type="tel"
                            value={momoPhone}
                            onChange={e => setMomoPhone(e.target.value)}
                            placeholder="e.g. 0961234567"
                            className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cardholder Name</label>
                          <input 
                            required={paymentMethod === 'card'}
                            type="text"
                            value={cardDetails.name}
                            onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                            placeholder="John Doe"
                            className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Card Number</label>
                          <input 
                            required={paymentMethod === 'card'}
                            type="text"
                            value={cardDetails.number}
                            onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                            placeholder="4000 1234 5678 9010"
                            className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expiry Date</label>
                            <input 
                              required={paymentMethod === 'card'}
                              type="text"
                              value={cardDetails.expiry}
                              onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                              placeholder="MM/YY"
                              className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CVV</label>
                            <input 
                              required={paymentMethod === 'card'}
                              type="password"
                              maxLength="3"
                              value={cardDetails.cvv}
                              onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                              placeholder="123"
                              className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setRegistrationStep(1)}
                        className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors active:scale-95"
                      >
                        Back to Step 1
                      </button>
                      <button 
                        type="submit"
                        disabled={paymentMethod === 'momo' ? !momoPhone : (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
                      >
                        Pay & Activate Tier
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={async () => {
                        setIsSubmitting(true);
                        setPaymentMessage("Activating complimentary Beta testing access...");
                        await new Promise(r => setTimeout(r, 1000));
                        try {
                          await updateProfile({ 
                            businessProfile: { 
                              ...formData, 
                              subscriptionPlan: "Beta Trial (Free Access)",
                              subscriptionActive: true,
                              subscriptionDate: Date.now()
                            } 
                          });
                          setView('operations');
                        } catch (error) {
                          console.error('Failed to activate Beta profile:', error);
                        } finally {
                          setIsSubmitting(false);
                          setRegistrationStep(1);
                        }
                      }}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl text-xs transition-colors border border-indigo-200/50"
                    >
                      Bypass with Free Beta Access
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {view === 'operations' && (
        <div className="animate-fade-in">
          <SectionHeader 
            title={userProfile?.businessProfile?.businessName || 'Business Workspace'}
            description="Your operational tools for running and scaling your business."
            icon={Briefcase}
            gradient="from-indigo-600 to-purple-600"
            badge={
              <span className="flex items-center gap-1.5 text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Platform Verified
              </span>
            }
            rightAction={
              <button 
                onClick={() => setView('registration')}
                className="w-full lg:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Edit Profile
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businessEngine.modules.map(mod => (
              <ModuleCard key={mod.path} {...mod} />
            ))}
            
            {/* Community Card (replicated premium style) */}
            <ModuleCard path="/engine/connect" icon={Handshake} name="Community" desc="Find jobs, trade, rent assets, and connect." bg="bg-blue-50" text="text-blue-600" badge="COMMUNITY" badgeColor="blue" />

            {/* Funding & Finance Card (replicated premium style) */}
            <ModuleCard path="/engine/finance" icon={DollarSign} name="Funding & Finance" desc="Institutional Gateway for Grants, Loans & Investment." bg="bg-emerald-50" text="text-emerald-600" badge="GATEWAY" badgeColor="emerald" />
          </div>
        </div>
      )}
    </div>
  );
}

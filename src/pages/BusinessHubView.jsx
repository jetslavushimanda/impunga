import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Briefcase, ChevronRight, CheckCircle2, Lightbulb, Sparkles, ArrowRight, Trash2, Target, FileText, Presentation, Share2, Calculator, Building2, FolderOpen, X, Handshake, DollarSign } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';
import useAuthStore from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { ModuleCard } from './EngineView'; 

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

function StartupModuleCard({ path, onClick, icon: Icon, name, desc, bg, text, badge }) {
  const content = (
    <>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative shrink-0 z-10">
        {/* Glowing background */}
        <div className={`absolute inset-0 opacity-20 blur-md rounded-full ${bg} group-hover:opacity-35 transition-opacity duration-300`} />
        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md border border-white/50 group-hover:scale-105 transition-transform duration-300 ${bg}`}>
          <Icon className={`w-6 h-6 ${text || 'text-gray-700'} drop-shadow-sm`} />
        </div>
      </div>

      <div className="flex-1 min-w-0 relative z-10 text-left">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
            {name}
          </h4>
          {badge && (
            <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 transition-all duration-300 ${badge === 'Folder' ? 'bg-yellow-50/80 text-yellow-600 border-yellow-200/40 group-hover:bg-yellow-500 group-hover:text-white' : 'bg-indigo-50/80 text-indigo-600 border-indigo-100/40 group-hover:bg-indigo-600 group-hover:text-white'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">{desc}</p>
      </div>
      
      {/* Subtle background icon */}
      <div className="absolute -right-2 -bottom-2 w-16 h-16 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-500 text-gray-900">
        <Icon className="w-full h-full" />
      </div>
    </>
  );

  const className = "group relative bg-white/70 backdrop-blur-md overflow-hidden rounded-2xl p-4 flex items-center gap-4 border border-white/80 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(99,102,241,0.08)] hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 w-full";

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link to={path} className={className}>
      {content}
    </Link>
  );
}

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

  async function handleRegister(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ businessProfile: formData });
      setView('operations');
    } catch (error) {
      console.error('Failed to register business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {/* Path A */}
            <button 
              onClick={() => setView('ideation')}
              className="group text-left bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 flex flex-col"
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
              <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-wide">Explore Tools</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Path B */}
            <button 
              onClick={handlePathBClick}
              className="group text-left bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md transition-all duration-200 flex flex-col"
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
              <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
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
              <StartupModuleCard 
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
              <StartupModuleCard 
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
                <StartupModuleCard key={tool.path} {...tool} />
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
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 relative z-10">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-3 relative z-10">Register your Workspace</h2>
          <p className="text-center text-gray-500 font-medium mb-10 relative z-10">
            Before accessing the operational tools, please register your business profile on the IMPUNGA platform.
          </p>

          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
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
              disabled={isSubmitting || !formData.businessName || !formData.sector}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all mt-6 shadow-lg shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'} <CheckCircle2 className="w-6 h-6" />
            </button>
          </form>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessEngine.modules.map(mod => (
              <ModuleCard key={mod.path} {...mod} />
            ))}
            <ModuleCard path="/market-directory" icon={Handshake} name="Marketplace" desc="Trade and connect in the verified directory" bg="bg-blue-50" text="text-blue-600" border="border-l-blue-400" />
            <ModuleCard path="/funding-finder" icon={DollarSign} name="Funding Connect" desc="Institutional Gateway for Grants & Loans" bg="bg-green-50" text="text-green-600" border="border-l-green-400" />
          </div>
        </div>
      )}
    </div>
  );
}

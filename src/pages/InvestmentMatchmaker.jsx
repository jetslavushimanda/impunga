import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, RefreshCw, Briefcase, User, Users, ShieldCheck, Database, FileText, Send, Check, ArrowRight, Target } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import AIResponse from '../components/shared/AIResponse';
import { formatKwachaSimple } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';
import PageHeaderCard from '../components/shared/PageHeaderCard';

// Pre-seeded genuine/realistic Zambian ecosystem players
const SEEDED_PROFILES = [
  {
    role: 'funder',
    name: 'Kukula Capital',
    entityType: 'Venture Capital',
    focusSectors: ['Agriculture and Farming', 'Manufacturing', 'Transport and Logistics'],
    range: 'K250,000 - K2,000,000',
    description: 'Zambia\'s leading private equity and venture capital firm, investing in local high-growth SMEs.',
    email: 'info@kukulacapital.com'
  },
  {
    role: 'funder',
    name: 'Zambia Business Angels Network (ZBAN)',
    entityType: 'Angel Network',
    focusSectors: ['Information Technology', 'Retail and Trade', 'Services'],
    range: 'K50,000 - K250,000',
    description: 'A network of local angel investors seeking early-stage startup opportunities in tech and commerce.',
    email: 'deals@zban.org.zm'
  },
  {
    role: 'founder',
    name: 'Lusaka Fresh Foods Ltd',
    entityType: 'Agri-Tech Startup',
    focusSectors: ['Agriculture and Farming'],
    range: 'K150,000',
    description: 'We are setting up local cold-storage stand networks to distribute vegetables from local farms.',
    email: 'fresh@lusakafoods.zm'
  },
  {
    role: 'founder',
    name: 'Copperbelt Solar Solutions',
    entityType: 'Renewable Startup',
    focusSectors: ['Construction and Infrastructure', 'Manufacturing'],
    range: 'K95,000',
    description: 'Assembling local solar inverters and battery backups to alleviate loadshedding for retail kiosks.',
    email: 'solar@cbtsolutions.zm'
  },
  {
    role: 'vendor',
    name: 'Mosi Digital Agency',
    entityType: 'Tech Vendor',
    focusSectors: ['Information Technology', 'Media and Communications'],
    range: 'Web & E-Commerce Integration',
    description: 'We develop e-commerce systems and integrate MTN MoMo/Airtel Money APIs for SMEs.',
    email: 'hello@mosidigital.com'
  },
  {
    role: 'vendor',
    name: 'Chalo Legal & Audit Helpers',
    entityType: 'Business Consultant',
    focusSectors: ['Finance and Banking', 'Self Employment and Entrepreneurship'],
    range: 'PACRA & ZRA Compliance Support',
    description: 'Offering accounting services, ZRA tax filings, and PACRA company registration assistance.',
    email: 'compliance@chalo.org'
  }
];

export default function InvestmentMatchmaker() {
  const { user } = useAuthStore();
  const { getDocument, addDocument } = useFirestore();
  const { matchFundingSources, loading: aiLoading, error: aiError } = useAI();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('aimatches'); // 'aimatches' or 'hub'
  const [pipelineData, setPipelineData] = useState(null);
  const [fundingContent, setFundingContent] = useState('');

  // Hub Registration form states
  const [hubRole, setHubRole] = useState('founder');
  const [hubName, setHubName] = useState('');
  const [hubEntityType, setHubEntityType] = useState('');
  const [hubSector, setHubSector] = useState('Agriculture and Farming');
  const [hubRange, setHubRange] = useState('');
  const [hubDesc, setHubDesc] = useState('');
  const [hubEmail, setHubEmail] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // User registered profile state
  const [registeredProfile, setRegisteredProfile] = useState(null);
  const [customHubProfiles, setCustomHubProfiles] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('impunga_idea_pipeline');
    if (stored) {
      const data = JSON.parse(stored);
      setPipelineData(data);
      if (!fundingContent && !aiLoading) {
        handleGenerate(data);
      }
    }
    loadRegisteredProfile();
  }, [user]);

  async function loadRegisteredProfile() {
    if (!user) return;
    try {
      const storedLocal = localStorage.getItem(`impunga_hub_profile_${user.uid}`);
      if (storedLocal) {
        const parsed = JSON.parse(storedLocal);
        setRegisteredProfile(parsed);
        setCustomHubProfiles([parsed]);
      }
    } catch (err) {
      console.error('Failed to load registered profile:', err);
    }
  }

  async function handleGenerate(data) {
    if (!data) return;
    try {
      const result = await matchFundingSources(data);
      setFundingContent(result);
    } catch (err) {
      console.error(err);
    }
  }

  const handleRegisterHubProfile = async (e) => {
    e.preventDefault();
    if (!hubName.trim() || !hubEmail.trim() || !hubDesc.trim()) return;

    setIsSubmittingProfile(true);
    const newProfile = {
      role: hubRole,
      name: hubName,
      entityType: hubEntityType || (hubRole === 'founder' ? 'Startup' : hubRole === 'funder' ? 'Investor' : 'Vendor Service'),
      focusSectors: [hubSector],
      range: hubRange || 'Unspecified',
      description: hubDesc,
      email: hubEmail
    };

    try {
      if (user) {
        localStorage.setItem(`impunga_hub_profile_${user.uid}`, JSON.stringify(newProfile));
        setRegisteredProfile(newProfile);
        setCustomHubProfiles([newProfile]);
        show('Successfully registered on Ecosystem Hub!');
      } else {
        show('Please log in to register.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Combine seeded profiles with user registered profile
  const allProfiles = [...customHubProfiles, ...SEEDED_PROFILES];

  // Filters for matching
  const matchingFunders = allProfiles.filter(p => {
    if (p.role !== 'funder') return false;
    if (registeredProfile) {
      if (registeredProfile.role === 'founder') {
        return p.focusSectors.some(sec => registeredProfile.focusSectors.includes(sec));
      }
    }
    if (pipelineData) {
      return p.focusSectors.includes(pipelineData.sector);
    }
    return true;
  });

  const matchingFounders = allProfiles.filter(p => {
    if (p.role !== 'founder') return false;
    if (registeredProfile && registeredProfile.role === 'funder') {
      return registeredProfile.focusSectors.some(sec => p.focusSectors.includes(sec));
    }
    return true;
  });

  const matchingVendors = allProfiles.filter(p => {
    if (p.role !== 'vendor') return false;
    if (registeredProfile && registeredProfile.role === 'founder') {
      // Vendors fit self employment or tech
      return true;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeaderCard 
        title="Investment Matchmaker"
        description="Scan Venture Capital matches for your business model or register to connect directly in the Zambian Funding Ecosystem."
        icon={Target}
        bg="bg-purple-50"
        text="text-purple-600"
        badge="AI MATCH"
        badgeColor="purple"
      />


      {/* Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md mb-8">
        <button
          onClick={() => setActiveTab('aimatches')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'aimatches' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          AI Pitch Matcher
        </button>
        <button
          onClick={() => setActiveTab('hub')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'hub' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Community Connection Hub
        </button>
      </div>

      {activeTab === 'aimatches' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Data Room Checklist */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" /> Data Room Checklist
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Before approaching institutional VC or Angel syndicates, ensure you have these files prepared in a secure drive folder.
              </p>

              <div className="space-y-3">
                {[
                  { id: 'deck', label: '10-Slide Investor Pitch Deck' },
                  { id: 'fin', label: '3-Year Revenue & Expense Projections' },
                  { id: 'plan', label: 'SWOT & Operations Plan' },
                  { id: 'pacra', label: 'PACRA Incorporation Certificate' },
                  { id: 'zra', label: 'Valid ZRA TPIN and Tax Clearance' }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/pitch-deck" className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 text-xs">
                  Generate Pitch Deck <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* AI Matches */}
          <div className="lg:col-span-8">
            {!pipelineData ? (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center py-20">
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Validated Idea Found</h2>
                <p className="text-sm text-gray-400 mb-6">Please validate your business concept inside the Idea Validator to compute custom VC matches.</p>
                <Link to="/idea-validator" className="btn-primary py-3 px-6 bg-purple-600 hover:bg-purple-700">
                  Go to Idea Validator
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-purple-600">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sm font-semibold animate-pulse">Running semantic scan on regional venture funds...</p>
                  </div>
                ) : aiError ? (
                  <ErrorMessage message={aiError} />
                ) : fundingContent ? (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex items-center gap-3 bg-purple-50 text-purple-800 p-4 rounded-xl border border-purple-100">
                      <Banknote className="w-5 h-5 shrink-0 text-purple-600" />
                      <p className="text-xs font-semibold">Matched for: {pipelineData.name} ({pipelineData.sector})</p>
                    </div>

                    <div className="prose prose-purple max-w-none text-sm leading-relaxed text-gray-700">
                      <AIResponse content={fundingContent} />
                    </div>

                    <button onClick={() => handleGenerate(pipelineData)} className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-xl transition-all text-xs">
                      <RefreshCw className="w-4 h-4" /> Refresh VC Scan
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Registration Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
                <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">Register Your Ecosystem Profile</h3>
                
                {registeredProfile ? (
                  <div className="bg-green-50 border border-green-200 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                      <Check className="w-5 h-5 text-green-600" /> Profile Registered
                    </div>
                    <p className="text-xs text-green-700 font-medium">
                      Your profile as a <strong>{registeredProfile.role.toUpperCase()}</strong> ({registeredProfile.name}) is actively listed on the community matching directory.
                    </p>
                    <button
                      onClick={() => setRegisteredProfile(null)}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Edit/Register New Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterHubProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">I want to register as a:</label>
                      <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                        {['founder', 'funder', 'vendor'].map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setHubRole(role)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hubRole === role ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                          >
                            {role.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        {hubRole === 'founder' ? 'Business / Startup Name' : hubRole === 'funder' ? 'Firm / Angel Name' : 'Company Name'}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100"
                        placeholder="e.g. Mosi Agribusiness Solutions"
                        value={hubName}
                        onChange={e => setHubName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Type of Entity / Focus Area</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100"
                        placeholder="e.g. Cooperative, Fintech, Retail Supplier"
                        value={hubEntityType}
                        onChange={e => setHubEntityType(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Primary Industry / Sector</label>
                      <select
                        value={hubSector}
                        onChange={e => setHubSector(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white"
                      >
                        <option>Agriculture and Farming</option>
                        <option>Information Technology</option>
                        <option>Manufacturing</option>
                        <option>Construction and Infrastructure</option>
                        <option>Finance and Banking</option>
                        <option>Self Employment and Entrepreneurship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        {hubRole === 'founder' ? 'Funding Target (ZMW)' : hubRole === 'funder' ? 'Capital Range (ZMW)' : 'Rate / Cost Range'}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100"
                        placeholder="e.g. K100,000 or K50k - K200k"
                        value={hubRange}
                        onChange={e => setHubRange(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Public Email / Contact Link</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100"
                        placeholder="e.g. business@domain.zm"
                        value={hubEmail}
                        onChange={e => setHubEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Brief Overview / Description</label>
                      <textarea
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100 min-h-24"
                        placeholder="Describe your goals, investment focus, or service deliverables..."
                        value={hubDesc}
                        onChange={e => setHubDesc(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs mt-2"
                    >
                      {isSubmittingProfile ? 'Registering...' : 'Register Profile'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Matches & Ecosystem Directory */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Dynamic Matches Section */}
              <div className="bg-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5">
                  <Users className="w-48 h-48 text-white -mt-8 -mr-8" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-purple-300" /> Connection Matches
                </h3>
                
                {registeredProfile ? (
                  <p className="text-xs text-purple-200 mb-4 leading-normal">
                    Based on your registered profile, here are potential partners in Zambia's economic pipeline.
                  </p>
                ) : (
                  <p className="text-xs text-purple-200 mb-4 leading-normal">
                    Register your profile on the left to activate smart matching indicators. Currently displaying general matching data.
                  </p>
                )}

                <div className="space-y-4">
                  {registeredProfile?.role === 'founder' && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-purple-300">Matched Funders for Your Sector</h4>
                      {matchingFunders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {matchingFunders.map((f, i) => (
                            <div key={i} className="bg-white/10 border border-white/20 p-4 rounded-xl text-xs flex justify-between items-start gap-4">
                              <div>
                                <h5 className="font-bold">{f.name} ({f.entityType})</h5>
                                <p className="text-[10px] text-purple-200 mt-1 line-clamp-1">{f.description}</p>
                                <p className="text-[10px] text-green-300 mt-1 font-bold">Invests: {f.range}</p>
                              </div>
                              <a href={`mailto:${f.email}`} className="bg-white text-purple-900 font-bold px-3 py-1.5 rounded-lg shrink-0 hover:bg-purple-100 transition-colors text-[10px]">
                                Contact Funder
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-purple-300">No matching funders found for this sector yet.</p>
                      )}
                    </div>
                  )}

                  {registeredProfile?.role === 'funder' && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-purple-300">Matched Startups seeking capital</h4>
                      {matchingFounders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {matchingFounders.map((f, i) => (
                            <div key={i} className="bg-white/10 border border-white/20 p-4 rounded-xl text-xs flex justify-between items-start gap-4">
                              <div>
                                <h5 className="font-bold">{f.name} ({f.entityType})</h5>
                                <p className="text-[10px] text-purple-200 mt-1 line-clamp-1">{f.description}</p>
                                <p className="text-[10px] text-purple-300 mt-1 font-bold">Target: {f.range}</p>
                              </div>
                              <a href={`mailto:${f.email}`} className="bg-white text-purple-900 font-bold px-3 py-1.5 rounded-lg shrink-0 hover:bg-purple-100 transition-colors text-[10px]">
                                View Proposal
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-purple-300">No startups matching your focus sectors yet.</p>
                      )}
                    </div>
                  )}

                  {registeredProfile?.role === 'founder' && (
                    <div className="space-y-3 mt-4">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-purple-300">Recommended Enterprise Vendors</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {matchingVendors.map((v, i) => (
                          <div key={i} className="bg-white/10 border border-white/20 p-4 rounded-xl text-xs flex justify-between items-start gap-4">
                            <div>
                              <h5 className="font-bold">{v.name} ({v.entityType})</h5>
                              <p className="text-[10px] text-purple-200 mt-1 line-clamp-1">{v.description}</p>
                              <p className="text-[10px] text-purple-300 mt-1 font-bold">Offer: {v.range}</p>
                            </div>
                            <a href={`mailto:${v.email}`} className="bg-white text-purple-900 font-bold px-3 py-1.5 rounded-lg shrink-0 hover:bg-purple-100 transition-colors text-[10px]">
                              Get Quote
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!registeredProfile && (
                    <div className="text-center py-4 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-xs text-purple-200 font-medium">Please register your Founder or Funder details to unlock matches.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* General Directory */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-base">Ecosystem Board</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allProfiles.map((p, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${p.role === 'founder' ? 'bg-blue-50 text-blue-700 border-blue-100' : p.role === 'funder' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                            {p.role}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{p.entityType}</span>
                        </div>
                        <h4 className="font-bold text-gray-950 text-sm">{p.name}</h4>
                        <p className="text-xs text-gray-500 leading-normal line-clamp-3">{p.description}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Metric Range</p>
                          <p className="font-bold text-gray-700">{p.range}</p>
                        </div>
                        <a href={`mailto:${p.email}`} className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
                          <Send className="w-3.5 h-3.5" /> Connect
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* Small Legal Footer Note */}
      <p className="text-center text-[11px] text-gray-400 mt-12">
        Simulated matchmaker directory for educational purposes only. Review our compliance declarations on the <Link to="/agreement" className="underline font-bold text-gray-500 hover:text-primary">Platform Governance & Disclaimers</Link> page.
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, CheckSquare, Square, Download, ChevronDown, ChevronUp, 
  ExternalLink, Globe, Sparkles, Calendar, Clock, AlertTriangle, 
  CheckCircle, Copy, Check, Info, Trash2, ArrowLeft 
} from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { PACRA_STEPS, ZRA_STEPS, BANK_ACCOUNT_STEPS } from '../data/pacraSteps';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';

const QUICK_LINKS = [
  { name: 'PACRA Online Registration', url: 'https://www.pacra.org.zm', desc: 'Register your business online' },
  { name: 'ZRA Taxpayer Portal', url: 'https://www.zra.org.zm', desc: 'Get your TPIN and file taxes' },
  { name: 'CEEC Loans & Grants', url: 'https://www.ceec.org.zm', desc: 'Apply for government funding' },
  { name: 'DBZ Business Loans', url: 'https://www.dbz.co.zm', desc: 'Development Bank of Zambia' },
  { name: 'TEVETA Training Grants', url: 'https://www.teveta.org.zm', desc: 'Skills and business training' },
];

const RECOMMENDER_QUESTIONS = [
  { id: 'partners', q: 'How many people are starting this business?', options: ['Just me', '2-5 partners', '6 or more'] },
  { id: 'goal', q: 'What is your main goal for registering?', options: ['Open a bank account', 'Get contracts / tenders', 'Get funding / loans', 'Protect my business name', 'All of the above'] },
  { id: 'revenue', q: 'Estimated annual revenue?', options: ['Under K50,000', 'K50,000 – K500,000', 'Over K500,000'] },
  { id: 'liability', q: 'Do you want to limit personal liability?', options: ['Yes definitely', 'Not sure', 'Not important to me'] },
  { id: 'social', q: 'Is this a social or community project?', options: ['Yes, mainly community focused', 'Partly', 'No, purely business'] },
];

function recommendStructure(answers) {
  if (answers.social === 'Yes, mainly community focused') return { id: 'cbo', reason: 'A CBO (Community Based Organisation) is ideal for community-focused projects and gives you access to NGO and government donor funding.' };
  if (answers.partners === 'Just me' && answers.liability === 'Not important to me') return { id: 'sole_trader', reason: 'A Sole Trader registration is perfect for a one-person business. It is the cheapest and fastest to register in Zambia at only K220.' };
  if (answers.partners === '2-5 partners' && answers.liability === 'Not important to me') return { id: 'partnership', reason: 'A Partnership registration is right for 2-5 owners sharing the business. It is straightforward and affordable.' };
  if (answers.liability === 'Yes definitely' || answers.revenue === 'Over K500,000' || answers.goal === 'Get funding / loans') return { id: 'private_limited', reason: 'A Private Limited Company gives you limited liability protection, maximum credibility with banks and funders, and the ability to raise investment.' };
  return { id: 'sole_trader', reason: 'Based on your answers, a Sole Trader Business Name registration is the best starting point. You can always upgrade to a Limited Company as your business grows.' };
}

export default function RegistrationGuide() {
  const navigate = useNavigate();
  const { generateRegistrationRoadmap, loading, error } = useAI();

  // Tabs: 'ai-journey' or 'static-comparison'
  const [activeTab, setActiveTab] = useState('ai-journey');

  // Input states for AI generation
  const [businessName, setBusinessName] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('Lusaka');

  // AI Generated Roadmap
  const [roadmap, setRoadmap] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [targetDates, setTargetDates] = useState({});
  const [copiedField, setCopiedField] = useState('');
  const [expandedStep, setExpandedStep] = useState(null);

  // Recommender states (Static tab)
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [selectedType, setSelectedType] = useState('sole_trader');
  const [completedStaticSteps, setCompletedStaticSteps] = useState({});
  const [expandedStatic, setExpandedStatic] = useState({});

  useEffect(() => {
    // 1. Try to load saved roadmap from localStorage
    const savedRoadmap = localStorage.getItem('impunga_registration_roadmap');
    if (savedRoadmap) {
      try {
        const parsed = JSON.parse(savedRoadmap);
        setRoadmap(parsed.roadmap);
        setCompletedSteps(parsed.completedSteps || {});
        setTargetDates(parsed.targetDates || {});
        setBusinessName(parsed.businessName || '');
        setSector(parsed.sector || '');
        setDescription(parsed.description || '');
        setProvince(parsed.province || 'Lusaka');
      } catch (e) {
        console.error('Failed to parse saved roadmap:', e);
      }
    } else {
      // 2. Pre-fill from validated idea pipeline if available
      const storedIdea = localStorage.getItem('impunga_idea_pipeline');
      if (storedIdea) {
        try {
          const parsed = JSON.parse(storedIdea);
          if (parsed.savedWizardData) {
            setSector(parsed.savedWizardData.businessType || '');
            setDescription(parsed.savedWizardData.solution || '');
            setProvince(parsed.savedWizardData.location || 'Lusaka');
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save journey state to localStorage
  const saveJourney = (updatedRoadmap, updatedCompleted, updatedDates) => {
    localStorage.setItem('impunga_registration_roadmap', JSON.stringify({
      roadmap: updatedRoadmap || roadmap,
      completedSteps: updatedCompleted || completedSteps,
      targetDates: updatedDates || targetDates,
      businessName,
      sector,
      description,
      province
    }));
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!businessName || !description) return;
    try {
      const result = await generateRegistrationRoadmap(businessName, sector, description, province);
      setRoadmap(result);
      setCompletedSteps({});
      setTargetDates({});
      localStorage.setItem('impunga_registration_roadmap', JSON.stringify({
        roadmap: result,
        completedSteps: {},
        targetDates: {},
        businessName,
        sector,
        description,
        province
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetJourney = () => {
    if (confirm('Are you sure you want to reset your registration journey?')) {
      setRoadmap(null);
      setCompletedSteps({});
      setTargetDates({});
      localStorage.removeItem('impunga_registration_roadmap');
    }
  };

  const toggleStepComplete = (stepNum) => {
    const updated = { ...completedSteps, [stepNum]: !completedSteps[stepNum] };
    setCompletedSteps(updated);
    saveJourney(roadmap, updated, targetDates);
  };

  const handleSetTargetDate = (stepNum, date) => {
    const updated = { ...targetDates, [stepNum]: date };
    setTargetDates(updated);
    saveJourney(roadmap, completedSteps, updated);
  };

  const handleCopyText = (text, fieldName) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(''), 2000);
      });
  };

  const getDeadlineStatus = (stepNum) => {
    const dateStr = targetDates[stepNum];
    if (!dateStr || completedSteps[stepNum]) return null;
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-50 border border-red-200' };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-600 bg-orange-50 border border-orange-200 animate-pulse' };
    if (diffDays <= 3) return { label: `Due in ${diffDays}d`, color: 'text-amber-600 bg-amber-50 border border-amber-200' };
    return { label: `Planned (${dateStr})`, color: 'text-indigo-600 bg-indigo-50 border border-indigo-100' };
  };

  // Recommender functions (Static tab)
  function handleGetRecommendation() {
    const rec = recommendStructure(answers);
    setRecommendation(rec);
    setSelectedType(rec.id);
  }

  function toggleStaticStep(stepNum) {
    setCompletedStaticSteps(prev => ({ ...prev, [`${selectedType}-${stepNum}`]: !prev[`${selectedType}-${stepNum}`] }));
  }

  const staticSteps = PACRA_STEPS[selectedType] || [];
  const completedStaticCount = staticSteps.filter(s => completedStaticSteps[`${selectedType}-${s.stepNumber}`]).length;
  const staticProgress = staticSteps.length > 0 ? Math.round((completedStaticCount / staticSteps.length) * 100) : 0;

  // AI Roadmap stats
  const stepsCount = roadmap?.steps?.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progress = stepsCount > 0 ? Math.round((completedCount / stepsCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-2 sm:px-4 text-left">
      <div className="flex justify-end gap-2 mb-6 mt-2 shrink-0">
          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setActiveTab('ai-journey')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'ai-journey' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              🌱 Interactive AI Journey
            </button>
            <button 
              onClick={() => setActiveTab('static-comparison')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'static-comparison' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              📋 PACRA Comparison Guide
            </button>
          </div>
        </div>

      {/* Official Links */}
      <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-[0_4px_15px_rgb(0,0,0,0.02)] mb-8">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" /> Official Zambian Registry Gateways
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_LINKS.map(({ name, url, desc }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className="flex flex-col justify-between p-3.5 bg-gray-50/50 hover:bg-indigo-50/30 rounded-xl transition-all border border-gray-100 hover:border-indigo-200 group">
              <div>
                <p className="font-bold text-gray-855 text-xs group-hover:text-indigo-600 line-clamp-1">{name}</p>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{desc}</p>
              </div>
              <div className="flex justify-end mt-3">
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* AI JOURNEY TAB */}
      {activeTab === 'ai-journey' && (
        <div className="space-y-6">
          {!roadmap ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-150/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Generate Your Custom Registration Journey</h3>
                  <p className="text-sm text-gray-500 font-medium">AI identifies exactly what licenses, permits, PACRA steps, and tax requirements fit your exact business type in Zambia.</p>
                </div>
              </div>

              <form onSubmit={handleGenerateRoadmap} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proposed Business Name</label>
                    <input 
                      required
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Kalulu Organic Poultry"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Zambian Province</label>
                    <select
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none cursor-pointer"
                    >
                      {['Lusaka', 'Copperbelt', 'Southern', 'Central', 'Eastern', 'Northern', 'Luapula', 'North-Western', 'Western', 'Muchinga'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Sector</label>
                  <select
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Sector...</option>
                    <option value="agriculture">Agriculture & Farming</option>
                    <option value="retail">Retail & General Trade</option>
                    <option value="food">Food & Hospitality</option>
                    <option value="services">Professional Services</option>
                    <option value="tech">Technology & E-commerce</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="transport">Transport & Logistics</option>
                    <option value="other">Other Business Type</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Brief Description of Activity</label>
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe exactly what your business will sell, manufacture, or do. This helps the AI determine licenses like local Council health, fire, ZICTA, or feed licenses."
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-h-[100px] resize-none"
                  />
                </div>

                {error && <ErrorMessage message={error} />}

                <button 
                  type="submit"
                  disabled={loading || !businessName || !description}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><LoadingSpinner size="sm" /> Creating roadmap...</> : <><Sparkles className="w-5 h-5" /> Generate Custom Journey</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {/* Progress Panel */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-xl mb-1">{businessName} Registration Roadmap</h3>
                  <p className="text-sm text-gray-500 font-medium">Custom journey for {sector} in {province} Province.</p>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-bold">{completedCount} of {stepsCount} steps complete</p>
                    <div className="w-32 bg-gray-100 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <button 
                    onClick={handleResetJourney}
                    className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors border border-gray-100"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Cheat-Sheet Panel */}
              {roadmap.cheatSheet && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6">
                  <h3 className="font-bold text-indigo-900 text-lg mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" /> PACRA Autofill Cheat-Sheet
                  </h3>
                  <p className="text-sm text-indigo-700 font-medium mb-4">Use these verified details when registering on PACRA's TaxOnline platform to avoid spelling queries or rejection.</p>
                  
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Recommended Names</span>
                      <div className="flex gap-2">
                        {roadmap.cheatSheet.proposedNames?.map((n, i) => (
                          <div key={i} className="flex-1 bg-white border border-indigo-100 px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-sm">
                            <span className="text-sm font-bold text-gray-800">{n}</span>
                            <button 
                              onClick={() => handleCopyText(n, `name-${i}`)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                            >
                              {copiedField === `name-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Principal Business Activity & Code</span>
                      <div className="bg-white border border-indigo-100 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                        <span className="text-sm font-medium text-gray-700 leading-relaxed">{roadmap.cheatSheet.principalActivity}</span>
                        <button 
                          onClick={() => handleCopyText(roadmap.cheatSheet.principalActivity, 'activity')}
                          className="text-gray-400 hover:text-indigo-600 transition-colors p-1 shrink-0 ml-3"
                        >
                          {copiedField === 'activity' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {roadmap.cheatSheet.suggestedDirectors?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Suggested Key Roles</span>
                        <div className="flex flex-wrap gap-2">
                          {roadmap.cheatSheet.suggestedDirectors.map((d, i) => (
                            <span key={i} className="bg-white border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-800 shadow-sm">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic steps timeline */}
              <div className="space-y-4">
                {roadmap.steps?.map((step) => {
                  const stepNum = step.stepNumber;
                  const isDone = !!completedSteps[stepNum];
                  const isOpen = expandedStep === stepNum;
                  const dlStatus = getDeadlineStatus(stepNum);

                  return (
                    <div key={stepNum} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isDone ? 'border-green-200 bg-green-50/10' : 'border-gray-200'}`}>
                      <div className="p-5 flex items-start gap-4">
                        <button 
                          onClick={() => toggleStepComplete(stepNum)}
                          className="mt-0.5 shrink-0 text-gray-300 hover:text-indigo-500 transition-colors"
                        >
                          {isDone ? <CheckSquare className="w-6 h-6 text-green-600" /> : <Square className="w-6 h-6" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                            <h4 className={`font-extrabold text-base transition-colors ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              Step {stepNum}: {step.title}
                            </h4>
                            
                            <div className="flex flex-wrap gap-2 items-center">
                              {step.cost && <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{step.cost}</span>}
                              {step.timeframe && <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{step.timeframe}</span>}
                              
                              {dlStatus && (
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${dlStatus.color}`}>
                                  {dlStatus.label}
                                </span>
                              )}

                              <button 
                                onClick={() => setExpandedStep(isOpen ? null : stepNum)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-500 text-sm leading-relaxed font-medium mb-3">{step.description}</p>
                          
                          {/* Target Date picker */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Target Date:</span>
                            <input 
                              type="date"
                              value={targetDates[stepNum] || ''}
                              onChange={e => handleSetTargetDate(stepNum, e.target.value)}
                              className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                            />
                          </div>

                          {/* Accordion content */}
                          {isOpen && (
                            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-3 animate-slide-up">
                              {step.requirements?.length > 0 && (
                                <div>
                                  <p className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1.5">Requirements Checklist</p>
                                  <ul className="list-disc ml-4 space-y-1 text-gray-500">
                                    {step.requirements.map((req, index) => (
                                      <li key={index}>{req}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {step.authority && (
                                <div className="text-xs text-gray-400 font-medium">
                                  <span className="font-bold text-gray-500">Regulating Authority:</span> {step.authority}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Complete journey check */}
              {progress === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-green-800 font-extrabold text-lg mb-1">Congratulations!</h3>
                  <p className="text-green-700 text-sm max-w-md mx-auto leading-relaxed">Your business is fully formalised and compliant! You are now set up to scale your operations in Zambia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STATIC COMPARISON TAB */}
      {activeTab === 'static-comparison' && (
        <div className="space-y-6 animate-slide-up">
          {/* Structure recommender */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Which Business Structure is Right for You?</h2>
            <div className="space-y-4">
              {RECOMMENDER_QUESTIONS.map(({ id, q, options }) => (
                <div key={id}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">{q}</p>
                  <div className="flex flex-wrap gap-2">
                    {options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [id]: opt }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${answers[id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15' : 'border-gray-200 text-gray-600 hover:border-indigo-400 bg-white'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleGetRecommendation}
              disabled={Object.keys(answers).length < 5}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 mt-6 text-sm flex items-center gap-2"
            >
              Get My Recommendation
            </button>
          </div>

          {/* Recommendation result */}
          {recommendation && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl p-6 animate-slide-up">
              <p className="text-green-800 font-extrabold text-sm uppercase tracking-wider mb-1">✓ Recommended for You</p>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {BUSINESS_TYPES.find(t => t.id === recommendation.id)?.name}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{recommendation.reason}</p>
            </div>
          )}

          {/* Structure comparison */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Business Structure Comparison</h2>
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
              {BUSINESS_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${selectedType === type.id ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}
                >
                  {type.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {(() => {
              const type = BUSINESS_TYPES.find(t => t.id === selectedType);
              if (!type) return null;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-green-600 tracking-wider mb-2">ADVANTAGES</p>
                    <ul className="space-y-2">{type.pros.map(p => <li key={p} className="text-sm text-gray-600 flex gap-2"><span className="text-green-500 font-bold">+</span>{p}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-500 tracking-wider mb-2">DISADVANTAGES</p>
                    <ul className="space-y-2">{type.cons.map(c => <li key={c} className="text-sm text-gray-600 flex gap-2"><span className="text-red-400 font-bold">–</span>{c}</li>)}</ul>
                  </div>
                  <div className="sm:col-span-2 flex gap-6 text-sm font-bold pt-4 border-t border-gray-100 text-gray-700">
                    <span>PACRA Fee: <span className="text-indigo-600 font-black">K{type.pacraFee}</span></span>
                    <span>Est. Timeframe: <span className="text-orange-500 font-black">{type.timeToRegister}</span></span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

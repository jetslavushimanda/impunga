import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, Save, RefreshCw, Building2, FileText, ArrowRight, Sparkles, ArrowLeft, Download, Target, Presentation, Banknote, Briefcase, Users, TrendingUp, AlertTriangle, Share2, Bot, Calculator } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import { stripMarkdown } from '../lib/stripMarkdown';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Toast, useToast } from '../components/shared/SuccessToast';
import PageHeaderCard from '../components/shared/PageHeaderCard';

const BUSINESS_TYPES = [
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'retail', label: 'Retail & Trade' },
  { value: 'food', label: 'Food & Hospitality' },
  { value: 'services', label: 'Professional Services' },
  { value: 'tech', label: 'Technology' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'transport', label: 'Transport & Logistics' },
  { value: 'other', label: 'Other' },
];

const BUDGET_RANGES = [
  { value: 'Under K5,000', label: 'Under K5,000' },
  { value: 'K5,000 - K20,000', label: 'K5,000 – K20,000' },
  { value: 'K20,000 - K50,000', label: 'K20,000 – K50,000' },
  { value: 'K50,000+', label: 'K50,000+' },
];

const PROVINCES = [
  'Lusaka', 'Copperbelt', 'Southern', 'Central', 'Eastern',
  'Northern', 'Luapula', 'North-Western', 'Western', 'Muchinga', 'Online',
];

const SUGGESTIONS_BY_TYPE = {
  agriculture: {
    problems: [
      'Smallholder farmers struggle to find direct markets for their maize and vegetables',
      'Local restaurants lack a steady supply of fresh, organically grown chickens',
      'Farmers in rural areas lose produce due to a lack of cold storage options'
    ],
    solutions: [
      'I will create an off-take platform connecting farmers directly to city grocers',
      'I will establish a poultry farm supplying high-quality broiler chickens locally',
      'I will set up solar-powered cold hubs in local markets to rent out space to farmers'
    ]
  },
  retail: {
    problems: [
      'Local boutique owners struggle to source high-quality clothing at wholesale prices',
      'Consumers in my township have to travel to town to buy quality household plastics',
      'Small retailers have no easy access to wholesale beverages and dry goods delivery'
    ],
    solutions: [
      'I will launch a wholesale distribution store supplying imported fashion items to boutiques',
      'I will open a plastics and hardware retail store right inside the residential area',
      'I will create a B2B delivery service supplying tuckshops directly from local wholesalers'
    ]
  },
  food: {
    problems: [
      'Office workers in the CBD lack access to affordable, clean, and quick local lunches',
      'Families in my area have to travel far to find a decent family restaurant',
      'Local events struggle to find reliable and professional catering services'
    ],
    solutions: [
      'I will open a modern local kitchen offering express delivery of Nshima and T-bone to offices',
      'I will start a clean, family-friendly backyard diner serving local and western meals',
      'I will launch a premium event catering company specializing in local Zambian dishes'
    ]
  },
  services: {
    problems: [
      'Working parents struggle to find reliable and verified after-school tutors for children',
      'Local schools and clinics have no access to clean, professional cleaning services',
      'SMEs cannot afford full-time accountants to manage ZRA tax and PACRA compliance'
    ],
    solutions: [
      'I will run a agency that provides vetted home-tutoring services for primary students',
      'I will start a commercial cleaning business specializing in office and clinic sanitation',
      'I will offer affordable monthly accounting and tax filing packages for small businesses'
    ]
  },
  tech: {
    problems: [
      'Small shops still record transactions manually, leading to inventory losses',
      'Local high schools lack modern digital learning tools and computer lab software',
      'Zambian artisans have no online marketplace to showcase and sell their handmade crafts'
    ],
    solutions: [
      'I will build a simple, offline-first mobile POS app for market vendors and tuckshops',
      'I will design an affordable e-learning portal for local syllabus revision',
      'I will launch a curated e-commerce platform dedicated to Zambian artisans'
    ]
  },
  manufacturing: {
    problems: [
      'Small food processors struggle to find affordable food-grade packaging bottles',
      'Local carpentry shops lack access to seasoned, high-quality timber boards',
      'High cost of imported animal feed makes local livestock farming unprofitable'
    ],
    solutions: [
      'I will manufacture low-cost, food-safe plastic bottles for local beverage makers',
      'I will establish a local timber processing facility providing treated construction timber',
      'I will build a feed-processing plant utilizing local maize bran and soy ingredients'
    ]
  },
  transport: {
    problems: [
      'Commuters spend hours in queues waiting for local minibuses during peak hours',
      'Farming communities cannot find affordable trucks to transport their harvest to city markets',
      'E-commerce businesses suffer from high costs and slow delivery times for parcel delivery'
    ],
    solutions: [
      'I will launch a scheduled shuttle service for professionals on busy routes',
      'I will operate a shared-truck service connecting rural farmers to urban hubs',
      'I will build a network of motorcycle couriers offering instant last-mile delivery'
    ]
  },
  other: {
    problems: [
      'People in my area travel far to buy fresh vegetables',
      'Small businesses struggle to get affordable packaging',
      'Students have no access to affordable tutoring services'
    ],
    solutions: [
      'I will set up a neighbourhood cold-storage farm stand',
      'I will buy packaging in bulk and distribute locally',
      'I will create an affordable online tutoring platform'
    ]
  }
};

export default function IdeaValidator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    businessType: '',
    problem: '',
    solution: '',
    budget: '',
    location: '',
    extraInfo: '',
  });

  const [result, setResult] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState([]);

  const { validateBusinessIdea, loading, error } = useAI();
  const { addDocument, getUserDocuments } = useFirestore();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedIdeas();
    const stored = localStorage.getItem('impunga_idea_pipeline');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.savedResult && data.savedWizardData) {
          setResult(data.savedResult);
          setWizardData(data.savedWizardData);
        }
      } catch (err) {
        console.error('Error loading stored idea:', err);
      }
    }
  }, []);

  async function loadSavedIdeas() {
    const ideas = await getUserDocuments('businessIdeas', null);
    setSavedIdeas(ideas);
  }

  function handleNextStep() {
    if (currentStep < 4) setCurrentStep(c => c + 1);
  }

  function handlePrevStep() {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  }

  async function handleValidate() {
    try {
      const responseJson = await validateBusinessIdea(wizardData);
      setResult(responseJson);

      const compiledIdeaText = "Business Type: " + wizardData.businessType + "\nProblem: " + wizardData.problem + "\nSolution: " + wizardData.solution + "\nBudget: " + wizardData.budget + "\nLocation: " + wizardData.location + (wizardData.extraInfo ? "\nExtra: " + wizardData.extraInfo : "");

      localStorage.setItem('impunga_idea_pipeline', JSON.stringify({
        ideaText: compiledIdeaText,
        aiAnalysis: JSON.stringify(responseJson, null, 2),
        viabilityScore: responseJson.score,
        location: wizardData.location,
        budget: wizardData.budget,
        businessType: wizardData.businessType,
        timestamp: Date.now(),
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    if (!result) return;
    try {
      await addDocument('businessIdeas', {
        wizardData,
        score: result.score,
        verdict: result.verdict,
        result: result,
        timestamp: Date.now()
      });
      show('Idea analysis saved to your profile!');
      loadSavedIdeas();
    } catch (err) {
      show('Failed to save. Please try again.', 'error');
    }
  }

  function handleReset() {
    setWizardData({
      businessType: '',
      problem: '',
      solution: '',
      budget: '',
      location: '',
      extraInfo: '',
    });
    setResult(null);
    setCurrentStep(1);
  }

  function handleDownloadPDF() {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Startup Blueprint & Analysis', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Generated by IMPUNGA Startup Studio', 105, 28, { align: 'center' });

    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    let yPos = 45;
    const addSection = (title, content) => {
      if (!content) return;
      const clean = stripMarkdown(content);
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(title, 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50);
      const lines = doc.splitTextToSize(clean, 170);
      doc.text(lines, 20, yPos);
      yPos += (lines.length * 5) + 10;
    };

    addSection('Executive Summary', result.executiveSummary);
    addSection('Viability Score', result.score + '/10 - ' + result.verdict);
    addSection('Unit Economics', result.unitEconomics);
    addSection('Competitor Intelligence', result.competitorIntel);
    addSection('Capital Allocation', result.capitalAllocation);
    addSection('Risk Assessment', result.riskAssessment);
    if (result.consultantPivot) {
      addSection('Consultant Strategy', result.consultantPivot);
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Generated by IMPUNGA \u2014 Start. Match. Build Zambia. \u2014 Page ' + i + '/' + pageCount, 105, 290, { align: 'center' });
    }

    doc.save('Startup_Blueprint.pdf');
    show('Blueprint PDF downloaded successfully!');
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return wizardData.businessType.length > 0;
      case 2: return wizardData.problem.length >= 10 && wizardData.solution.length >= 10;
      case 3: return wizardData.budget.length > 0 && wizardData.location.length > 0;
      case 4: return true; // optional step
      default: return false;
    }
  };

  // Determine which modules to show based on business type
  const getRelevantModules = () => {
    const bt = wizardData.businessType;
    const budgetHigh = wizardData.budget === 'K20,000 - K50,000' || wizardData.budget === 'K50,000+';
    const modules = [];

    // Always show
    modules.push({ path: '/name-generator', icon: Sparkles, name: 'Name Generator', desc: 'Get a brand name', bgColor: 'bg-blue-100', textColor: 'text-blue-600', hoverBorder: 'hover:border-blue-200' });
    modules.push({ path: '/swot-analysis', icon: Target, name: 'SWOT Analysis', desc: 'Know your risks', bgColor: 'bg-cyan-100', textColor: 'text-cyan-600', hoverBorder: 'hover:border-cyan-200' });
    modules.push({ path: '/business-plan', icon: FileText, name: 'Business Plan', desc: 'Build the roadmap', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600', hoverBorder: 'hover:border-indigo-200' });

    // Registration guide — depends on business type (formal businesses)
    if (['retail', 'services', 'tech', 'manufacturing', 'food'].includes(bt)) {
      modules.push({ path: '/registration-guide', icon: Building2, name: 'Formalise Setup', desc: 'PACRA & ZRA Guide', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600', hoverBorder: 'hover:border-emerald-200' });
    }

    // Pitch Deck — for services, tech, manufacturing
    if (['services', 'tech', 'manufacturing'].includes(bt)) {
      modules.push({ path: '/pitch-deck', icon: Presentation, name: 'Pitch Deck', desc: 'For investors', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-600', hoverBorder: 'hover:border-fuchsia-200' });
    }

    // Funding — for higher budgets
    if (budgetHigh) {
      modules.push({ path: '/funding-matchmaker', icon: Banknote, name: 'Funding Matches', desc: 'Grants & Loans', bgColor: 'bg-teal-100', textColor: 'text-teal-600', hoverBorder: 'hover:border-teal-200' });
    }

    // Social Media — retail, food, agriculture, services
    if (['retail', 'food', 'agriculture', 'services'].includes(bt)) {
      modules.push({ path: '/social-media', icon: Share2, name: 'Social Media', desc: 'Marketing Strategy', bgColor: 'bg-pink-100', textColor: 'text-pink-600', hoverBorder: 'hover:border-pink-200' });
    }

    // Pricing Calculator — retail, food, agriculture
    if (['retail', 'food', 'agriculture'].includes(bt)) {
      modules.push({ path: '/pricing-calculator', icon: Calculator, name: 'Pricing Calculator', desc: 'Cost & margins', bgColor: 'bg-amber-100', textColor: 'text-amber-600', hoverBorder: 'hover:border-amber-200' });
    }

    return modules;
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-2">1. What type of business?</h3>
            <p className="text-sm text-gray-500 mb-4">Select the category that best describes your business idea.</p>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map(bt => (
                <button
                  key={bt.value}
                  onClick={() => setWizardData({...wizardData, businessType: bt.value})}
                  className={"p-4 rounded-2xl border-2 text-left font-semibold transition-all " + (wizardData.businessType === bt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200')}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">2. The Problem & Solution</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">What problem are you solving?</label>
              <textarea
                value={wizardData.problem}
                onChange={e => setWizardData({...wizardData, problem: e.target.value})}
                placeholder="Describe the problem in one or two sentences..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {(SUGGESTIONS_BY_TYPE[wizardData.businessType] || SUGGESTIONS_BY_TYPE.other).problems.map((ex, i) => (
                  <button key={i} onClick={() => setWizardData({...wizardData, problem: ex})} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors text-left">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">How will you solve it?</label>
              <textarea
                value={wizardData.solution}
                onChange={e => setWizardData({...wizardData, solution: e.target.value})}
                placeholder="Describe your business idea in one or two sentences..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {(SUGGESTIONS_BY_TYPE[wizardData.businessType] || SUGGESTIONS_BY_TYPE.other).solutions.map((ex, i) => (
                  <button key={i} onClick={() => setWizardData({...wizardData, solution: ex})} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors text-left">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">3. Budget & Location</h3>
            <p className="text-sm text-gray-500 mb-4">What resources are you starting with?</p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Budget</label>
              <div className="grid grid-cols-2 gap-3">
                {BUDGET_RANGES.map(br => (
                  <button
                    key={br.value}
                    onClick={() => setWizardData({...wizardData, budget: br.value})}
                    className={"p-3 rounded-xl border-2 text-center font-semibold text-sm transition-all " + (wizardData.budget === br.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200')}
                  >
                    {br.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Location</label>
              <select
                value={wizardData.location}
                onChange={e => setWizardData({...wizardData, location: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select province...</option>
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-2">4. Tell Us More <span className="text-sm font-normal text-gray-400">(Optional)</span></h3>
            <p className="text-sm text-gray-500 mb-4">Who are your target customers? Any experience or advantages you have? This helps the AI give better advice.</p>
            <textarea
              value={wizardData.extraInfo}
              onChange={e => setWizardData({...wizardData, extraInfo: e.target.value})}
              placeholder="e.g., My target customers are working mothers aged 25-45. My uncle owns a farm so I get stock at 30% discount..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in text-left">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeaderCard
        title="Startup Studio"
        description="Validate your idea and generate a strategic blueprint."
        icon={Sparkles}
        bg="bg-indigo-50"
        text="text-indigo-600"
        badge="Business Space"
        badgeColor="indigo"
      />

      {!result && (
        <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={step <= currentStep ? "h-full bg-indigo-600 transition-all duration-300" : "h-full bg-transparent transition-all duration-300"} />
              </div>
            ))}
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="min-h-[250px]">
            {renderWizardStep()}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1 || loading}
              className="px-6 py-3 text-gray-500 font-semibold disabled:opacity-30 hover:text-gray-800 transition-colors"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                disabled={!isStepValid()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleValidate}
                disabled={!isStepValid() || loading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <><LoadingSpinner size="sm" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Generate Blueprint</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Blueprint Results Dashboard */}
      {result && (
        <div className="bg-transparent animate-slide-up space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={"absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 " + (result.score >= 6 ? 'bg-green-400' : 'bg-yellow-400')} />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className={"inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider " + (result.verdict === 'PROCEED' ? 'bg-green-100 text-green-800' : result.verdict === 'REFINE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}>{result.verdict}</span>

              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-gray-900">{result.score}</span>
                <span className="text-xl text-gray-400 font-bold">/10</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{result.executiveSummary}</h2>
            <p className="text-gray-500 font-medium relative z-10">AI Viability Score based on unit economics and market demand.</p>
          </div>

          {/* Core Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 text-lg">Unit Economics</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{result.unitEconomics}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 text-lg">Competitor Intel</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{result.competitorIntel}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Banknote className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 text-lg">Capital Allocation</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{result.capitalAllocation}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 text-lg">Risk Assessment</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{result.riskAssessment}</p>
            </div>
          </div>

          {/* Consultant Pivot (Only if score <= 5) */}
          {result.score <= 5 && result.consultantPivot && (
            <div className="bg-orange-50 rounded-3xl p-8 border border-orange-200 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                <h3 className="font-bold text-orange-900 text-xl">Consultant's Pivot Strategy</h3>
              </div>
              <p className="text-orange-800 leading-relaxed text-lg">{result.consultantPivot}</p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm justify-between items-center">
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
                <RefreshCw className="w-4 h-4" /> New Idea
              </button>
            </div>
            
            <Link to="/engine/finance" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-95">
              <Banknote className="w-4 h-4" /> Get Financing
            </Link>
          </div>

          {/* AI Co-Founder Banner */}
          <Link to="/ai-advisor" className="block bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20 group-hover:bg-white/20 transition-colors" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Chat with your AI Co-Founder</h3>
                <p className="text-indigo-100 font-medium text-sm md:text-base">Your Co-Founder has analyzed this Blueprint and is ready to help you execute it.</p>
              </div>
              <ArrowRight className="w-6 h-6 text-white ml-auto group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

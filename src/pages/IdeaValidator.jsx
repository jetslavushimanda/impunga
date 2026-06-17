import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, Save, RefreshCw, Building2, FileText, ChevronDown, ChevronUp, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import { extractViabilityScore, getScoreColor, getScoreLabel, truncateText } from '../lib/utils';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import AIResponse from '../components/shared/AIResponse';
import { Toast, useToast } from '../components/shared/SuccessToast';

export default function IdeaValidator() {
  const [ideaText, setIdeaText] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [expandedIdea, setExpandedIdea] = useState(null);
  const { validateBusinessIdea, loading, error } = useAI();
  const { addDocument, getUserDocuments } = useFirestore();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedIdeas();
  }, []);

  async function loadSavedIdeas() {
    const ideas = await getUserDocuments('businessIdeas');
    setSavedIdeas(ideas);
  }

  async function handleValidate() {
    if (ideaText.length < 50) return;
    const userContext = `Occupation: ${userProfile?.occupation || 'not specified'}, Province: ${userProfile?.province || 'not specified'}, Budget: ${budget}, Location type: ${location}, Experience: ${experience}`;
    try {
      const response = await validateBusinessIdea(ideaText, userContext);
      setResult(response);
      const extracted = extractViabilityScore(response);
      setScore(extracted);
    } catch {}
  }

  async function handleSave() {
    try {
      await addDocument('businessIdeas', {
        ideaText: ideaText.substring(0, 500),
        aiAnalysis: result,
        viabilityScore: score,
      });
      show('Analysis saved successfully!');
      loadSavedIdeas();
    } catch {
      show('Failed to save. Please try again.', 'error');
    }
  }

  function handleBuildPlan() {
    // Store idea data in localStorage for BusinessPlanBuilder to consume
    const pipelineData = {
      ideaText,
      aiAnalysis: result,
      viabilityScore: score,
      location: location,
      budget: budget,
      timestamp: Date.now(),
    };
    localStorage.setItem('impunga_idea_pipeline', JSON.stringify(pipelineData));
    navigate('/business-plan');
  }

  function handleReset() {
    setIdeaText('');
    setBudget('');
    setLocation('');
    setExperience('');
    setResult('');
    setScore(null);
  }

  const scoreClass = score !== null ? getScoreColor(score) : '';
  const verdict = score !== null ? getScoreLabel(score) : '';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Lightbulb className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Idea Validator</h1>
          <p className="text-gray-500 font-medium">Find out if your business idea can work in Zambia</p>
        </div>
      </div>

      {/* Previous ideas */}
      {savedIdeas.length > 0 && (
        <div className="bg-white/70 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Your Previous Ideas ({savedIdeas.length})</h2>
          <div className="space-y-3">
            {savedIdeas.map((idea) => (
              <div key={idea.id} className="bg-white/80 border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 text-left transition-colors"
                  onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getScoreColor(idea.viabilityScore)} shadow-sm`}>
                      {idea.viabilityScore ?? '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 line-clamp-1">{truncateText(idea.ideaText, 80)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ml-2">
                    {expandedIdea === idea.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </button>
                {expandedIdea === idea.id && (
                  <div className="p-5 bg-gray-50/50 border-t border-gray-100 text-gray-700 leading-relaxed text-sm">
                    <AIResponse content={idea.aiAnalysis} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New idea form */}
      {/* New idea form */}
      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight relative z-10">Validate a New Idea</h2>

        <div className="mb-6 relative z-10">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Describe your business idea *</label>
          <textarea
            value={ideaText}
            onChange={e => setIdeaText(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all min-h-[160px] shadow-sm resize-none"
            placeholder="Tell us what you want to sell or what service you want to offer. Where will you operate? Who are your customers? What problem does it solve?"
          />
          <p className={`text-xs mt-2 font-medium ${ideaText.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
            {ideaText.length} characters {ideaText.length < 50 ? '(minimum 50 required)' : '✓ Looks good!'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Startup Budget</label>
            <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all appearance-none shadow-sm cursor-pointer">
              <option value="">Not sure yet</option>
              <option value="Under K500">Under K500</option>
              <option value="K500 - K2,000">K500 – K2,000</option>
              <option value="K2,000 - K10,000">K2,000 – K10,000</option>
              <option value="K10,000 - K50,000">K10,000 – K50,000</option>
              <option value="Over K50,000">Over K50,000</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Where You'll Operate</label>
            <select value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all appearance-none shadow-sm cursor-pointer">
              <option value="">Not decided</option>
              <option value="Home based">Home based</option>
              <option value="Market">Market</option>
              <option value="Shop">Shop</option>
              <option value="Online">Online</option>
              <option value="Mobile">Mobile / Door to door</option>
              <option value="Multiple">Multiple locations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Experience</label>
            <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all appearance-none shadow-sm cursor-pointer">
              <option value="">None</option>
              <option value="None">No experience</option>
              <option value="Some knowledge">Some knowledge</option>
              <option value="Have worked in it">Have worked in it</option>
              <option value="Currently doing it informally">Doing it informally</option>
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button 
          onClick={handleValidate} 
          disabled={loading || ideaText.length < 50} 
          className="relative z-10 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          {loading ? <><LoadingSpinner size="sm" /> AI is analysing your idea...</> : <><Sparkles className="w-5 h-5" /> Validate My Idea</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 animate-slide-up relative overflow-hidden">
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100 relative z-10">
            {score !== null && (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-sm ${scoreClass}`}>
                {score}<span className="text-sm opacity-60">/10</span>
              </div>
            )}
            <div>
              <p className="text-gray-500 font-semibold mb-1">Viability Score</p>
              {score !== null && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  verdict === 'PROCEED' ? 'bg-green-100 text-green-800' :
                  verdict === 'REFINE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>{verdict}</span>
              )}
            </div>
          </div>

          <div className="mb-6 text-gray-700 leading-relaxed relative z-10">
            <AIResponse content={result} />
          </div>

          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100 relative z-10">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
              <Save className="w-4 h-4" /> Save Analysis
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
              <RefreshCw className="w-4 h-4" /> Try Another Idea
            </button>
            <Link to="/registration-guide" className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
              <Building2 className="w-4 h-4" /> Register Business
            </Link>
            <button
              onClick={handleBuildPlan}
              className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 ml-auto"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Build Business Plan
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

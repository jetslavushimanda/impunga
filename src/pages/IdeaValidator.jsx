import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Save, RefreshCw, Building2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import { extractViabilityScore, getScoreColor, getScoreLabel, truncateText } from '../lib/utils';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Idea Validator</h1>
          <p className="text-gray-500 text-sm">Find out if your business idea can work in Zambia</p>
        </div>
      </div>

      {/* Previous ideas */}
      {savedIdeas.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-800 mb-3">Your Previous Ideas ({savedIdeas.length})</h2>
          <div className="space-y-2">
            {savedIdeas.map((idea) => (
              <div key={idea.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-surface-light text-left"
                  onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`score-circle w-8 h-8 text-sm ${getScoreColor(idea.viabilityScore)}`}>
                      {idea.viabilityScore ?? '?'}
                    </span>
                    <span className="text-sm text-gray-700 line-clamp-1">{truncateText(idea.ideaText, 80)}</span>
                  </div>
                  {expandedIdea === idea.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedIdea === idea.id && (
                  <div className="p-3 bg-surface-light border-t border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                    {idea.aiAnalysis}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New idea form */}
      <div className="card mb-4">
        <h2 className="font-bold text-gray-800 mb-3">Validate a New Idea</h2>

        <div className="mb-4">
          <label className="label">Describe your business idea *</label>
          <textarea
            value={ideaText}
            onChange={e => setIdeaText(e.target.value)}
            className="textarea-field min-h-[140px]"
            placeholder="Tell us what you want to sell or what service you want to offer. Where will you operate? Who are your customers? What problem does it solve?"
          />
          <p className={`text-xs mt-1 ${ideaText.length < 50 ? 'text-red-400' : 'text-gray-400'}`}>
            {ideaText.length} characters {ideaText.length < 50 ? '(minimum 50 required)' : '✓'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="label">Startup Budget</label>
            <select value={budget} onChange={e => setBudget(e.target.value)} className="select-field">
              <option value="">Not sure yet</option>
              <option value="Under K500">Under K500</option>
              <option value="K500 - K2,000">K500 – K2,000</option>
              <option value="K2,000 - K10,000">K2,000 – K10,000</option>
              <option value="K10,000 - K50,000">K10,000 – K50,000</option>
              <option value="Over K50,000">Over K50,000</option>
            </select>
          </div>
          <div>
            <label className="label">Where You'll Operate</label>
            <select value={location} onChange={e => setLocation(e.target.value)} className="select-field">
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
            <label className="label">Your Experience</label>
            <select value={experience} onChange={e => setExperience(e.target.value)} className="select-field">
              <option value="">None</option>
              <option value="None">No experience</option>
              <option value="Some knowledge">Some knowledge</option>
              <option value="Have worked in it">Have worked in it</option>
              <option value="Currently doing it informally">Doing it informally</option>
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button onClick={handleValidate} disabled={loading || ideaText.length < 50} className="btn-green w-full">
          {loading ? <><LoadingSpinner size="sm" /> AI is analysing your idea...</> : '🔍 Validate My Idea'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="card animate-slide-up">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            {score !== null && (
              <div className={`score-circle ${scoreClass}`}>{score}/10</div>
            )}
            <div>
              <p className="text-gray-500 text-sm">Viability Score</p>
              {score !== null && (
                <span className={`badge text-sm font-bold ${
                  verdict === 'PROCEED' ? 'bg-green-100 text-green-800' :
                  verdict === 'REFINE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>{verdict}</span>
              )}
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-4">
            {result}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            <button onClick={handleSave} className="btn-primary gap-2">
              <Save className="w-4 h-4" /> Save Analysis
            </button>
            <button onClick={handleReset} className="btn-secondary gap-2">
              <RefreshCw className="w-4 h-4" /> Try Another Idea
            </button>
            <Link to="/registration-guide" className="btn-secondary gap-2">
              <Building2 className="w-4 h-4" /> Register Business
            </Link>
            <Link to="/business-plan" className="btn-secondary gap-2">
              <FileText className="w-4 h-4" /> Build Plan
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

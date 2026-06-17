import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, RefreshCw, Briefcase } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import ErrorMessage from '../components/shared/ErrorMessage';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import AIResponse from '../components/shared/AIResponse';

export default function FundingMatchmaker() {
  const [pipelineData, setPipelineData] = useState(null);
  const [fundingContent, setFundingContent] = useState('');
  const { matchFundingSources, loading, error } = useAI();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('impunga_idea_pipeline');
    if (stored) {
      const data = JSON.parse(stored);
      setPipelineData(data);
      if (!fundingContent && !loading) {
        handleGenerate(data);
      }
    }
  }, []);

  async function handleGenerate(data) {
    if (!data) return;
    try {
      const result = await matchFundingSources(data);
      setFundingContent(result);
    } catch (err) {
      console.error(err);
    }
  }

  if (!pipelineData) {
    return (
      <div className="max-w-4xl mx-auto pb-24 animate-fade-in text-center pt-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Validated Idea Found</h2>
        <p className="text-gray-500 mb-8">Please validate your business idea first to find funding matches.</p>
        <Link to="/idea-validator" className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-bold">Go to Idea Validator</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Funding Matchmaker</h1>
        <p className="text-gray-500 font-medium">AI matches your validated idea with realistic Zambian funding sources</p>
      </div>

      <div className="bg-white/85 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <LoadingSpinner size="lg" />
            <p className="mt-4 font-medium animate-pulse">Scanning Zambian grants, banks, and investors...</p>
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : fundingContent ? (
          <div className="animate-slide-up">
            <div className="flex items-center gap-4 bg-emerald-50 text-emerald-800 p-4 rounded-xl mb-6 border border-emerald-100">
              <Banknote className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">These matches are based on your idea, location ({pipelineData.location || 'Zambia'}), and budget ({pipelineData.budget || 'unspecified'}).</p>
            </div>
            
            <div className="prose prose-emerald max-w-none mb-8">
              <AIResponse content={fundingContent} />
            </div>
            
            <div className="flex gap-4 border-t border-gray-100 pt-6">
              <button onClick={() => handleGenerate(pipelineData)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-6 py-3 rounded-xl transition-all active:scale-95">
                <RefreshCw className="w-5 h-5" /> Refresh Matches
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

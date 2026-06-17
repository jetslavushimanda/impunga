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
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      <Link to="/engine/finance" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Finance & Funding
      </Link>

      <div className="mb-10 flex items-start gap-5">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-purple-200">
          <Briefcase className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Investment Matchmaker</h1>
          <p className="text-gray-500 font-medium max-w-2xl">Prepare your investor Data Room and let AI match your validated idea with realistic Zambian and African Venture Capital funds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Data Room Prep */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-500" /> Data Room Checklist
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Before approaching investors, ensure you have these documents ready in a secure cloud folder (like Google Drive).
            </p>
            
            <div className="space-y-3">
              {[
                { id: 'pitch', label: 'Pitch Deck (10-15 slides)' },
                { id: 'financials', label: 'Financial Model (3-5 years)' },
                { id: 'plan', label: 'Executive Summary / Business Plan' },
                { id: 'pacra', label: 'PACRA Incorporation Documents' },
                { id: 'cap', label: 'Cap Table (Ownership structure)' }
              ].map(item => (
                <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link to="/pitch-deck" className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                Go to Pitch Deck Generator <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: AI Matches */}
        <div className="lg:col-span-2">
          <div className="bg-white/85 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-purple-600">
                <LoadingSpinner size="lg" />
                <p className="mt-4 font-medium animate-pulse">Scanning Angel Investors and VC Funds...</p>
              </div>
            ) : error ? (
              <ErrorMessage message={error} />
            ) : fundingContent ? (
              <div className="animate-slide-up">
                <div className="flex items-center gap-4 bg-purple-50 text-purple-800 p-4 rounded-xl mb-6 border border-purple-100">
                  <Banknote className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium">These matches are based on your idea, location ({pipelineData.location || 'Zambia'}), and budget ({pipelineData.budget || 'unspecified'}).</p>
                </div>
                
                <div className="prose prose-purple max-w-none mb-8">
                  <AIResponse content={fundingContent} />
                </div>
                
                <div className="flex gap-4 border-t border-gray-100 pt-6">
                  <button onClick={() => handleGenerate(pipelineData)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-6 py-3 rounded-xl transition-all active:scale-95 text-sm">
                    <RefreshCw className="w-5 h-5" /> Refresh AI Matches
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Lightbulb, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import useAuthStore from '../../store/authStore';

const PRIORITY_COLORS = {
  high: 'border-l-primary bg-blue-50',
  medium: 'border-l-yellow-400 bg-yellow-50',
  low: 'border-l-gray-300 bg-gray-50',
};

const EXAMPLE_QUERIES = [
  'I want to sell fish in Kasama',
  'How do I register my business?',
  'Find funding for farming',
  'What tax do I pay as a sole trader?',
  'I want to hire my first employee',
];

export default function SemanticSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { semanticSearch, loading } = useAI();
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  async function handleSearch(q) {
    const searchQuery = q || query.trim();
    if (!searchQuery || searchQuery.length < 4) return;
    setHasSearched(true);
    setResults(null);
    const userContext = userProfile
      ? `Province: ${userProfile.province}, Occupation: ${userProfile.occupation}`
      : 'General Zambian entrepreneur';
    try {
      const data = await semanticSearch(searchQuery, userContext);
      setResults(data);
    } catch {
      setResults({ intent: 'Search failed', modules: [], tip: null });
    }
  }

  function handleNavigate(path) {
    navigate(path);
    onClose();
  }

  function handleExampleClick(example) {
    setQuery(example);
    handleSearch(example);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up border border-white/20">
        
        {/* Search Input / Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-white z-10 shrink-0">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20">
            <Search className="w-5 h-5 text-white drop-shadow-sm" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-gray-800 text-lg placeholder-gray-400/80 outline-none bg-transparent font-medium"
            placeholder="Search IMPUNGA..."
          />
          {loading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
          ) : query ? (
            <button onClick={() => { setQuery(''); setResults(null); setHasSearched(false); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          ) : null}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0 hidden sm:block"
          >
            Search
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          {/* Initial state — example queries */}
          {!hasSearched && (
            <div className="py-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" /> Suggested Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => handleExampleClick(ex)}
                    className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-5 py-2.5 rounded-full hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-base font-bold text-gray-800">Understanding your query...</p>
              <p className="text-sm text-gray-500 mt-1">AI is finding the best resources for you</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Intent */}
              <div className="bg-gradient-to-r from-primary/5 to-blue-50/50 rounded-2xl p-4 border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">What IMPUNGA understood</p>
                <p className="text-base text-gray-800 font-medium">{results.intent}</p>
              </div>

              {/* Relevant Modules */}
              {results.modules?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Relevant Tools & Modules
                  </p>
                  <div className="space-y-3">
                    {results.modules.map((mod, i) => (
                      <button
                        key={i}
                        onClick={() => handleNavigate(mod.path)}
                        className={`w-full text-left rounded-2xl p-4 border bg-white hover:bg-gray-50 hover:shadow-md transition-all ${PRIORITY_COLORS[mod.priority] || PRIORITY_COLORS.low}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 text-base">{mod.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{mod.reason}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 ml-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Prices shortcut */}
              {results.marketCategory && (
                <button
                  onClick={() => handleNavigate('/market-prices')}
                  className="w-full text-left bg-orange-50/80 border border-orange-200 border-l-4 border-l-orange-400 rounded-2xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" /> Market Prices — {results.marketCategory}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Check current Zambian prices for this category</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </button>
              )}

              {/* Funding shortcut */}
              {results.fundingKeyword && (
                <button
                  onClick={() => handleNavigate('/engine/finance')}
                  className="w-full text-left bg-purple-50/80 border border-purple-200 border-l-4 border-l-purple-400 rounded-2xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-base">Finance & Funding — {results.fundingKeyword}</p>
                      <p className="text-sm text-gray-600 mt-1">Find Zambian grants and loans for this sector</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </button>
              )}

              {/* AI Tip */}
              {results.tip && (
                <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1.5">Quick Tip</p>
                    <p className="text-sm text-yellow-800 font-medium leading-relaxed">{results.tip}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {hasSearched && !loading && results?.modules?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm border border-gray-100">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-gray-800 mb-1">No specific modules found</p>
              <p className="text-sm text-gray-500 mb-6">Try the <strong>AI Business Advisor</strong> for open-ended questions.</p>
              <button onClick={() => handleNavigate('/ai-advisor')} className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/20">
                Open AI Advisor
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Powered by Gemini AI
          </p>
          <button onClick={onClose} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-bold transition-colors">
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}

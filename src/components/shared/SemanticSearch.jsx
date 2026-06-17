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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-white" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-gray-800 text-base placeholder-gray-400 outline-none bg-transparent"
            placeholder='Try "I want to sell fish in Kasama"...'
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          ) : query ? (
            <button onClick={() => { setQuery(''); setResults(null); setHasSearched(false); }} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          ) : null}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
          >
            Search
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Initial state — example queries */}
          {!hasSearched && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Try these searches
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => handleExampleClick(ex)}
                    className="text-sm text-primary bg-blue-50 border border-primary/20 px-3 py-1.5 rounded-xl hover:bg-primary hover:text-white transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Type anything in natural language — IMPUNGA understands your intent
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-600">Understanding your query...</p>
              <p className="text-xs text-gray-400 mt-1">AI is finding the best resources for you</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Intent */}
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-3 border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">What IMPUNGA understood</p>
                <p className="text-sm text-gray-700 font-medium">{results.intent}</p>
              </div>

              {/* Relevant Modules */}
              {results.modules?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Relevant Tools & Modules
                  </p>
                  <div className="space-y-2">
                    {results.modules.map((mod, i) => (
                      <button
                        key={i}
                        onClick={() => handleNavigate(mod.path)}
                        className={`w-full text-left rounded-xl p-3 border border-l-4 ${PRIORITY_COLORS[mod.priority] || PRIORITY_COLORS.low} hover:shadow-sm transition-shadow`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{mod.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{mod.reason}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
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
                  className="w-full text-left bg-orange-50 border border-orange-200 border-l-4 border-l-orange-400 rounded-xl p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-orange-500" /> Market Prices — {results.marketCategory}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Check current Zambian prices for this category</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                </button>
              )}

              {/* Funding shortcut */}
              {results.fundingKeyword && (
                <button
                  onClick={() => handleNavigate('/funding-finder')}
                  className="w-full text-left bg-purple-50 border border-purple-200 border-l-4 border-l-purple-400 rounded-xl p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Funding Finder — {results.fundingKeyword}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Find Zambian grants and loans for this sector</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                </button>
              )}

              {/* AI Tip */}
              {results.tip && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">Quick Tip</p>
                    <p className="text-sm text-yellow-800">{results.tip}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {hasSearched && !loading && results?.modules?.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No specific modules found. Try the <strong>AI Business Advisor</strong> for open-ended questions.</p>
              <button onClick={() => handleNavigate('/ai-advisor')} className="btn-primary mt-3 text-sm">
                Open AI Advisor
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">Powered by Gemini AI · Understanding natural language</p>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 font-medium">
            Press ESC to close
          </button>
        </div>
      </div>
    </div>
  );
}

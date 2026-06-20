import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Lightbulb, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import useAuthStore from '../../store/authStore';

const PRIORITY_COLORS = {
  high: 'border-l-primary bg-blue-50 dark:bg-blue-900/20 dark:border-l-primary',
  medium: 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-l-gray-300 dark:border-l-gray-600 bg-gray-50 dark:bg-[#252830]',
};

const EXAMPLE_QUERIES = [
  'I want to start a business in Lusaka',
  'How do I register with PACRA?',
  'Find funding for my poultry farm',
  'What tax do I pay as a sole trader?',
  'I want to hire my first employee',
  'Help me build a CV',
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
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 px-4 pb-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e2128] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden border border-gray-100 dark:border-[#2d3139]">

        {/* Search Input */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#2d3139] flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <Search className="w-4 h-4 text-white" />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-gray-800 dark:text-[#e8eaed] text-base placeholder-gray-400 dark:placeholder-gray-600 outline-none bg-transparent font-medium"
            placeholder="Search IMPUNGA..."
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          ) : query ? (
            <button onClick={() => { setQuery(''); setResults(null); setHasSearched(false); }} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark disabled:opacity-40 transition-colors shrink-0 hidden sm:block"
          >
            Search
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-[#0f1117]/50">

          {/* Suggested searches */}
          {!hasSearched && (
            <div>
              <p className="text-[11px] font-extrabold text-gray-400 dark:text-[#9aa0a6] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Try searching for...
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map(ex => (
                  <button
                    key={ex}
                    onClick={() => handleExampleClick(ex)}
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1e2128] border border-gray-200 dark:border-[#2d3139] px-4 py-2 rounded-full hover:border-primary/40 hover:text-primary dark:hover:text-primary-light hover:shadow-sm transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-[#e8eaed]">Understanding your query...</p>
              <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-1">Finding the best resources for you</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div className="space-y-4">
              {/* Intent */}
              <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/10 dark:border-primary/20">
                <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider mb-1.5">What IMPUNGA understood</p>
                <p className="text-sm text-gray-800 dark:text-[#e8eaed] font-medium">{results.intent}</p>
              </div>

              {/* Modules */}
              {results.modules?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold text-gray-400 dark:text-[#9aa0a6] uppercase tracking-wider">Relevant Tools</p>
                  {results.modules.map((mod, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigate(mod.path)}
                      className={`w-full text-left rounded-2xl px-4 py-3.5 border-l-4 border border-transparent bg-white dark:bg-[#1e2128] hover:shadow-md transition-all group ${PRIORITY_COLORS[mod.priority] || PRIORITY_COLORS.low}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-[#e8eaed] text-sm">{mod.name}</p>
                          <p className="text-xs text-gray-500 dark:text-[#9aa0a6] mt-0.5 leading-snug">{mod.reason}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary shrink-0 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Market Prices shortcut */}
              {results.marketCategory && (
                <button onClick={() => handleNavigate('/market-prices')} className="w-full text-left bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 border-l-4 border-l-orange-400 rounded-2xl px-4 py-3.5 hover:shadow-sm transition-shadow group">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-[#e8eaed] text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" /> Market Prices — {results.marketCategory}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#9aa0a6] mt-0.5">Check current Zambian prices for this category</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 shrink-0 transition-colors" />
                  </div>
                </button>
              )}

              {/* Funding shortcut */}
              {results.fundingKeyword && (
                <button onClick={() => handleNavigate('/engine/finance')} className="w-full text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 border-l-4 border-l-purple-400 rounded-2xl px-4 py-3.5 hover:shadow-sm transition-shadow group">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-[#e8eaed] text-sm">Finance & Funding — {results.fundingKeyword}</p>
                      <p className="text-xs text-gray-500 dark:text-[#9aa0a6] mt-0.5">Find Zambian grants and loans for this sector</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 shrink-0 transition-colors" />
                  </div>
                </button>
              )}

              {/* Tip */}
              {results.tip && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Quick Tip</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">{results.tip}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {hasSearched && !loading && results?.modules?.length === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-white dark:bg-[#1e2128] rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300 dark:text-gray-600 shadow-sm border border-gray-100 dark:border-[#2d3139]">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-[#e8eaed] mb-1">No specific modules found</p>
              <p className="text-xs text-gray-500 dark:text-[#9aa0a6] mb-5">Try the AI Advisor for open-ended questions</p>
              <button onClick={() => handleNavigate('/ai-advisor')} className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm">
                Open AI Advisor
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-[#2d3139] bg-white dark:bg-[#1e2128] px-5 py-3 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-400 dark:text-[#9aa0a6] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Powered by Groq AI
          </p>
          <button onClick={onClose} className="text-xs bg-gray-100 dark:bg-[#252830] hover:bg-gray-200 dark:hover:bg-[#2d3139] px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 font-bold transition-colors">
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}

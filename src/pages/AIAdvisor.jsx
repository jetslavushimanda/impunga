import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, Copy, Check, TrendingUp, GraduationCap, DollarSign, Handshake, Clock, SquarePen, Download, Trash2, X, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import useAuthStore from '../store/authStore';
import ErrorMessage from '../components/shared/ErrorMessage';
import AIResponse from '../components/shared/AIResponse';

const HISTORY_KEY = 'impunga_chat_history';
const MAX_HISTORY = 20;

const FAQ_CATEGORIES = [
  {
    label: 'Business Space',
    icon: TrendingUp,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    questions: [
      'How do I validate my business idea before spending money?',
      'Help me write a business plan for a poultry farm in Lusaka',
      'How do I register my business with PACRA step by step?',
      'What should I track in my Business Ledger every month?',
      'How do I calculate the right selling price for my product?',
    ],
  },
  {
    label: 'Career Connect',
    icon: GraduationCap,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    questions: [
      'What careers match someone with accounting and Excel skills?',
      'Help me prepare for a job interview as a sales representative',
      'Write me a cover letter for a bank teller position',
      'How do I build a professional CV with no work experience?',
      'How do I negotiate a salary in a Zambian company?',
    ],
  },
  {
    label: 'Finance & Funding',
    icon: DollarSign,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    questions: [
      'What grants are available for Zambian youth entrepreneurs?',
      'How do I qualify for a CEEC loan for my small business?',
      'What is the difference between a grant, a loan, and equity?',
      'How do I find angel investors for my tech startup?',
      'What do Zambian investors look for in a pitch?',
    ],
  },
  {
    label: 'Community & Market',
    icon: Handshake,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    questions: [
      'How do I find piece-work or short-term jobs near me?',
      'How do I respond to a B2B tender in Zambia?',
      'What are the current maize prices in Zambia?',
      'How do I build trust with buyers in the Verified Directory?',
      'How can I list my equipment for rental?',
    ],
  },
  {
    label: 'General Help',
    icon: Sparkles,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    questions: [
      'Draft a supplier email asking for better prices',
      'Explain the Zambian tax system in simple terms',
      'Help me do a break-even calculation for my shop',
      'What is the ZRA TPIN and how do I get one?',
      'How do I manage cash flow in a seasonal business?',
    ],
  },
];

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 150, 300].map(d => (
        <span key={d} className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveToHistory(messages) {
  if (!messages.length) return;
  try {
    const existing = loadHistory();
    const entry = { id: Date.now(), title: messages.find(m => m.role === 'user')?.content?.slice(0, 60) || 'Conversation', date: new Date().toLocaleDateString('en-GB'), messages };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_HISTORY)));
  } catch {}
}

function FAQModal({ onClose, onSelect }) {
  const [active, setActive] = useState(0);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1e2128] w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-gray-100 dark:border-[#2d3139] flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2d3139] shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-extrabold text-gray-900 dark:text-[#e8eaed] text-sm">Browse Topics</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#252830] hover:bg-gray-200 dark:hover:bg-[#2d3139] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b border-gray-100 dark:border-[#2d3139] shrink-0 no-scrollbar">
          {FAQ_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                active === i ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-[#252830] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2d3139]'
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {FAQ_CATEGORIES[active].questions.map((q, i) => (
            <button
              key={i}
              onClick={() => { onSelect(q); onClose(); }}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-[#252830] hover:bg-primary/5 dark:hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-2xl transition-all group"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light flex-1 leading-snug">{q}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { getBusinessAdvice, loading, error, retrySeconds } = useAI();
  const { userProfile } = useAuthStore();
  const { state: locationState } = useLocation();
  const [pipelineData, setPipelineData] = useState(null);

  useEffect(() => {
    if (locationState?.openHistory) { setHistory(loadHistory()); setShowHistory(true); }
  }, [locationState]);

  useEffect(() => {
    const stored = localStorage.getItem('impunga_idea_pipeline');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPipelineData(parsed);
      if (messages.length === 0) {
        setMessages([{ role: 'model', content: "I see you have an active **Startup Blueprint**! I'm your AI Co-Founder — ask me anything about executing your plan.", id: 'greeting' }]);
      }
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const hist = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
    let ctx = userProfile ? `Province: ${userProfile.province}, Occupation: ${userProfile.occupation}` : '';
    if (pipelineData) ctx += `\n\nACTIVE BLUEPRINT:\nIdea: ${pipelineData.ideaText}\nBudget: ${pipelineData.budget}\nLocation: ${pipelineData.location}`;
    try {
      const response = await getBusinessAdvice(msg, hist, ctx);
      setMessages(prev => [...prev, { role: 'model', content: response, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to get a response. Please try again.', id: Date.now() + 1 }]);
    }
  }

  async function copyMessage(content, id) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function newConversation() { saveToHistory(messages); setMessages([]); setInput(''); }
  function openHistory() { setHistory(loadHistory()); setShowHistory(true); }
  function loadConversation(entry) { setMessages(entry.messages); setShowHistory(false); }
  function deleteHistory(id, e) {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }
  function exportChat() {
    if (!messages.length) return;
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'IMPUNGA AI'}:\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `impunga-chat-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100svh-175px)] lg:h-[calc(100svh-112px)] text-left mt-2 relative">

      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between mb-3 bg-white dark:bg-[#1e2128] rounded-2xl border border-gray-200 dark:border-[#2d3139] px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-0.5">
          <button onClick={openHistory} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252830] transition-all">
            <Clock className="w-3.5 h-3.5" /> History
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-[#2d3139] mx-1" />
          <button onClick={newConversation} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252830] transition-all">
            <SquarePen className="w-3.5 h-3.5" /> New
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={exportChat} disabled={!messages.length} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252830] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={newConversation} disabled={!messages.length} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center px-4 pt-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-white dark:border-[#1e2128] shrink-0">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 dark:text-[#e8eaed] mb-2">How can I help you?</h2>
            <p className="text-gray-500 dark:text-[#9aa0a6] text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Ask me anything about Zambian business, careers, funding, or daily operations.
            </p>
            <button
              onClick={() => setShowFAQ(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#252830] border border-gray-200 dark:border-[#2d3139] rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-primary/40 hover:text-primary dark:hover:text-primary-light hover:shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4" /> Browse example topics
            </button>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-3xl rounded-tr-sm px-5 py-3.5 text-sm shadow-sm'
                  : msg.role === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl rounded-tl-sm px-5 py-3.5 text-red-700 dark:text-red-300 text-sm'
                    : 'bg-white dark:bg-[#1e2128] border border-gray-100 dark:border-[#2d3139] text-gray-800 dark:text-[#e8eaed] rounded-3xl rounded-tl-sm px-5 py-4 text-sm shadow-sm'
              }>
                {msg.role === 'model'
                  ? <AIResponse content={msg.content} />
                  : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                }
              </div>
              {msg.role === 'model' && (
                <button onClick={() => copyMessage(msg.content, msg.id)} className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-1 ml-2 transition-colors">
                  {copiedId === msg.id ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-[#1e2128] border border-gray-100 dark:border-[#2d3139] rounded-3xl rounded-tl-sm px-2 py-2 shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && !loading && <ErrorMessage message={error} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 mt-2">
        <div className="flex items-end bg-white dark:bg-[#1e2128] rounded-[2rem] border border-gray-200 dark:border-[#2d3139] shadow-lg shadow-gray-200/30 dark:shadow-black/20 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary dark:focus-within:border-primary transition-all p-1.5 pl-5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1 resize-none bg-transparent py-3 outline-none min-h-[48px] max-h-32 text-gray-800 dark:text-[#e8eaed] placeholder-gray-400 dark:placeholder-gray-600 text-sm"
            placeholder="Ask anything..."
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || retrySeconds > 0}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:bg-gray-200 dark:disabled:bg-[#252830] disabled:text-gray-400 mb-0.5 ml-2"
          >
            {retrySeconds > 0 ? <span className="text-xs font-bold">{retrySeconds}s</span> : <Send className="w-5 h-5 -ml-0.5" />}
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="absolute inset-0 bg-white dark:bg-[#1e2128] rounded-2xl z-20 flex flex-col shadow-2xl border border-gray-100 dark:border-[#2d3139]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2d3139] shrink-0">
            <h3 className="font-extrabold text-gray-900 dark:text-[#e8eaed] text-sm">Chat History</h3>
            <button onClick={() => setShowHistory(false)} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#252830] hover:bg-gray-200 dark:hover:bg-[#2d3139] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Clock className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">No history yet</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Past conversations will appear here</p>
              </div>
            ) : history.map(entry => (
              <div key={entry.id} onClick={() => loadConversation(entry)} className="group flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#252830] hover:bg-primary/5 dark:hover:bg-primary/10 border border-transparent hover:border-primary/20 cursor-pointer transition-all">
                <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary dark:text-primary-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-[#e8eaed] truncate">{entry.title}</p>
                  <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-0.5">{entry.date} · {entry.messages.length} messages</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => deleteHistory(entry.id, e)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} onSelect={sendMessage} />}
    </div>
  );
}

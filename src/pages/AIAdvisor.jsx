import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, Copy, Check, TrendingUp, GraduationCap, DollarSign, Handshake, Clock, SquarePen, Download, Trash2, X, ChevronRight } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import useAuthStore from '../store/authStore';
import ErrorMessage from '../components/shared/ErrorMessage';
import AIResponse from '../components/shared/AIResponse';

const HISTORY_KEY = 'impunga_chat_history';
const MAX_HISTORY = 20;

const SUGGESTION_CATEGORIES = [
  {
    label: 'Business Space',
    questions: [
      'How do I validate my business idea before spending money?',
      'Help me write a business plan for a poultry farm in Lusaka',
      'How do I register my business with PACRA step by step?',
      'What should I track in my Business Ledger every month?',
      'How do I calculate the right selling price for my product?',
      'Generate a catchy business name for a Zambian food delivery startup',
    ],
  },
  {
    label: 'Career Connect',
    questions: [
      'What careers match someone with accounting and Excel skills?',
      'Help me prepare for a job interview as a sales representative',
      'Write me a cover letter for a bank teller position',
      'How do I build a professional CV with no work experience?',
      'What skills should I learn to get a better job in Zambia?',
      'How do I negotiate a salary in a Zambian company?',
    ],
  },
  {
    label: 'Finance & Funding',
    questions: [
      'What grants are available for Zambian youth entrepreneurs?',
      'How do I qualify for a CEEC loan for my small business?',
      'What is the difference between a grant, a loan, and equity?',
      'How do I calculate if my business can afford a bank loan?',
      'What do Zambian investors look for in a pitch?',
      'How do I find angel investors for my tech startup?',
    ],
  },
  {
    label: 'Community & Market',
    questions: [
      'How do I find piece-work or short-term jobs near me?',
      'How can I list my tractor for rental on Asset Rentals?',
      'How do I respond to a B2B tender in Zambia?',
      'What are the current maize prices in Zambia?',
      'How do I build trust with buyers in the Verified Directory?',
      'How do I showcase my tailoring skills to get clients?',
    ],
  },
  {
    label: 'AI Can Also Help',
    questions: [
      'Draft a supplier email asking for better prices',
      'Write a WhatsApp message to follow up with a client',
      'Explain the Zambian tax system in simple terms',
      'What are the best side hustles in Zambia right now?',
      'Help me do a break-even calculation for my shop',
      'What is the ZRA TPIN and how do I get one?',
      'How do I manage cash flow in a seasonal business?',
      'Translate my business idea into a one-page pitch',
      "What are Zambia's fastest growing industries in 2025?",
      'How do I fire an employee legally in Zambia?',
    ],
  },
];

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 150, 300].map(delay => (
        <span key={delay} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
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
    const entry = {
      id: Date.now(),
      title: messages.find(m => m.role === 'user')?.content?.slice(0, 60) || 'Conversation',
      date: new Date().toLocaleDateString('en-GB'),
      messages,
    };
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { getBusinessAdvice, loading, error, retrySeconds } = useAI();
  const { userProfile } = useAuthStore();
  const { state: locationState } = useLocation();
  const [pipelineData, setPipelineData] = useState(null);

  useEffect(() => {
    if (locationState?.openHistory) {
      setHistory(loadHistory());
      setShowHistory(true);
    }
  }, [locationState]);

  useEffect(() => {
    const stored = localStorage.getItem('impunga_idea_pipeline');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPipelineData(parsed);
      if (messages.length === 0) {
        setMessages([{
          role: 'model',
          content: "I see you have an active **Startup Blueprint**! I'm your AI Co-Founder. Ask me anything about executing your plan, finding suppliers, or beating your competitors.",
          id: 'system-greeting'
        }]);
      }
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    let userContext = userProfile
      ? `Province: ${userProfile.province}, Occupation: ${userProfile.occupation}, Experience: ${userProfile.experience}`
      : '';
    if (pipelineData) {
      userContext += `\n\nACTIVE STARTUP BLUEPRINT:\nIdea: ${pipelineData.ideaText}\nValidation: ${pipelineData.aiAnalysis}\nBudget: ${pipelineData.budget}\nLocation: ${pipelineData.location}`;
    }
    try {
      const response = await getBusinessAdvice(msg, history, userContext);
      setMessages(prev => [...prev, { role: 'model', content: response, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to get a response. Please try again.', id: Date.now() + 1 }]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  async function copyMessage(content, id) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function newConversation() {
    saveToHistory(messages);
    setMessages([]);
    setInput('');
  }

  function openHistory() {
    setHistory(loadHistory());
    setShowHistory(true);
  }

  function loadConversation(entry) {
    setMessages(entry.messages);
    setShowHistory(false);
  }

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
    a.href = url;
    a.download = `impunga-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100svh-175px)] lg:h-[calc(100svh-112px)] animate-fade-in text-left mt-2 relative">

      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between mb-4 bg-white rounded-2xl border border-gray-200 px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={openHistory}
            title="Chat history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            History
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={newConversation}
            title="New chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <SquarePen className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={exportChat}
            disabled={!messages.length}
            title="Export conversation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={newConversation}
            disabled={!messages.length}
            title="Clear chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center px-4 animate-fade-in mt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-white shrink-0">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Ask me anything — IMPUNGA modules, Zambian business, careers, funding, or anything else.
            </p>

            {/* Engines Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mx-auto mb-6 text-left">
              {[
                { icon: TrendingUp, label: 'Business Space', color: 'bg-blue-50 text-blue-600', desc: 'Idea, Plan, Ledger, Pricing' },
                { icon: GraduationCap, label: 'Career Connect', color: 'bg-purple-50 text-purple-600', desc: 'CV, Jobs, Interview Prep' },
                { icon: DollarSign, label: 'Finance & Funding', color: 'bg-emerald-50 text-emerald-600', desc: 'Grants, Loans, Investment' },
                { icon: Handshake, label: 'Community', color: 'bg-orange-50 text-orange-600', desc: 'Tenders, Gigs, Rentals' },
              ].map(({ icon: Icon, label, color, desc }) => (
                <div key={label} className="p-3 bg-white border border-gray-100 rounded-2xl flex flex-col gap-2 shadow-sm">
                  <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] text-gray-800 leading-tight">{label}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category tabs */}
            <div className="w-full max-w-2xl mb-3 text-left">
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCategory(i)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      activeCategory === i
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl mx-auto">
              {SUGGESTION_CATEGORIES[activeCategory].questions.slice(0, 6).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3.5 bg-white rounded-2xl hover:bg-gray-50 transition-all border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 group cursor-pointer"
                >
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors leading-snug">{q}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
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
                    ? 'bg-red-50 border border-red-200 rounded-3xl rounded-tl-sm px-5 py-3.5 text-red-700 text-sm shadow-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-tl-sm px-5 py-4 text-sm shadow-sm'
              }>
                {msg.role === 'model'
                  ? <AIResponse content={msg.content} />
                  : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                }
              </div>
              {msg.role === 'model' && (
                <button onClick={() => copyMessage(msg.content, msg.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1 ml-2 transition-colors">
                  {copiedId === msg.id ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm px-2 py-2 shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && !loading && <ErrorMessage message={error} />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="relative shrink-0 mt-2">
        <div className="relative flex items-end bg-white rounded-[2rem] border border-gray-200 shadow-lg shadow-gray-200/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all p-1.5 pl-5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none bg-transparent py-3 outline-none min-h-[48px] max-h-32 text-gray-800 placeholder-gray-400 text-sm"
            placeholder="Ask anything..."
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || retrySeconds > 0}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 mb-0.5 ml-2"
          >
            {retrySeconds > 0 ? <span className="text-xs font-bold">{retrySeconds}s</span> : <Send className="w-5 h-5 -ml-0.5" />}
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="absolute inset-0 bg-white rounded-2xl z-20 flex flex-col shadow-2xl border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h3 className="font-extrabold text-gray-900 text-sm">Chat History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Clock className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-400">No history yet</p>
                <p className="text-xs text-gray-300 mt-1">Past conversations will appear here</p>
              </div>
            ) : (
              history.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => loadConversation(entry)}
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{entry.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{entry.date} · {entry.messages.length} messages</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => deleteHistory(entry.id, e)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

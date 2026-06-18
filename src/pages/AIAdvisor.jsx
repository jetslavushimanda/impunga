import { useState, useRef, useEffect } from 'react';
import { Bot, Send, RotateCcw, Copy, Check, Navigation, Building2, Wallet, Users } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import useAuthStore from '../store/authStore';
import ErrorMessage from '../components/shared/ErrorMessage';
import AIResponse from '../components/shared/AIResponse';

const SUGGESTED_QUESTIONS = [
  'How do I test my business idea using the Idea Validator?',
  'What are the requirements and costs for PACRA registration?',
  'Where can I apply for CEEC loans or non-dilutive grants?',
  'How do I use the Piece-Work Board to find short-term tasks?',
  'How do I setup my profile in the Skill Profile Builder?',
  'What ZRA tax deadlines do I need to follow in the Compliance Tracker?',
  'How do I list machinery or tools on the Asset Rentals portal?',
  'Can you help me calculate my product markup in the Pricing Calculator?'
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

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { getBusinessAdvice, loading, error, retrySeconds } = useAI();
  const { userProfile } = useAuthStore();
  const [pipelineData, setPipelineData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('impunga_idea_pipeline');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPipelineData(parsed);
      
      // Auto-add greeting if blueprint exists and no messages
      if (messages.length === 0) {
        setMessages([
          { 
            role: 'model', 
            content: "I see you have an active **Startup Blueprint**! I am your AI Co-Founder. Ask me anything about executing your plan, finding suppliers, or beating your competitors.", 
            id: 'system-greeting' 
          }
        ]);
      }
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg) return;
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
      userContext += `\n\nACTIVE STARTUP BLUEPRINT:\nIdea Data: ${pipelineData.ideaText}\nAI Validation Data: ${pipelineData.aiAnalysis}\nBudget: ${pipelineData.budget}\nLocation: ${pipelineData.location}\nACT AS THE CO-FOUNDER TO HELP EXECUTE THIS SPECIFIC BLUEPRINT.`;
    }

    try {
      const response = await getBusinessAdvice(msg, history, userContext);
      setMessages(prev => [...prev, { role: 'model', content: response, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to get response. Please try again.', id: Date.now() + 1 }]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function copyMessage(content, id) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function newConversation() {
    setMessages([]);
    setInput('');
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-130px)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">IMPUNGA AI Assistant</h1>
            <p className="text-gray-500 text-xs">Platform Guide · Business Advisor</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={newConversation} className="btn-secondary gap-2 text-sm">
            <RotateCcw className="w-4 h-4" /> New Chat
          </button>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center px-4 animate-fade-in mt-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-white shrink-0">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
              I am your intelligent platform guide. Ask me anything about IMPUNGA modules, Zambia business registration, or funding.
            </p>

            {/* Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto mb-8 text-left">
              <div className="p-4 bg-white/60 border border-gray-100 rounded-2xl flex gap-3 shadow-sm">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Navigation className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wide">Platform Navigator</h4>
                  <p className="text-xs text-gray-500 mt-1">Get guided walks on how to use the Idea Validator, SWOT, and Ledger tools.</p>
                </div>
              </div>

              <div className="p-4 bg-white/60 border border-gray-100 rounded-2xl flex gap-3 shadow-sm">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wide">PACRA & ZRA Assistant</h4>
                  <p className="text-xs text-gray-500 mt-1">Understand how to register companies, obtain TPINs, and track tax deadlines.</p>
                </div>
              </div>

              <div className="p-4 bg-white/60 border border-gray-100 rounded-2xl flex gap-3 shadow-sm">
                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wide">Funding & Finance Finder</h4>
                  <p className="text-xs text-gray-500 mt-1">Learn typical criteria for CEEC, CDF, and regional private equity venture funds.</p>
                </div>
              </div>

              <div className="p-4 bg-white/60 border border-gray-100 rounded-2xl flex gap-3 shadow-sm">
                <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wide">Community & Connections</h4>
                  <p className="text-xs text-gray-500 mt-1">Discover B2B Tenders, local Piece-Works, and machinery rentals on the platform.</p>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-2xl text-left mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Questions</span>
            </div>

            {/* Beautiful Suggested Questions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
              {SUGGESTED_QUESTIONS.slice(0, 6).map(q => (
                <button 
                  key={q} 
                  onClick={() => sendMessage(q)} 
                  className="text-left px-5 py-3.5 bg-white rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm hover:shadow-md group cursor-pointer"
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
              <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 text-base shadow-sm' 
                  : msg.role === 'error' 
                    ? 'bg-red-50 border border-red-200 rounded-3xl rounded-tl-sm px-5 py-3.5 text-red-700 text-base shadow-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-tl-sm px-5 py-4 text-base shadow-sm'
              }>
                {msg.role === 'model'
                  ? <AIResponse content={msg.content} />
                  : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                }
              </div>
              {msg.role === 'model' && (
                <button onClick={() => copyMessage(msg.content, msg.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1 ml-2">
                  {copiedId === msg.id ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm px-2 py-2 shadow-sm flex items-center">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && !loading && <ErrorMessage message={error} />}
        <div ref={bottomRef} />
      </div>



      {/* Sleek Input Bar */}
      <div className="relative shrink-0 mt-2">
        <div className="relative flex items-end bg-white rounded-[2rem] border border-gray-200 shadow-lg shadow-gray-200/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all p-1.5 pl-5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none bg-transparent py-3 outline-none min-h-[48px] max-h-32 text-gray-800 placeholder-gray-400"
            placeholder="Ask your assistant anything..."
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
    </div>
  );
}

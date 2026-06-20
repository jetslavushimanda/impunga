import { useState, useRef, useEffect } from 'react';
import { Bot, ArrowUp, Clock, ExternalLink, SquarePen, PanelRightClose } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../../hooks/useAI';
import AIResponse from '../shared/AIResponse';
import useAuthStore from '../../store/authStore';
import { getGreeting, getFirstName } from '../../lib/utils';

const HISTORY_KEY = 'impunga_chat_history';
const MAX_HISTORY = 20;

function saveToHistory(messages) {
  if (!messages.length) return;
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const entry = {
      id: Date.now(),
      title: messages.find(m => m.role === 'user')?.content?.slice(0, 60) || 'Conversation',
      date: new Date().toLocaleDateString('en-GB'),
      messages,
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_HISTORY)));
  } catch {}
}

export default function AIChatPanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const { getBusinessAdvice, loading } = useAI();
  const { userProfile } = useAuthStore();

  useEffect(() => { textareaRef.current?.focus(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  async function handleSend(text = input) {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    const userMsg = { role: 'user', content: q, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    try {
      const response = await getBusinessAdvice(q, history, userProfile?.occupation || 'Zambian entrepreneur');
      if (response) setMessages(prev => [...prev, { role: 'model', content: response, id: Date.now() + 1 }]);
    } catch {}
  }

  const navigate = useNavigate();
  const firstName = getFirstName(userProfile?.fullName || '');
  const greeting = getGreeting();

  return (
    <div
      className="hidden lg:flex flex-col fixed right-4 xl:right-6 bottom-4 xl:bottom-6 w-95 xl:w-105 max-w-[calc(100vw-2rem)] z-50 bg-white dark:bg-[#1e2128] rounded-3xl overflow-hidden"
      style={{ top: '68px', boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 dark:border-[#2d3139]">
        {/* Top row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-[#e8eaed] font-bold text-sm">IMPUNGA AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <button
            onClick={onClose}
            title="Collapse"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252830] transition-all"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1 px-4 pb-3">
          <button
            onClick={() => { saveToHistory(messages); navigate('/ai-advisor', { state: { openHistory: true } }); onClose(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252830] transition-all"
          >
            <Clock className="w-3.5 h-3.5" /> History
          </button>
          <button
            onClick={() => { navigate('/ai-advisor'); onClose(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252830] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </button>
          <button
            onClick={() => { saveToHistory(messages); setMessages([]); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252830] transition-all"
          >
            <SquarePen className="w-3.5 h-3.5" /> New chat
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-gray-50/50 dark:bg-[#0f1117]">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 dark:text-[#9aa0a6] text-xs font-medium">{greeting}{firstName ? `, ${firstName}` : ''}</p>
            <h2 className="text-gray-900 dark:text-[#e8eaed] text-xl font-bold leading-snug">How may I help you today?</h2>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-white text-sm px-4 py-3 rounded-2xl rounded-br-sm leading-relaxed font-medium">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 text-sm text-gray-700 dark:text-[#e8eaed] leading-relaxed">
                  <AIResponse content={msg.content} className="text-sm text-gray-700 dark:text-[#e8eaed] leading-relaxed" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex gap-1.5 pt-2">
              {[0, 160, 320].map(d => (
                <span key={d} className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-4 bg-white dark:bg-[#1e2128] border-t border-gray-100 dark:border-[#2d3139]">
        <div className="flex items-end gap-3 bg-gray-100 dark:bg-[#252830] rounded-2xl px-4 py-3 border border-gray-200 dark:border-[#2d3139] focus-within:border-primary/40 focus-within:bg-white dark:focus-within:bg-[#1e2128] transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            onChange={e => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything..."
            className="flex-1 text-sm bg-transparent outline-none resize-none leading-relaxed font-medium text-gray-800 dark:text-[#e8eaed] placeholder-gray-400 dark:placeholder-gray-600"
            style={{ minHeight: '22px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-primary hover:bg-primary-dark disabled:bg-gray-200 dark:disabled:bg-[#2d3139] rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <ArrowUp className="w-4 h-4 text-white dark:disabled:text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

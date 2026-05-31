import { useState, useRef, useEffect } from 'react';
import { Bot, Send, RotateCcw, Copy, Check } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import ErrorMessage from '../components/shared/ErrorMessage';

const SUGGESTED_QUESTIONS = [
  'How do I register my business with PACRA?',
  'I am not making profit. What am I doing wrong?',
  'How do I open a business bank account in Zambia?',
  'Where can I find funding for my startup?',
  'How do I market my business on social media in Zambia?',
  'What taxes do I need to pay as a small business?',
  'How do I write a quotation or invoice?',
  'How do I handle a difficult customer?',
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
  const { getBusinessAdvice, loading, error } = useGemini();
  const { userProfile } = useAuthStore();

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

    const userContext = userProfile
      ? `Province: ${userProfile.province}, Occupation: ${userProfile.occupation}, Experience: ${userProfile.experience}`
      : '';

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
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Business Advisor</h1>
            <p className="text-gray-500 text-xs">Powered by Google Gemini · Zambia-specific advice</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={newConversation} className="btn-secondary gap-2 text-sm">
            <RotateCcw className="w-4 h-4" /> New Chat
          </button>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto bg-surface-light rounded-xl border border-gray-200 p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-12 h-12 text-primary opacity-20 mb-3" />
            <h3 className="font-semibold text-gray-600 mb-1">Your AI Business Mentor</h3>
            <p className="text-gray-400 text-sm max-w-xs">Ask any business question. I give advice specific to Zambia — PACRA, ZRA, CEEC, Kwacha pricing and more.</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== 'user' && (
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="max-w-[80%]">
              <div className={msg.role === 'user' ? 'chat-bubble-user' : msg.role === 'error' ? 'bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm' : 'chat-bubble-ai'}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai">
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && !loading && <ErrorMessage message={error} />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 my-3 flex-shrink-0">
          {SUGGESTED_QUESTIONS.slice(0, 4).map(q => (
            <button key={q} onClick={() => sendMessage(q)} className="text-xs px-3 py-1.5 bg-surface-blue text-primary rounded-full hover:bg-primary hover:text-white transition-colors border border-primary/20">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0 mt-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="textarea-field flex-1 resize-none min-h-[44px] max-h-32"
          placeholder="Ask any business question... (Enter to send)"
          rows={1}
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="btn-primary px-4 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

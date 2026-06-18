import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, RefreshCw, Copy, Check, ArrowLeft } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { Toast, useToast } from '../components/shared/SuccessToast';
import { BUSINESS_SECTORS } from '../data/businessSectors';
import PageHeaderCard from '../components/shared/PageHeaderCard';

export default function BusinessNameGenerator() {
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [style, setStyle] = useState('professional');
  const [names, setNames] = useState([]);
  const [copied, setCopied] = useState('');
  const navigate = useNavigate();
  const { generateBusinessNames, loading, error } = useAI();
  const { addDocument } = useFirestore();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();

  async function handleGenerate() {
    if (description.length < 10) return;
    try {
      const result = await generateBusinessNames(description, sector, style, userProfile?.province);
      setNames(result);
    } catch {}
  }

  async function handleSave(name) {
    try {
      await addDocument('savedNames', { name, description, sector });
      show(`"${name.name}" saved!`);
    } catch { show('Save failed.', 'error'); }
  }

  async function handleCopy(text) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeaderCard 
        title="Business Name Generator"
        description="AI generates unique Zambian business names for your idea"
        icon={Sparkles}
        bg="bg-purple-50"
        text="text-purple-600"
        badge="AI GENERATOR"
        badgeColor="purple"
      />

      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-6 relative z-10">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Describe your business *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all min-h-[120px] shadow-sm resize-none"
            rows={3}
            placeholder="e.g. I sell homemade peanut butter in Lusaka. I want a name that sounds local and trustworthy."
          />
          <p className={`text-xs mt-2 font-medium ${description.length < 10 ? 'text-red-400' : 'text-green-500'}`}>
            {description.length} characters {description.length < 10 ? '(minimum 10 required)' : '✓ Looks good!'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none shadow-sm cursor-pointer">
              <option value="">Any sector</option>
              {BUSINESS_SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none shadow-sm cursor-pointer">
              <option value="professional">Professional & Formal</option>
              <option value="local">Local Zambian Language</option>
              <option value="modern">Modern & Catchy</option>
              <option value="descriptive">Descriptive & Clear</option>
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button 
          onClick={handleGenerate} 
          disabled={loading || description.length < 10} 
          className="relative z-10 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          {loading ? <><LoadingSpinner size="sm" /> Generating names...</> : <><Sparkles className="w-5 h-5" /> Generate Business Names</>}
        </button>
      </div>

      {names.length > 0 && (
        <div className="space-y-4 animate-slide-up pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Generated Names</h2>
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="flex items-center gap-1.5 border border-gray-200 hover:bg-white text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl transition-colors bg-white/50 backdrop-blur-sm shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Generating...' : 'Regenerate'}
            </button>
          </div>
          <div className="grid gap-4">
            {names.map((item, i) => (
              <div key={i} className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 text-xl mb-1">{item.name}</h3>
                    {item.meaning && <p className="text-sm text-yellow-600 font-semibold mb-2">Meaning: {item.meaning}</p>}
                    <p className="text-gray-600 text-sm leading-relaxed">{item.reason}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(item.name)} className="p-2.5 bg-gray-50 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded-xl transition-colors shadow-sm border border-gray-100">
                      {copied === item.name ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleSave(item)} className="p-2.5 bg-gray-50 hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 rounded-xl transition-colors shadow-sm border border-gray-100">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

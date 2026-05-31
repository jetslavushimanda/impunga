import { useState } from 'react';
import { Sparkles, Save, RefreshCw, Copy, Check } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { Toast, useToast } from '../components/shared/SuccessToast';
import { BUSINESS_SECTORS } from '../data/businessSectors';

export default function BusinessNameGenerator() {
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [style, setStyle] = useState('professional');
  const [names, setNames] = useState([]);
  const [copied, setCopied] = useState('');
  const { generateBusinessNames, loading, error } = useGemini();
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

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Name Generator</h1>
          <p className="text-gray-500 text-sm">AI generates unique Zambian business names for your idea</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="mb-4">
          <label className="label">Describe your business *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="textarea-field"
            rows={3}
            placeholder="e.g. I sell homemade peanut butter in Lusaka. I want a name that sounds local and trustworthy."
          />
          <p className={`text-xs mt-1 ${description.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
            {description.length} characters {description.length < 10 ? '(minimum 10)' : '✓'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Business Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value)} className="select-field">
              <option value="">Any sector</option>
              {BUSINESS_SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Name Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)} className="select-field">
              <option value="professional">Professional & Formal</option>
              <option value="local">Local Zambian Language</option>
              <option value="modern">Modern & Catchy</option>
              <option value="descriptive">Descriptive & Clear</option>
            </select>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button onClick={handleGenerate} disabled={loading || description.length < 10} className="btn-primary w-full gap-2">
          {loading ? <><LoadingSpinner size="sm" /> Generating names...</> : <><Sparkles className="w-4 h-4" /> Generate Business Names</>}
        </button>
      </div>

      {names.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800">Generated Names</h2>
            <button onClick={handleGenerate} className="btn-secondary text-sm gap-1">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
          {names.map((item, i) => (
            <div key={i} className="card border-l-4 border-primary">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-primary text-lg">{item.name}</h3>
                  {item.meaning && <p className="text-xs text-accent-gold font-medium mb-1">Meaning: {item.meaning}</p>}
                  <p className="text-gray-600 text-sm">{item.reason}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleCopy(item.name)} className="p-2 text-gray-400 hover:text-primary rounded-lg">
                    {copied === item.name ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleSave(item)} className="p-2 text-gray-400 hover:text-accent-gold rounded-lg">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

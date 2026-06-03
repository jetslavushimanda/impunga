import { useState } from 'react';
import { Share2, Copy, Check, RefreshCw } from 'lucide-react';
import { callAI } from '../lib/gemini';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import AIResponse from '../components/shared/AIResponse';
import { Toast, useToast } from '../components/shared/SuccessToast';
import useAuthStore from '../store/authStore';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘', char: 500 },
  { id: 'whatsapp', label: 'WhatsApp Status', icon: '💬', char: 700 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', char: 150 },
  { id: 'instagram', label: 'Instagram', icon: '📸', char: 300 },
];

const GOALS = [
  'Promote a product or service',
  'Announce a sale or discount',
  'Launch a new product',
  'Share a customer testimonial',
  'Build brand awareness',
  'Announce business opening',
  'Seasonal/holiday promotion',
];

export default function SocialMediaGenerator() {
  const [businessName, setBusinessName] = useState('');
  const [product, setProduct] = useState('');
  const [goal, setGoal] = useState(GOALS[0]);
  const [extraDetails, setExtraDetails] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'whatsapp']);
  const [captions, setCaptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();

  function togglePlatform(id) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    if (!product) return;
    setLoading(true);
    setError('');
    try {
      const platformList = selectedPlatforms.map(id => PLATFORMS.find(p => p.id === id)?.label).join(', ');
      const prompt = `Create social media marketing captions for a Zambian business.

Business Name: ${businessName || 'My Business'}
Product/Service: ${product}
Goal: ${goal}
Extra details: ${extraDetails || 'None'}
Location: ${userProfile?.province || 'Zambia'}
Platforms needed: ${platformList}

For each platform, write one caption that:
- Uses simple Zambian English
- Is relevant to the Zambian market
- Includes relevant emojis
- Ends with a call to action
- Uses hashtags relevant to Zambia
- Stays within character limits

Return ONLY valid JSON:
{
  ${selectedPlatforms.map(id => `"${id}": "caption text here"`).join(',\n  ')}
}`;

      const system = 'You are a social media marketing expert for Zambian small businesses. Write engaging captions in simple English that Zambian audiences connect with. Use relevant Zambian hashtags. Return ONLY valid JSON.';
      const response = await callAI(prompt, system);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setCaptions(parsed);
    } catch (err) {
      setError(err.message?.includes('RATE_LIMIT') ? 'Too many requests. Wait 60 seconds.' : 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copy(text, id) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    show('Copied to clipboard!');
    setTimeout(() => setCopied(''), 2000);
  }

  function openWhatsApp(text) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function openFacebook(text) {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
          <Share2 className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Social Media Caption Generator</h1>
          <p className="text-gray-500 text-sm">AI writes marketing posts for Facebook, WhatsApp, TikTok and Instagram</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="space-y-4">
          <div><label className="label">Business Name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input-field" placeholder="e.g. Chanda's Fashion House" /></div>
          <div><label className="label">What are you promoting? *</label>
            <input value={product} onChange={e => setProduct(e.target.value)} className="input-field" placeholder="e.g. Chitenge dresses at K250, 50% off chicken this weekend" /></div>
          <div><label className="label">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="select-field">
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div><label className="label">Extra details (optional)</label>
            <input value={extraDetails} onChange={e => setExtraDetails(e.target.value)} className="input-field" placeholder="e.g. Sale ends Sunday, delivery available in Lusaka" /></div>
          <div>
            <label className="label">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${selectedPlatforms.includes(p.id) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="mt-3"><ErrorMessage message={error} /></div>}
        <button onClick={handleGenerate} disabled={loading || !product || selectedPlatforms.length === 0} className="btn-primary w-full mt-4 gap-2">
          {loading ? <><LoadingSpinner size="sm" /> Writing captions...</> : <><Share2 className="w-4 h-4" /> Generate Captions</>}
        </button>
      </div>

      {Object.keys(captions).length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Your Captions</h2>
            <button onClick={handleGenerate} className="btn-secondary text-sm gap-1">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
          {selectedPlatforms.map(id => {
            const platform = PLATFORMS.find(p => p.id === id);
            if (!captions[id]) return null;
            return (
              <div key={id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-xl">{platform.icon}</span> {platform.label}
                    <span className="text-xs text-gray-400 font-normal">{captions[id].length} chars</span>
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => copy(captions[id], id)} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors">
                      {copied === id ? <><Check className="w-3 h-3 text-green-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    {id === 'whatsapp' && (
                      <button onClick={() => openWhatsApp(captions[id])} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: '#25D366' }}>
                        Share
                      </button>
                    )}
                    {id === 'facebook' && (
                      <button onClick={() => openFacebook(captions[id])} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white bg-blue-600">
                        Share
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-surface-light rounded-xl p-4">
                  <AIResponse content={captions[id]} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

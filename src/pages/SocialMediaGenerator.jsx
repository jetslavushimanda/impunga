import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Copy, Check, RefreshCw, ArrowLeft, ThumbsUp, MessageCircle, Music, Camera } from 'lucide-react';
import { callAI } from '../lib/gemini';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import AIResponse from '../components/shared/AIResponse';
import { Toast, useToast } from '../components/shared/SuccessToast';
import useAuthStore from '../store/authStore';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: <ThumbsUp className="w-5 h-5 text-blue-600" />, char: 500 },
  { id: 'whatsapp', label: 'WhatsApp Status', icon: <MessageCircle className="w-5 h-5 text-green-500" />, char: 700 },
  { id: 'tiktok', label: 'TikTok', icon: <Music className="w-5 h-5 text-black" />, char: 150 },
  { id: 'instagram', label: 'Instagram', icon: <Camera className="w-5 h-5 text-pink-600" />, char: 300 },
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
  const navigate = useNavigate();

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
- Do NOT use any emojis
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
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      

      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-6 relative z-10">
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all shadow-sm" placeholder="e.g. Chanda's Fashion House" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">What are you promoting? *</label>
            <input value={product} onChange={e => setProduct(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all shadow-sm" placeholder="e.g. Chitenge dresses at K250, 50% off chicken this weekend" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all shadow-sm appearance-none cursor-pointer">
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Extra details (optional)</label>
            <input value={extraDetails} onChange={e => setExtraDetails(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all shadow-sm" placeholder="e.g. Sale ends Sunday, delivery available in Lusaka" /></div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Platforms</label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${selectedPlatforms.includes(p.id) ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent scale-105' : 'bg-white/60 border-gray-200 text-gray-600 hover:border-pink-300'}`}>
                  <span className="flex items-center justify-center">{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="mt-4 relative z-10"><ErrorMessage message={error} /></div>}
        <button onClick={handleGenerate} disabled={loading || !product || selectedPlatforms.length === 0} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 mt-8 text-lg relative z-10">
          {loading ? <><LoadingSpinner size="sm" /> Writing captions...</> : <><Share2 className="w-5 h-5" /> Generate Captions</>}
        </button>
      </div>

      {Object.keys(captions).length > 0 && (
        <div className="space-y-6 animate-slide-up pb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-800 text-xl tracking-tight">Your Captions</h2>
            <button onClick={handleGenerate} className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 text-sm">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
          {selectedPlatforms.map(id => {
            const platform = PLATFORMS.find(p => p.id === id);
            if (!captions[id]) return null;
            return (
              <div key={id} className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-sm rounded-3xl p-6 relative overflow-hidden transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h3 className="font-extrabold text-gray-800 flex items-center gap-2 text-lg">
                    <span className="flex items-center justify-center drop-shadow-sm">{platform.icon}</span> {platform.label}
                    <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">{captions[id].length} chars</span>
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => copy(captions[id], id)} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 border border-gray-200 rounded-xl hover:border-pink-300 hover:text-pink-600 transition-colors bg-white">
                      {copied === id ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                    {id === 'whatsapp' && (
                      <button onClick={() => openWhatsApp(captions[id])} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#25D366' }}>
                        Share
                      </button>
                    )}
                    {id === 'facebook' && (
                      <button onClick={() => openFacebook(captions[id])} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-90 transition-opacity bg-blue-600">
                        Share
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-pink-50/20 border border-gray-100/50 rounded-2xl p-5 shadow-inner">
                  <div className="text-gray-800 font-medium leading-relaxed">
                    <AIResponse content={captions[id]} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

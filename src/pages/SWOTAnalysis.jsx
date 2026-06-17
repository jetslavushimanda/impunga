import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Download, Save, RefreshCw, Zap, AlertTriangle, TrendingUp, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import AIResponse from '../components/shared/AIResponse';
import ErrorMessage from '../components/shared/ErrorMessage';
import { Toast, useToast } from '../components/shared/SuccessToast';
import { BUSINESS_SECTORS } from '../data/businessSectors';
import { callAI } from '../lib/gemini';
import { stripMarkdown } from '../lib/stripMarkdown';
import jsPDF from 'jspdf';

const QUADRANTS = [
  { key: 'strengths', label: 'Strengths', icon: Zap, border: 'border-green-200', bg: 'bg-green-50/80 backdrop-blur-sm', header: 'bg-gradient-to-r from-green-500 to-emerald-600', text: 'text-green-800', iconColor: 'text-green-600' },
  { key: 'weaknesses', label: 'Weaknesses', icon: AlertTriangle, border: 'border-red-200', bg: 'bg-red-50/80 backdrop-blur-sm', header: 'bg-gradient-to-r from-red-500 to-rose-600', text: 'text-red-800', iconColor: 'text-red-600' },
  { key: 'opportunities', label: 'Opportunities', icon: TrendingUp, border: 'border-blue-200', bg: 'bg-blue-50/80 backdrop-blur-sm', header: 'bg-gradient-to-r from-blue-500 to-indigo-600', text: 'text-blue-800', iconColor: 'text-blue-600' },
  { key: 'threats', label: 'Threats', icon: Shield, border: 'border-amber-200', bg: 'bg-amber-50/80 backdrop-blur-sm', header: 'bg-gradient-to-r from-amber-500 to-yellow-600', text: 'text-amber-800', iconColor: 'text-amber-600' },
];

export default function SWOTAnalysis() {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('idea');
  const [swot, setSwot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pipelineBanner, setPipelineBanner] = useState('');
  const { addDocument } = useFirestore();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('impunga_idea_pipeline');
    if (raw) {
      try {
        const pipeline = JSON.parse(raw);
        const wd = pipeline.savedWizardData || {};
        
        let desc = '';
        if (wd.problem && wd.solution) {
          desc = `Problem: ${wd.problem}\nSolution: ${wd.solution}`;
        } else if (pipeline.ideaText) {
          desc = pipeline.ideaText;
        }

        if (desc) {
          setDescription(desc);
        }

        const typeMap = {
          agriculture: 'Agriculture',
          retail: 'Retail',
          food: 'Food and Beverage',
          services: 'Services',
          tech: 'Technology',
          manufacturing: 'Manufacturing',
          transport: 'Transport',
          other: 'Other'
        };

        const type = wd.businessType || pipeline.businessType;
        if (type && typeMap[type]) {
          setSector(typeMap[type]);
        }

        setPipelineBanner('Pre-filled from your saved Startup Blueprint — review and edit as needed.');
      } catch (err) {
        console.error('Error pre-filling SWOT from pipeline:', err);
      }
    }
  }, []);

  async function handleGenerate() {
    if (description.length < 20) return;
    setLoading(true);
    setError('');
    try {
      const prompt = `Generate a detailed SWOT analysis for this Zambian business:

Business Name: ${businessName || 'Not specified'}
Description: ${description}
Sector: ${sector || 'General'}
Stage: ${stage}
Location: ${userProfile?.province || 'Zambia'}

Provide a SWOT analysis specific to the Zambian market. Return ONLY valid JSON:
{
  "strengths": ["point 1", "point 2", "point 3", "point 4"],
  "weaknesses": ["point 1", "point 2", "point 3", "point 4"],
  "opportunities": ["point 1", "point 2", "point 3", "point 4"],
  "threats": ["point 1", "point 2", "point 3", "point 4"],
  "summary": "One paragraph summary and key recommendation"
}

Make each point specific to Zambia — reference PACRA, ZRA, load shedding, mobile money, local competition etc.`;

      const response = await callAI(prompt, 'You are a Zambian business strategy expert. Generate SWOT analyses specific to the Zambian market. Return ONLY valid JSON, no other text.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setSwot(JSON.parse(cleaned));
    } catch (err) {
      setError(err.message?.includes('RATE_LIMIT') ? 'Too many requests. Wait 60 seconds and try again.' : 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await addDocument('swotAnalyses', { businessName, description, sector, swot });
      show('SWOT Analysis saved!');
    } catch { show('Save failed.', 'error'); }
  }

  function downloadPDF() {
    if (!swot) return;
    const doc = new jsPDF();
    const primary = [27, 79, 114];
    doc.setFillColor(...primary);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    doc.text('SWOT ANALYSIS', 105, 12, { align: 'center' });
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text(businessName || 'Business SWOT Analysis', 105, 20, { align: 'center' });

    const colors = { strengths: [34, 139, 34], weaknesses: [220, 53, 69], opportunities: [23, 162, 184], threats: [202, 138, 4] };
    const labels = { strengths: 'STRENGTHS', weaknesses: 'WEAKNESSES', opportunities: 'OPPORTUNITIES', threats: 'THREATS' };
    const positions = [{ x: 10, y: 32 }, { x: 108, y: 32 }, { x: 10, y: 120 }, { x: 108, y: 120 }];
    const keys = ['strengths', 'weaknesses', 'opportunities', 'threats'];

    keys.forEach((key, i) => {
      const { x, y } = positions[i];
      doc.setFillColor(...colors[key]);
      doc.rect(x, y, 92, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text(labels[key], x + 4, y + 5.5);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      let lineY = y + 13;
      swot[key].forEach(point => {
        const cleanPoint = stripMarkdown(point);
        const lines = doc.splitTextToSize(`• ${cleanPoint}`, 85);
        doc.text(lines, x + 2, lineY);
        lineY += lines.length * 5 + 2;
      });
    });

    if (swot.summary) {
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text('Summary & Recommendation:', 10, 210);
      doc.setFont(undefined, 'normal'); doc.setFontSize(9);
      const cleanSummary = stripMarkdown(swot.summary);
      const lines = doc.splitTextToSize(cleanSummary, 190);
      doc.text(lines, 10, 218);
    }

    doc.setTextColor(150); doc.setFontSize(8);
    doc.text('Generated by IMPUNGA — Start. Match. Build Zambia.', 105, 285, { align: 'center' });
    doc.save(`SWOT_${(businessName || 'Analysis').replace(/\s+/g, '_')}.pdf`);
    show('PDF downloaded!');
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">SWOT Analysis Generator</h1>
        <p className="text-gray-500 font-medium">AI generates a full SWOT for your business — specific to Zambia</p>
      </div>

      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
        
        {pipelineBanner && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl mb-6 flex items-center justify-between text-sm animate-fade-in relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
              <span>{pipelineBanner}</span>
            </div>
            <button onClick={() => setPipelineBanner('')} className="text-blue-500 hover:text-blue-700 font-bold ml-2">Close</button>
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name (optional)</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm" placeholder="e.g. Mama's Kitchen" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Describe your business *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm resize-none" rows={3} placeholder="What does your business do? Who are your customers? Where do you operate?" />
            <p className={`text-xs mt-2 font-medium ${description.length < 20 ? 'text-red-400' : 'text-green-500'}`}>{description.length} chars {description.length < 20 ? '(min 20)' : '✓ Looks good!'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sector</label>
              <select value={sector} onChange={e => setSector(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none shadow-sm cursor-pointer">
                <option value="">Select sector</option>
                {BUSINESS_SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none shadow-sm cursor-pointer">
                <option value="idea">Just an idea</option>
                <option value="starting">Starting up</option>
                <option value="operating">Already operating</option>
                <option value="growing">Growing / expanding</option>
              </select>
            </div>
          </div>
        </div>
        {error && <div className="mt-4 relative z-10"><ErrorMessage message={error} /></div>}
        <button 
          onClick={handleGenerate} 
          disabled={loading || description.length < 20} 
          className="relative z-10 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 mt-8 text-lg"
        >
          {loading ? <><LoadingSpinner size="sm" /> Generating SWOT...</> : <><Target className="w-5 h-5" /> Generate SWOT Analysis</>}
        </button>
      </div>

      {swot && (
        <div className="animate-slide-up pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {QUADRANTS.map(({ key, label, icon: Icon, border, bg, header, iconColor }) => (
              <div key={key} className={`rounded-2xl border border-white/60 shadow-sm overflow-hidden ${bg}`}>
                <div className={`${header} text-white px-5 py-3.5 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 shadow-sm`}>
                  <Icon className="w-5 h-5" /> {label}
                </div>
                <ul className="p-5 space-y-3">
                  {swot[key]?.map((point, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-3 leading-relaxed font-medium">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${iconColor} bg-white shadow-sm text-xs font-bold`}>{i + 1}</div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {swot.summary && (
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 mb-8 shadow-sm">
              <p className="font-extrabold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-blue-600" /> Summary & Recommendation
              </p>
              <div className="text-gray-800 font-medium leading-relaxed">
                <AIResponse content={swot.summary} />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerate} className="flex items-center gap-2 border border-gray-200 hover:bg-white text-gray-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors bg-white/50 backdrop-blur-sm shadow-sm active:scale-95"><RefreshCw className="w-4 h-4" /> Regenerate</button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"><Save className="w-4 h-4" /> Save</button>
            <button onClick={downloadPDF} className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 ml-auto"><Download className="w-4 h-4" /> Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

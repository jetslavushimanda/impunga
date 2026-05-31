import { useState } from 'react';
import { Target, Download, Save, RefreshCw, Zap, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { Toast, useToast } from '../components/shared/SuccessToast';
import { BUSINESS_SECTORS } from '../data/businessSectors';
import { callGemini } from '../lib/gemini';
import jsPDF from 'jspdf';

const QUADRANTS = [
  { key: 'strengths', label: 'Strengths', icon: Zap, border: 'border-green-400', bg: 'bg-green-50', header: 'bg-green-500', text: 'text-green-800', iconColor: 'text-green-600' },
  { key: 'weaknesses', label: 'Weaknesses', icon: AlertTriangle, border: 'border-red-400', bg: 'bg-red-50', header: 'bg-red-500', text: 'text-red-800', iconColor: 'text-red-600' },
  { key: 'opportunities', label: 'Opportunities', icon: TrendingUp, border: 'border-blue-400', bg: 'bg-blue-50', header: 'bg-blue-500', text: 'text-blue-800', iconColor: 'text-blue-600' },
  { key: 'threats', label: 'Threats', icon: Shield, border: 'border-yellow-400', bg: 'bg-yellow-50', header: 'bg-yellow-500', text: 'text-yellow-800', iconColor: 'text-yellow-600' },
];

export default function SWOTAnalysis() {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('idea');
  const [swot, setSwot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addDocument } = useFirestore();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();

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

      const response = await callGemini(prompt, 'You are a Zambian business strategy expert. Generate SWOT analyses specific to the Zambian market. Return ONLY valid JSON, no other text.');
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
        const lines = doc.splitTextToSize(`• ${point}`, 85);
        doc.text(lines, x + 2, lineY);
        lineY += lines.length * 5 + 2;
      });
    });

    if (swot.summary) {
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text('Summary & Recommendation:', 10, 210);
      doc.setFont(undefined, 'normal'); doc.setFontSize(9);
      const lines = doc.splitTextToSize(swot.summary, 190);
      doc.text(lines, 10, 218);
    }

    doc.setTextColor(150); doc.setFontSize(8);
    doc.text('Generated by IMPUNGA — Plant Your Idea. Grow Your Business. Feed Zambia.', 105, 285, { align: 'center' });
    doc.save(`SWOT_${(businessName || 'Analysis').replace(/\s+/g, '_')}.pdf`);
    show('PDF downloaded!');
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SWOT Analysis Generator</h1>
          <p className="text-gray-500 text-sm">AI generates a full SWOT for your business — specific to Zambia</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="space-y-4">
          <div>
            <label className="label">Business Name (optional)</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input-field" placeholder="e.g. Mama's Kitchen" />
          </div>
          <div>
            <label className="label">Describe your business *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea-field" rows={3} placeholder="What does your business do? Who are your customers? Where do you operate?" />
            <p className={`text-xs mt-1 ${description.length < 20 ? 'text-red-400' : 'text-gray-400'}`}>{description.length} chars {description.length < 20 ? '(min 20)' : '✓'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Sector</label>
              <select value={sector} onChange={e => setSector(e.target.value)} className="select-field">
                <option value="">Select sector</option>
                {BUSINESS_SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Business Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="select-field">
                <option value="idea">Just an idea</option>
                <option value="starting">Starting up</option>
                <option value="operating">Already operating</option>
                <option value="growing">Growing / expanding</option>
              </select>
            </div>
          </div>
        </div>
        {error && <div className="mt-3"><ErrorMessage message={error} /></div>}
        <button onClick={handleGenerate} disabled={loading || description.length < 20} className="btn-primary w-full mt-4 gap-2">
          {loading ? <><LoadingSpinner size="sm" /> Generating SWOT...</> : <><Target className="w-4 h-4" /> Generate SWOT Analysis</>}
        </button>
      </div>

      {swot && (
        <div className="animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {QUADRANTS.map(({ key, label, icon: Icon, border, bg, header, iconColor }) => (
              <div key={key} className={`rounded-xl border-2 overflow-hidden ${border} ${bg}`}>
                <div className={`${header} text-white px-4 py-2.5 font-bold text-sm flex items-center gap-2`}>
                  <Icon className="w-4 h-4" /> {label}
                </div>
                <ul className="p-4 space-y-2">
                  {swot[key]?.map((point, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2 leading-relaxed">
                      <span className={`font-bold shrink-0 ${iconColor}`}>{i + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {swot.summary && (
            <div className="card border-l-4 border-primary mb-4">
              <p className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Summary & Recommendation
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">{swot.summary}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerate} className="btn-secondary gap-2"><RefreshCw className="w-4 h-4" /> Regenerate</button>
            <button onClick={handleSave} className="btn-primary gap-2"><Save className="w-4 h-4" /> Save</button>
            <button onClick={downloadPDF} className="btn-green gap-2"><Download className="w-4 h-4" /> Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

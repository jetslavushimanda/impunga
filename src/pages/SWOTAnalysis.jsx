import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Target, Download, Save, RefreshCw, Zap, AlertTriangle, TrendingUp, Shield, ArrowLeft } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import AIResponse from '../components/shared/AIResponse';
import ErrorMessage from '../components/shared/ErrorMessage';
import { Toast, useToast } from '../components/shared/SuccessToast';
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
  const [pipelineData, setPipelineData] = useState(null);
  const [swot, setSwot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addDocument } = useFirestore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('impunga_idea_pipeline');
    if (raw) {
      try {
        const pipeline = JSON.parse(raw);
        setPipelineData(pipeline);
        if (!swot && !loading) {
          handleGenerate(pipeline);
        }
      } catch (err) {
        console.error('Error pre-filling SWOT from pipeline:', err);
      }
    }
  }, []);

  async function handleGenerate(data = pipelineData) {
    if (!data) return;
    setLoading(true);
    setError('');
    try {
      const wd = data.savedWizardData || {};
      const type = wd.businessType || data.businessType || 'General';
      
      let desc = '';
      if (wd.problem && wd.solution) {
        desc = `Problem: ${wd.problem}\nSolution: ${wd.solution}`;
      } else if (data.ideaText) {
        desc = data.ideaText;
      }

      const prompt = `Generate a detailed SWOT analysis for this Zambian business idea:

Description: ${desc}
Sector: ${type}

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
      const wd = pipelineData?.savedWizardData || {};
      const businessName = wd.businessType || 'Business';
      const sector = wd.businessType || 'General';
      const description = pipelineData?.ideaText || '';
      
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
    
    const wd = pipelineData?.savedWizardData || {};
    const businessName = wd.businessType ? `For ${wd.businessType}` : 'Business SWOT Analysis';
    
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text(businessName, 105, 20, { align: 'center' });

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
    doc.save(`SWOT_Analysis.pdf`);
    show('PDF downloaded!');
  }

  if (!pipelineData) {
    return (
      <div className="max-w-4xl mx-auto pb-24 animate-fade-in text-center pt-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Validated Idea Found</h2>
        <p className="text-gray-500 mb-8">Please validate your business idea first to generate a SWOT Analysis.</p>
        <Link to="/idea-validator" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Go to Idea Validator</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in text-left">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      

      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-600">
            <LoadingSpinner size="lg" />
            <p className="mt-4 font-medium animate-pulse">Analyzing market dynamics...</p>
          </div>
        ) : error ? (
          <div className="relative z-10"><ErrorMessage message={error} /></div>
        ) : swot ? (
          <div className="animate-slide-up pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 relative z-10">
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
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 mb-8 shadow-sm relative z-10">
                <p className="font-extrabold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-blue-600" /> Summary & Recommendation
                </p>
                <div className="text-gray-800 font-medium leading-relaxed">
                  <AIResponse content={swot.summary} />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 relative z-10">
              <button onClick={() => handleGenerate(pipelineData)} className="flex items-center gap-2 border border-gray-200 hover:bg-white text-gray-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors bg-white/50 backdrop-blur-sm shadow-sm active:scale-95">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={downloadPDF} className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 ml-auto">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FileText, ChevronLeft, ChevronRight, Save, Download, Plus, Trash2, Sparkles, X, Bot, Loader2 } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useGemini } from '../hooks/useGemini';
import { useAuth } from '../hooks/useAuth';
import { getProvinces, getDistricts } from '../data/provinces';
import { BUSINESS_SECTORS } from '../data/businessSectors';
import { formatKwacha } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useAuthStore from '../store/authStore';

const SECTIONS = ['Business Basics', 'Business Description', 'Market Analysis', 'Products & Services', 'Marketing Plan', 'Operations', 'Financial Plan', 'Review & Generate'];

const MARKETING_CHANNELS = ['Word of mouth', 'Facebook', 'WhatsApp', 'TikTok', 'Physical signage', 'Radio', 'Flyers', 'Market stall', 'Door to door'];

function SectionHeader({ title, step, total }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-400 tracking-wider uppercase">Step {step} of {total}</span>
        <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">{title}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

export default function BusinessPlanBuilder() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    businessName: '', tagline: '', province: '', district: '', businessType: 'sole_trader',
    startDate: '', sector: '',
    whatBusiness: '', problemSolved: '', differentFrom: '', vision: '',
    idealCustomer: '', customerAge: '', customerLocation: '', marketSize: '', competitors: '', betterThan: '',
    products: [{ name: '', description: '', costToProduce: '', sellingPrice: '', monthlyUnits: '' }],
    marketingChannels: [], socialStrategy: '', marketingBudget: '',
    operationLocation: '', equipment: [{ item: '', cost: '' }], hasEmployees: 'no', employees: '', operations: '', suppliers: [{ name: '', supply: '' }],
    startupCosts: [{ item: '', amount: '' }], monthlyCosts: [{ item: '', amount: '' }], fundingRequired: '',
  });
  const [selectedProvince, setSelectedProvince] = useState('');
  const [savedId, setSavedId] = useState(null);
  const [pipelineBanner, setPipelineBanner] = useState('');
  const { addDocument, updateDocument } = useFirestore();
  const { critiqueBusinessPlan, loading } = useGemini();
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();
  const [critiqueResult, setCritiqueResult] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('impunga_idea_pipeline');
    if (raw) {
      try {
        const pipeline = JSON.parse(raw);
        // Only use if data is less than 30 minutes old
        if (pipeline.timestamp && Date.now() - pipeline.timestamp < 30 * 60 * 1000) {
          const ideaSnippet = pipeline.ideaText ? pipeline.ideaText.substring(0, 300) : '';
          setData(prev => ({
            ...prev,
            whatBusiness: ideaSnippet,
            problemSolved: pipeline.aiAnalysis
              ? 'Auto-populated from AI analysis — edit as needed'
              : '',
          }));
          setPipelineBanner(`Pre-filled from your Idea Validator (Viability Score: ${pipeline.viabilityScore}/10) — please review and edit all fields.`);
        }
        localStorage.removeItem('impunga_idea_pipeline');
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field, value) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  function addItem(field) {
    const templates = {
      products: { name: '', description: '', costToProduce: '', sellingPrice: '', monthlyUnits: '' },
      equipment: { item: '', cost: '' },
      suppliers: { name: '', supply: '' },
      startupCosts: { item: '', amount: '' },
      monthlyCosts: { item: '', amount: '' },
    };
    setData(prev => ({ ...prev, [field]: [...prev[field], templates[field]] }));
  }

  function removeItem(field, i) {
    setData(prev => ({ ...prev, [field]: prev[field].filter((_, idx) => idx !== i) }));
  }

  function updateItem(field, i, key, value) {
    setData(prev => {
      const arr = [...prev[field]];
      arr[i] = { ...arr[i], [key]: value };
      return { ...prev, [field]: arr };
    });
  }

  function toggleChannel(channel) {
    setData(prev => ({
      ...prev,
      marketingChannels: prev.marketingChannels.includes(channel)
        ? prev.marketingChannels.filter(c => c !== channel)
        : [...prev.marketingChannels, channel],
    }));
  }

  const totalStartup = data.startupCosts.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const totalMonthly = data.monthlyCosts.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const monthlyRevenue = data.products.reduce((s, p) => s + ((parseFloat(p.sellingPrice) || 0) * (parseFloat(p.monthlyUnits) || 0)), 0);
  const monthlyCostOfGoods = data.products.reduce((s, p) => s + ((parseFloat(p.costToProduce) || 0) * (parseFloat(p.monthlyUnits) || 0)), 0);
  const grossProfit = monthlyRevenue - monthlyCostOfGoods;
  const netProfit = grossProfit - totalMonthly;

  async function handleAICritique() {
    try {
      const result = await critiqueBusinessPlan({ ...data, totalStartup, totalMonthly, monthlyRevenue, netProfit });
      setCritiqueResult(result);
    } catch (err) {
      show(err.message || 'AI Review failed', 'error');
    }
  }

  async function saveDraft() {
    try {
      if (savedId) {
        await updateDocument('businessPlans', savedId, { ...data, totalStartup, totalMonthly, monthlyRevenue, netProfit });
      } else {
        const id = await addDocument('businessPlans', { ...data, businessName: data.businessName || 'Draft', totalStartup, totalMonthly, monthlyRevenue, netProfit });
        setSavedId(id);
      }
      show('Draft saved!');
    } catch { show('Save failed.', 'error'); }
  }

  function generatePDF() {
    const doc = new jsPDF();
    const primary = [27, 79, 114];
    doc.setFontSize(22); doc.setTextColor(...primary);
    doc.text('BUSINESS PLAN', 105, 20, { align: 'center' });
    doc.setFontSize(16); doc.setTextColor(0, 0, 0);
    doc.text(data.businessName || 'My Business', 105, 32, { align: 'center' });
    doc.setFontSize(11);
    if (data.tagline) { doc.setTextColor(100); doc.text(data.tagline, 105, 40, { align: 'center' }); }
    doc.setTextColor(0, 0, 0);
    let y = 55;
    const section = (title) => {
      doc.setFontSize(13); doc.setTextColor(...primary);
      doc.text(title, 14, y); y += 7;
      doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    };
    const line = (text) => {
      if (!text) return;
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 14, y); y += lines.length * 5 + 3;
    };
    section('BUSINESS DESCRIPTION');
    line(data.whatBusiness); line(data.problemSolved); line(data.differentFrom);
    section('MARKET ANALYSIS');
    line(`Target Customer: ${data.idealCustomer}`); line(`Competitors: ${data.competitors}`); line(`Competitive Advantage: ${data.betterThan}`);
    section('MARKETING PLAN');
    line(`Channels: ${data.marketingChannels.join(', ')}`); line(`Monthly Budget: K${data.marketingBudget}`);
    section('FINANCIAL SUMMARY');
    autoTable(doc, {
      startY: y,
      head: [['Item', 'Amount (K)']],
      body: [
        ['Monthly Revenue', formatKwacha(monthlyRevenue)],
        ['Cost of Goods', formatKwacha(monthlyCostOfGoods)],
        ['Gross Profit', formatKwacha(grossProfit)],
        ['Operating Costs', formatKwacha(totalMonthly)],
        ['Net Profit', formatKwacha(netProfit)],
        ['Total Startup Cost', formatKwacha(totalStartup)],
      ],
      headStyles: { fillColor: primary },
    });
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9); doc.setTextColor(150);
      doc.text(`Generated by IMPUNGA · Start. Match. Build Zambia. · Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
    }
    doc.save(`IMPUNGA_BusinessPlan_${(data.businessName || 'Plan').replace(/\s+/g, '_')}.pdf`);
    show('Business plan PDF downloaded!');
  }

  const districts = getDistricts(selectedProvince || data.province || '');

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {pipelineBanner && (
        <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium">{pipelineBanner}</p>
          </div>
          <button onClick={() => setPipelineBanner('')} className="shrink-0 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Business Plan Builder</h1>
          <p className="text-gray-500 font-medium">Build a professional business plan — step by step</p>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
        <SectionHeader title={SECTIONS[step - 1]} step={step} total={8} />

        {step === 1 && (
          <div className="space-y-4">
            <div><label className="label">Business Name *</label><input value={data.businessName} onChange={e => update('businessName', e.target.value)} className="input-field" placeholder="Your business name" /></div>
            <div><label className="label">Tagline (optional)</label><input value={data.tagline} onChange={e => update('tagline', e.target.value)} className="input-field" placeholder="One sentence that describes your business" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Province</label>
                <select value={data.province} onChange={e => { update('province', e.target.value); setSelectedProvince(e.target.value); }} className="select-field">
                  <option value="">Select</option>{getProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="label">District</label>
                <select value={data.district} onChange={e => update('district', e.target.value)} className="select-field">
                  <option value="">Select</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Business Sector</label>
              <select value={data.sector} onChange={e => update('sector', e.target.value)} className="select-field">
                <option value="">Select sector</option>{BUSINESS_SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div><label className="label">Business Type</label>
              <select value={data.businessType} onChange={e => update('businessType', e.target.value)} className="select-field">
                <option value="sole_trader">Sole Trader</option><option value="partnership">Partnership</option>
                <option value="private_limited">Private Limited (Ltd)</option><option value="cbo">CBO</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {[
              { label: 'What does your business do?', key: 'whatBusiness', placeholder: 'Describe your products or services in detail...' },
              { label: 'What problem does it solve for customers?', key: 'problemSolved', placeholder: 'What pain point or need does your business address?' },
              { label: 'What makes you different from competitors?', key: 'differentFrom', placeholder: 'Your unique advantage over other similar businesses' },
              { label: 'Your 3-year vision for this business', key: 'vision', placeholder: 'Where do you see this business in 3 years?' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}><label className="label">{label}</label>
                <textarea value={data[key]} onChange={e => update(key, e.target.value)} className="textarea-field" rows={3} placeholder={placeholder} />
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {[
              { label: 'Who is your ideal customer?', key: 'idealCustomer' },
              { label: 'Where are your customers located?', key: 'customerLocation' },
              { label: 'List your main competitors', key: 'competitors' },
              { label: 'How are you better than competitors?', key: 'betterThan' },
            ].map(({ label, key }) => (
              <div key={key}><label className="label">{label}</label>
                <textarea value={data[key]} onChange={e => update(key, e.target.value)} className="textarea-field" rows={2} />
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="label mb-0">Products / Services</label>
              <button onClick={() => addItem('products')} className="text-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {data.products.map((p, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 mb-3 space-y-2">
                <div className="flex justify-between"><span className="text-sm font-medium text-gray-700">Item {i + 1}</span>
                  {data.products.length > 1 && <button onClick={() => removeItem('products', i)}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                </div>
                <input value={p.name} onChange={e => updateItem('products', i, 'name', e.target.value)} className="input-field" placeholder="Product/service name" />
                <textarea value={p.description} onChange={e => updateItem('products', i, 'description', e.target.value)} className="textarea-field" rows={2} placeholder="Description" />
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="label text-xs">Cost to Produce (K)</label><input type="number" value={p.costToProduce} onChange={e => updateItem('products', i, 'costToProduce', e.target.value)} className="input-field" /></div>
                  <div><label className="label text-xs">Selling Price (K)</label><input type="number" value={p.sellingPrice} onChange={e => updateItem('products', i, 'sellingPrice', e.target.value)} className="input-field" /></div>
                  <div><label className="label text-xs">Monthly Units</label><input type="number" value={p.monthlyUnits} onChange={e => updateItem('products', i, 'monthlyUnits', e.target.value)} className="input-field" /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="label">How will customers find you?</label>
              <div className="flex flex-wrap gap-2">
                {MARKETING_CHANNELS.map(ch => (
                  <button key={ch} onClick={() => toggleChannel(ch)} className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${data.marketingChannels.includes(ch) ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'}`}>{ch}</button>
                ))}
              </div>
            </div>
            <div><label className="label">Social Media Strategy</label>
              <textarea value={data.socialStrategy} onChange={e => update('socialStrategy', e.target.value)} className="textarea-field" rows={3} placeholder="Which platforms, what content, how often to post" />
            </div>
            <div><label className="label">Monthly Marketing Budget (K)</label>
              <input type="number" value={data.marketingBudget} onChange={e => update('marketingBudget', e.target.value)} className="input-field w-40" />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div><label className="label">Where will you operate?</label><input value={data.operationLocation} onChange={e => update('operationLocation', e.target.value)} className="input-field" /></div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label mb-0">Equipment Needed</label>
                <button onClick={() => addItem('equipment')} className="text-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
              </div>
              {data.equipment.map((eq, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={eq.item} onChange={e => updateItem('equipment', i, 'item', e.target.value)} className="input-field flex-1" placeholder="Equipment name" />
                  <input type="number" value={eq.cost} onChange={e => updateItem('equipment', i, 'cost', e.target.value)} className="input-field w-28" placeholder="K cost" />
                  {data.equipment.length > 1 && <button onClick={() => removeItem('equipment', i)}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                </div>
              ))}
            </div>
            <div>
              <label className="label">Do you need employees?</label>
              <select value={data.hasEmployees} onChange={e => update('hasEmployees', e.target.value)} className="select-field w-32">
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </div>
            {data.hasEmployees === 'yes' && <div><label className="label">Describe employees needed</label><textarea value={data.employees} onChange={e => update('employees', e.target.value)} className="textarea-field" rows={2} /></div>}
            <div><label className="label">Daily Operations</label><textarea value={data.operations} onChange={e => update('operations', e.target.value)} className="textarea-field" rows={3} /></div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label mb-0">Startup Costs</label>
                <button onClick={() => addItem('startupCosts')} className="text-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
              </div>
              {data.startupCosts.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={c.item} onChange={e => updateItem('startupCosts', i, 'item', e.target.value)} className="input-field flex-1" placeholder="e.g. Equipment, Stock, Registration" />
                  <input type="number" value={c.amount} onChange={e => updateItem('startupCosts', i, 'amount', e.target.value)} className="input-field w-28" placeholder="K amount" />
                  {data.startupCosts.length > 1 && <button onClick={() => removeItem('startupCosts', i)}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                </div>
              ))}
              <p className="text-sm font-medium text-primary">Total Startup: {formatKwacha(totalStartup)}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label mb-0">Monthly Running Costs</label>
                <button onClick={() => addItem('monthlyCosts')} className="text-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
              </div>
              {data.monthlyCosts.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={c.item} onChange={e => updateItem('monthlyCosts', i, 'item', e.target.value)} className="input-field flex-1" placeholder="e.g. Rent, Stock, Transport" />
                  <input type="number" value={c.amount} onChange={e => updateItem('monthlyCosts', i, 'amount', e.target.value)} className="input-field w-28" placeholder="K amount" />
                  {data.monthlyCosts.length > 1 && <button onClick={() => removeItem('monthlyCosts', i)}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                </div>
              ))}
              <p className="text-sm font-medium text-primary">Monthly Costs: {formatKwacha(totalMonthly)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div className="text-sm"><p className="text-gray-500">Monthly Revenue</p><p className="font-bold text-primary">{formatKwacha(monthlyRevenue)}</p></div>
              <div className="text-sm"><p className="text-gray-500">Net Profit/Month</p><p className={`font-bold ${netProfit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatKwacha(netProfit)}</p></div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Business Name', value: data.businessName },
                { label: 'Sector', value: data.sector },
                { label: 'Location', value: `${data.district}, ${data.province}` },
                { label: 'Products', value: `${data.products.length} item(s)` },
                { label: 'Monthly Revenue', value: formatKwacha(monthlyRevenue) },
                { label: 'Net Profit/Month', value: formatKwacha(netProfit) },
                { label: 'Startup Cost', value: formatKwacha(totalStartup) },
                { label: 'Marketing Channels', value: `${data.marketingChannels.length} selected` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-light rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-medium text-gray-800 text-sm">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* AI Co-Pilot Critique Section */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100/50 rounded-2xl p-6 mt-8 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-extrabold text-blue-900 flex items-center gap-2 text-lg">
                  <Bot className="w-6 h-6 text-blue-600" /> AI Co-Pilot Review
                </h3>
                {!critiqueResult && (
                  <button onClick={handleAICritique} disabled={loading} className="bg-white hover:bg-blue-50 text-blue-700 font-bold py-2 px-4 rounded-xl shadow-sm border border-blue-100 transition-colors flex items-center gap-2 text-sm active:scale-95">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Review My Plan
                  </button>
                )}
              </div>
              
              {critiqueResult && (
                <div className="space-y-5 animate-fade-in relative z-10">
                  <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50 shadow-sm">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-extrabold text-white text-xl shadow-md">
                      {critiqueResult.overallScore}
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed flex-1">{critiqueResult.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-xl border border-green-100/50">
                      <h4 className="text-xs font-extrabold text-green-800 mb-2 uppercase tracking-wider">Strengths</h4>
                      <ul className="text-sm text-green-900 space-y-1.5 list-disc pl-4 marker:text-green-400 font-medium">
                        {critiqueResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-100/50">
                      <h4 className="text-xs font-extrabold text-red-800 mb-2 uppercase tracking-wider">Weaknesses</h4>
                      <ul className="text-sm text-red-900 space-y-1.5 list-disc pl-4 marker:text-red-400 font-medium">
                        {critiqueResult.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100/50">
                    <h4 className="text-xs font-extrabold text-amber-800 mb-2 uppercase tracking-wider">Market Realities</h4>
                    <ul className="text-sm text-amber-900 space-y-1.5 list-disc pl-4 marker:text-amber-400 font-medium">
                      {critiqueResult.marketRealities?.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>

                  <div className="bg-blue-100/40 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50">
                    <h4 className="text-xs font-extrabold text-blue-800 mb-2 uppercase tracking-wider">Actionable Advice</h4>
                    <ul className="text-sm text-blue-900 space-y-1.5 list-disc pl-4 marker:text-blue-500 font-medium">
                      {critiqueResult.actionableAdvice?.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <button onClick={generatePDF} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 mt-8 text-sm relative z-10">
              <Download className="w-5 h-5" /> Generate & Download Business Plan PDF
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 relative z-10">
          <button onClick={saveDraft} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <div className="flex gap-3">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95"><ChevronLeft className="w-4 h-4" /> Back</button>}
            {step < 8 && <button onClick={() => setStep(step + 1)} className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">Next <ChevronRight className="w-4 h-4" /></button>}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

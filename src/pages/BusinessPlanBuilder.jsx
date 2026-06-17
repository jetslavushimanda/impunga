import { useState, useEffect } from 'react';
import { FileText, ChevronLeft, ChevronRight, Save, Download, Plus, Trash2, Sparkles, X } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Section {step} of {total}</span>
        <span className="text-sm font-medium text-primary">{title}</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${(step / total) * 100}%` }} />
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
  const { userProfile } = useAuthStore();
  const { toast, show, hide } = useToast();

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

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Plan Builder</h1>
          <p className="text-gray-500 text-sm">Build a professional business plan — step by step</p>
        </div>
      </div>

      <div className="card">
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
            <button onClick={generatePDF} className="btn-green w-full gap-2">
              <Download className="w-4 h-4" /> Generate & Download Business Plan PDF
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={saveDraft} className="btn-secondary gap-2 text-sm">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <div className="flex gap-3">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="btn-secondary gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>}
            {step < 8 && <button onClick={() => setStep(step + 1)} className="btn-primary gap-1">Next <ChevronRight className="w-4 h-4" /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}

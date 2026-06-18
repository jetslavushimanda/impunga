import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, FileText, Calendar, Building, DollarSign, ChevronRight, X } from 'lucide-react';
import { Toast, useToast } from '../components/shared/SuccessToast';

const MOCK_TENDERS = [
  {
    id: 'TND-001',
    title: 'Supply of Office Stationery',
    company: 'Lusaka City Council',
    category: 'Procurement',
    deadline: '2026-07-15',
    budget: 'K50,000 - K100,000',
    status: 'Open',
    description: 'We are seeking registered suppliers for the annual provision of office stationery including paper, pens, and files for municipal offices.'
  },
  {
    id: 'TND-002',
    title: 'Website Redesign and CRM Integration',
    company: 'Zambia National Commercial Bank',
    category: 'Technology',
    deadline: '2026-06-30',
    budget: 'Undisclosed',
    status: 'Closing Soon',
    description: 'Looking for a verified tech agency to revamp our corporate website and integrate it with our newly implemented Salesforce CRM system.'
  },
  {
    id: 'TND-003',
    title: 'Warehouse Construction Phase 2',
    company: 'Copperbelt Logistics Inc.',
    category: 'Construction',
    deadline: '2026-08-01',
    budget: 'K1,500,000+',
    status: 'Open',
    description: 'Contractor needed for the phase 2 expansion of our Ndola logistics hub. Must be NCC registered.'
  }
];

export default function B2BTenders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();
  const { toast, show, hide } = useToast();

  const [tenders, setTenders] = useState(() => {
    const saved = localStorage.getItem('impunga_tenders');
    return saved ? JSON.parse(saved) : MOCK_TENDERS;
  });

  // Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showBidForm, setShowBidForm] = useState(false);

  // Form States - Post Tender
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('Procurement');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // Form States - Submit Bid
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');

  const categories = ['All', 'Procurement', 'Technology', 'Construction', 'Consulting', 'Logistics'];

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tender.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || tender.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePostTender = (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !budget.trim() || !deadline.trim() || !description.trim()) return;

    const newTender = {
      id: `TND-${Math.floor(100 + Math.random() * 900)}`,
      title,
      company,
      category,
      deadline,
      budget,
      status: 'Open',
      description
    };

    const updated = [newTender, ...tenders];
    setTenders(updated);
    localStorage.setItem('impunga_tenders', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setCompany('');
    setCategory('Procurement');
    setBudget('');
    setDeadline('');
    setDescription('');

    setShowPostModal(false);
    show('Tender successfully posted!');
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();
    if (!bidAmount.trim() || !bidProposal.trim()) return;

    show(`Bid application for "${selectedTender.title}" submitted to ${selectedTender.company} successfully!`);

    // Reset Form & Close
    setBidAmount('');
    setBidProposal('');
    setShowBidForm(false);
    setSelectedTender(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Engine 4: Community
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">B2B Tenders & Contracts</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">Access verified corporate procurement notices, requests for proposals, and government tenders.</p>
        </div>
        
        <button 
          onClick={() => setShowPostModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          Post a Tender
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenders by title, company, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="relative md:w-64">
            <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTenders.length > 0 ? (
            filteredTenders.map(tender => (
              <div key={tender.id} className="group bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wider">
                      {tender.id}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      tender.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tender.status}
                    </span>
                    <span className="text-indigo-600 text-xs font-semibold">{tender.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                    {tender.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3 font-medium">
                    <Building className="w-4 h-4" /> {tender.company}
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-2 max-w-3xl">
                    {tender.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-48 lg:border-l lg:border-gray-100 lg:pl-6 shrink-0">
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Deadline
                    </div>
                    <div className="font-bold text-gray-900">{tender.deadline}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Est. Budget
                    </div>
                    <div className="font-bold text-gray-900">{tender.budget}</div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <button 
                    onClick={() => {
                      setSelectedTender(tender);
                      setShowBidForm(false);
                    }}
                    className="w-full sm:w-auto bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-bold px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    View Details <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No tenders found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPostModal(false)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" /> Post a New Tender
              </h3>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePostTender} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Tender Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply of Solar Panels for Rural Clinics"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Min. of Health"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Category *</label>
                  <select
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Estimated Budget *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K150,000 - K200,000"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Description & Requirements *</label>
                <textarea
                  required
                  placeholder="Describe the scope of work, technical specifications, and compliance criteria..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Post Tender
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details / Bid Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTender(null)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" /> Tender Details
              </h3>
              <button 
                onClick={() => setSelectedTender(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold tracking-wider uppercase">
                    {selectedTender.id}
                  </span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-[10px] font-bold tracking-wider uppercase">
                    {selectedTender.status}
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-gray-900 leading-snug">{selectedTender.title}</h4>
                <p className="text-sm text-gray-600 font-semibold mt-1 flex items-center gap-1">
                  <Building className="w-4 h-4 text-gray-400" /> {selectedTender.company}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white border border-gray-100 rounded-2xl p-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Est. Budget</span>
                  <span className="font-extrabold text-gray-900 text-sm">{selectedTender.budget}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Deadline</span>
                  <span className="font-extrabold text-gray-900 text-sm">{selectedTender.deadline}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Scope & Description</span>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedTender.description}</p>
              </div>

              {showBidForm ? (
                <form onSubmit={handleSubmitBid} className="border-t border-gray-200/80 pt-5 space-y-4">
                  <h5 className="text-sm font-bold text-indigo-950">Submit Proposal & Bid</h5>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Your Bid Amount (ZMW) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. K85,000"
                      className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Proposal Details *</label>
                    <textarea
                      required
                      placeholder="Outline your capability, experience, and why they should choose your bid..."
                      className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                      value={bidProposal}
                      onChange={e => setBidProposal(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBidForm(false)}
                      className="flex-1 bg-white border border-gray-250 text-gray-700 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer"
                    >
                      Submit Bid
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBidForm(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
                >
                  Apply & Submit Bid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

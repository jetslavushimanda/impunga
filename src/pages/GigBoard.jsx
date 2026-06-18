import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle2, X } from 'lucide-react';
import { ZAMBIAN_JOBS } from '../data/jobs';
import { Toast, useToast } from '../components/shared/SuccessToast';

export default function GigBoard() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();
  const { toast, show, hide } = useToast();

  const [gigs, setGigs] = useState(() => {
    const saved = localStorage.getItem('impunga_gigs');
    return saved ? JSON.parse(saved) : ZAMBIAN_JOBS;
  });

  // Modal Form States
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Trade');
  const [description, setDescription] = useState('');

  // Apply Modal States
  const [selectedGigForApply, setSelectedGigForApply] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [applyRate, setApplyRate] = useState('');
  const [applyDuration, setApplyDuration] = useState('');

  const categories = ['All', 'Development', 'Design', 'Finance', 'Marketing', 'Trade', 'Agriculture'];

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gig.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || gig.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePostGig = (e) => {
    e.preventDefault();
    if (!title.trim() || !client.trim() || !budget.trim() || !description.trim()) return;

    const newGig = {
      id: `JOB-${Date.now()}`,
      title,
      client,
      budget,
      duration: duration || 'Flexible',
      location: location || 'Lusaka',
      category: category || 'Trade',
      sector: category === 'Development' ? 'Information Technology' : 
              category === 'Finance' ? 'Finance and Banking' :
              category === 'Marketing' ? 'Media and Communications' :
              category === 'Trade' ? 'Construction and Infrastructure' :
              category === 'Agriculture' ? 'Agriculture and Farming' : 'Services',
      description
    };

    const updatedGigs = [newGig, ...gigs];
    setGigs(updatedGigs);
    localStorage.setItem('impunga_gigs', JSON.stringify(updatedGigs));
    
    // Clear form
    setTitle('');
    setClient('');
    setBudget('');
    setDuration('');
    setLocation('');
    setCategory('Trade');
    setDescription('');
    
    setShowPostModal(false);
    show('Piece-work successfully posted!');
  };

  const handleApplyGig = (e) => {
    e.preventDefault();
    if (!applyNote.trim()) return;

    show(`Application for "${selectedGigForApply.title}" sent to ${selectedGigForApply.client} successfully!`);

    setApplyNote('');
    setApplyRate('');
    setApplyDuration('');
    setSelectedGigForApply(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Engine 4: Community
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Piece-Work & Gigs Board</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">Find short-term tasks, casual labor projects, and piece-work contracts matched to your skills.</p>
        </div>
        
        <button 
          onClick={() => setShowPostModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap cursor-pointer font-sans"
        >
          Post a Piece-Work
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search piece-works by keyword or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          
          <div className="relative md:w-64">
            <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer text-sm bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.length > 0 ? (
            filteredGigs.map(gig => (
              <div key={gig.id} className="group flex flex-col border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all hover:shadow-lg bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-indigo-100">
                  {gig.category}
                </div>
                
                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 leading-snug">{gig.title}</h3>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-4">
                   Client: <span className="text-gray-900">{gig.client}</span> {gig.client !== 'Custom User Listing' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>
                
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">{gig.description}</p>
                
                <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <DollarSign className="w-4 h-4 text-emerald-600 animate-pulse" /> <span className="font-bold text-emerald-700">{gig.budget}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <Clock className="w-4 h-4 text-blue-600 animate-pulse" /> <span>{gig.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <MapPin className="w-4 h-4 text-rose-600 animate-pulse" /> <span>{gig.location}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedGigForApply(gig);
                    setApplyRate(gig.budget);
                    setApplyDuration(gig.duration);
                  }}
                  className="w-full bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-800 hover:text-indigo-700 font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No piece-works found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>

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
                <Briefcase className="w-6 h-6 text-indigo-600" /> Post a New Piece-Work
              </h3>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePostGig} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Piece-Work Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Painting and Tiling of Shopfront"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mosi Traders"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={client}
                    onChange={e => setClient(e.target.value)}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Budget (ZMW) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K1,200 Fixed or K500/day"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Days or Ongoing"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lusaka, Remote, Ndola"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Task Description *</label>
                <textarea
                  required
                  placeholder="Describe the tasks, required skills, and deliverables..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Post Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {selectedGigForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedGigForApply(null)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-indigo-600" /> Apply for Piece-Work
              </h3>
              <button 
                onClick={() => setSelectedGigForApply(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleApplyGig} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2">
                <h4 className="font-bold text-indigo-900 text-sm mb-1">{selectedGigForApply.title}</h4>
                <p className="text-xs text-indigo-700 font-medium">Client: {selectedGigForApply.client} | Location: {selectedGigForApply.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Proposed Rate (ZMW) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K1,200 or K500/day"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={applyRate}
                    onChange={e => setApplyRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Proposed Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 Days or 1 Week"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={applyDuration}
                    onChange={e => setApplyDuration(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Proposal Note / Pitch *</label>
                <textarea
                  required
                  placeholder="Introduce yourself and explain why you're a great fit for this task..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-28"
                  value={applyNote}
                  onChange={e => setApplyNote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

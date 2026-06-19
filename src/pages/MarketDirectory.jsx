import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, MapPin, Briefcase, Filter, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { Toast, useToast } from '../components/shared/SuccessToast';

// Mock data for the directory until Firebase profiles are populated
const MOCK_BUSINESSES = [
  {
    id: '1',
    name: 'Copperbelt Fresh Produce',
    sector: 'Agriculture',
    location: 'Ndola, Copperbelt',
    description: 'Wholesale supplier of fresh tomatoes, onions, and greens directly from rural farms.',
    verified: true,
    contact: 'supplier@example.com'
  },
  {
    id: '2',
    name: 'Lusaka Packaging Solutions',
    sector: 'Manufacturing',
    location: 'Lusaka CBD',
    description: 'Eco-friendly packaging boxes and branding for small businesses and restaurants.',
    verified: true,
    contact: 'sales@lskpackaging.com'
  },
  {
    id: '3',
    name: 'Quick Wheels Logistics',
    sector: 'Logistics',
    location: 'Kitwe',
    description: 'Last-mile delivery service for e-commerce and retail stores.',
    verified: false,
    contact: 'info@qwlogistics.co.zm'
  },
  {
    id: '4',
    name: 'Zambezi Tech Hub',
    sector: 'Technology',
    location: 'Livingstone',
    description: 'Custom software and web development for Zambian SMEs.',
    verified: true,
    contact: 'dev@zambezitech.com'
  }
];

export default function MarketDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('All');
  const navigate = useNavigate();
  const { toast, show, hide } = useToast();

  const [businesses, setBusinesses] = useState(() => {
    const saved = localStorage.getItem('impunga_businesses');
    return saved ? JSON.parse(saved) : MOCK_BUSINESSES;
  });

  // Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Form States - List Business
  const [name, setName] = useState('');
  const [sector, setSector] = useState('Agriculture');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');

  // Form States - Contact
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMessage, setSenderMessage] = useState('');

  const sectors = ['All', 'Agriculture', 'Manufacturing', 'Logistics', 'Technology', 'Retail'];

  const filteredBusinesses = businesses.filter(biz => {
    const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          biz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'All' || biz.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const handleListBusiness = (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !contact.trim() || !description.trim()) return;

    const newBiz = {
      id: String(Date.now()),
      name,
      sector,
      location,
      description,
      verified: false,
      contact
    };

    const updated = [newBiz, ...businesses];
    setBusinesses(updated);
    localStorage.setItem('impunga_businesses', JSON.stringify(updated));

    // Reset Form
    setName('');
    setSector('Agriculture');
    setLocation('');
    setContact('');
    setDescription('');

    setShowPostModal(false);
    show('Business listing created successfully!');
  };

  const handleContactBusiness = (e) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !senderMessage.trim()) return;

    show(`Inquiry successfully sent to ${selectedBusiness.name}!`);

    // Reset Form
    setSenderName('');
    setSenderEmail('');
    setSenderMessage('');
    setSelectedBusiness(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in text-left">
      <div className="flex justify-end gap-2 mb-6 mt-2 shrink-0">
          <button 
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            List Your Business
          </button>
        </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for suppliers, services, or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="relative md:w-64">
            <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map(biz => (
              <div key={biz.id} className="group border border-gray-100 hover:border-indigo-200 rounded-2xl p-6 transition-all hover:shadow-md bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{biz.name}</h3>
                      {biz.verified && <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {biz.sector}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
                    {biz.name.charAt(0)}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{biz.description}</p>
                
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" /> {biz.location}
                  </div>
                  <button 
                    onClick={() => setSelectedBusiness(biz)}
                    className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                  >
                    Contact <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No businesses found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {/* List Business Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPostModal(false)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-indigo-600" /> List Your Business
              </h3>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleListBusiness} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copperbelt Logistics ZM"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Sector *</label>
                  <select
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                  >
                    {sectors.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Location (City/Area) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lusaka CBD"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Contact Info (Email/Phone) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. contact@business.com"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Description & Products/Services *</label>
                <textarea
                  required
                  placeholder="Describe your business offerings, wholesale prices, capacity, and partnerships you're looking for..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Submit Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Business Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedBusiness(null)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-indigo-600" /> Contact Business Partner
              </h3>
              <button 
                onClick={() => setSelectedBusiness(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleContactBusiness} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2">
                <h4 className="font-bold text-indigo-900 text-sm mb-1">{selectedBusiness.name}</h4>
                <p className="text-xs text-indigo-700 font-medium">Sector: {selectedBusiness.sector} | Location: {selectedBusiness.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Banda"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Your Email/Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. email/phone"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Message / Business Inquiry *</label>
                <textarea
                  required
                  placeholder="Ask about pricing, procurement details, delivery timelines, or partnership proposals..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-28"
                  value={senderMessage}
                  onChange={e => setSenderMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

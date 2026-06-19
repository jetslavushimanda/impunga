import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, MapPin, Calendar, PackageOpen, Monitor, X, Package } from 'lucide-react';
import { Toast, useToast } from '../components/shared/SuccessToast';

const MOCK_ASSETS = [
  {
    id: 'A-001',
    title: 'Heavy Duty Concrete Mixer',
    owner: 'BuildIt Zambezi',
    category: 'Machinery',
    price: 'K800 / day',
    location: 'Lusaka South',
    availability: 'Available Now',
    description: '200L Diesel Concrete Mixer. Excellent condition, well-serviced. Delivery available within Lusaka for an extra fee.'
  },
  {
    id: 'A-002',
    title: 'Hot Desk in Premium Co-working Space',
    owner: 'Innovation Hub',
    category: 'Workspace',
    price: 'K150 / day',
    location: 'Kabulonga, Lusaka',
    availability: 'Available (3 Desks)',
    description: 'High-speed internet, backup power (genset + solar), free coffee, and access to meeting rooms. Perfect for freelancers.'
  },
  {
    id: 'A-003',
    title: 'Commercial Printing Press',
    owner: 'PrintMasters Ltd',
    category: 'Equipment',
    price: 'K2,000 / week',
    location: 'Ndola Industrial',
    availability: 'Available from 1st July',
    description: 'Industrial grade offset printer. Idle capacity available for short-term lease. Operator can be provided if needed.'
  }
];

export default function AssetSharing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();
  const { toast, show, hide } = useToast();

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('impunga_assets');
    return saved ? JSON.parse(saved) : MOCK_ASSETS;
  });

  // Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form States - List Asset
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [category, setCategory] = useState('Machinery');
  const [priceValue, setPriceValue] = useState('');
  const [priceUnit, setPriceUnit] = useState('day');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('Available Now');
  const [description, setDescription] = useState('');

  // Form States - Request
  const [requestDuration, setRequestDuration] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  const categories = ['All', 'Machinery', 'Workspace', 'Equipment', 'Vehicles'];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleListAsset = (e) => {
    e.preventDefault();
    if (!title.trim() || !owner.trim() || !priceValue.trim() || !location.trim() || !description.trim()) return;

    const newAsset = {
      id: `A-${Math.floor(100 + Math.random() * 900)}`,
      title,
      owner,
      category,
      price: `K${priceValue} / ${priceUnit}`,
      location,
      availability: availability || 'Available Now',
      description
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    localStorage.setItem('impunga_assets', JSON.stringify(updated));

    // Reset form
    setTitle('');
    setOwner('');
    setCategory('Machinery');
    setPriceValue('');
    setPriceUnit('day');
    setLocation('');
    setAvailability('Available Now');
    setDescription('');

    setShowPostModal(false);
    show('Asset listed successfully!');
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!requestDuration.trim() || !requestDate.trim() || !requestMessage.trim()) return;

    show(`Rental request for "${selectedAsset.title}" sent to ${selectedAsset.owner} successfully!`);

    // Reset Request
    setRequestDuration('');
    setRequestDate('');
    setRequestMessage('');
    setSelectedAsset(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in text-left">
      <div className="flex justify-end gap-2 mb-6 mt-2 shrink-0">
          <button 
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            List an Asset
          </button>
        </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets, equipment, or spaces..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <div key={asset.id} className="group flex flex-col md:flex-row border border-gray-200 hover:border-indigo-300 rounded-2xl overflow-hidden transition-all hover:shadow-lg bg-white">
                
                {/* Mock Image Area */}
                <div className="md:w-48 bg-gray-100 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  {asset.category === 'Workspace' ? (
                    <Monitor className="w-12 h-12 text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                  ) : (
                    <PackageOpen className="w-12 h-12 text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                  )}
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{asset.category}</span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{asset.title}</h3>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-indigo-600">{asset.price.split('/')[0]}</div>
                      <div className="text-xs text-gray-500 font-semibold uppercase">/ {asset.price.split('/')[1]}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-500 mb-4">By {asset.owner}</div>
                  
                  <p className="text-gray-600 text-sm mb-6 flex-grow">{asset.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {asset.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <Calendar className="w-3.5 h-3.5" /> {asset.availability}
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedAsset(asset)}
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer"
                    >
                      Request
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No assets found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {/* List Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPostModal(false)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <PackageOpen className="w-6 h-6 text-indigo-600" /> List an Asset or Space
              </h3>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleListAsset} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Asset/Space Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Tonne Flatbed Truck"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Owner / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lusaka Hire Services"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Rental Price (ZMW) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={priceValue}
                    onChange={e => setPriceValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Per Unit *</label>
                  <select
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                    value={priceUnit}
                    onChange={e => setPriceUnit(e.target.value)}
                  >
                    <option value="day">per Day</option>
                    <option value="week">per Week</option>
                    <option value="month">per Month</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lusaka West"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Availability Status</label>
                  <input
                    type="text"
                    placeholder="e.g. Available Now"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Description & Terms *</label>
                <textarea
                  required
                  placeholder="Describe details, technical specs, safety deposit rules, and pickup details..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                List Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedAsset(null)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" /> Request Asset Rental
              </h3>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendRequest} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2">
                <h4 className="font-bold text-indigo-900 text-sm mb-1">{selectedAsset.title}</h4>
                <p className="text-xs text-indigo-700 font-medium">Owner: {selectedAsset.owner} | Rate: {selectedAsset.price}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Duration of Rental *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Days or 2 Weeks"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={requestDuration}
                    onChange={e => setRequestDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Start Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={requestDate}
                    onChange={e => setRequestDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Message to Owner *</label>
                <textarea
                  required
                  placeholder="Tell the owner how you plan to use it, request pickup logistics, or propose terms..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-28"
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Send Rental Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

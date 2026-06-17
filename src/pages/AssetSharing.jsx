import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, MapPin, DollarSign, Calendar, PackageOpen, Monitor } from 'lucide-react';

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

  const categories = ['All', 'Machinery', 'Workspace', 'Equipment', 'Vehicles'];

  const filteredAssets = MOCK_ASSETS.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Engine 4: Marketplace
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Asset & Space Sharing</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">Rent out idle equipment or find affordable shared resources for your business.</p>
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
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
                    <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm">
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
    </div>
  );
}

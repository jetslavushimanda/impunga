import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, MapPin, Briefcase, Filter, ArrowRight } from 'lucide-react';

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

  const sectors = ['All', 'Agriculture', 'Manufacturing', 'Logistics', 'Technology', 'Retail'];

  const filteredBusinesses = MOCK_BUSINESSES.filter(biz => {
    const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          biz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'All' || biz.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Engine 4: Community
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Verified Directory</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">Find trusted B2B partners, suppliers, and clients across Zambia. Only verified registered businesses earn the blue tick.</p>
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
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
                  <button className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
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
    </div>
  );
}

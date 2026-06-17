import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, FileText, Calendar, Building, DollarSign, ChevronRight, Clock } from 'lucide-react';

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

  const categories = ['All', 'Procurement', 'Technology', 'Construction', 'Consulting', 'Logistics'];

  const filteredTenders = MOCK_TENDERS.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tender.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || tender.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Engine 4: Marketplace
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">B2B Tenders & Contracts</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">Access verified corporate procurement notices, requests for proposals, and government tenders.</p>
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
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
                  <button className="w-full sm:w-auto bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-bold px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
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
    </div>
  );
}

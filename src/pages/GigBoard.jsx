import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { ZAMBIAN_JOBS } from '../data/jobs';

export default function GigBoard() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Development', 'Design', 'Finance', 'Marketing', 'Trade', 'Agriculture'];

  const filteredGigs = ZAMBIAN_JOBS.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gig.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || gig.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
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
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
          Post a Gig
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gigs by keyword or client..."
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
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{gig.title}</h3>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-4">
                   Client: <span className="text-gray-900">{gig.client}</span> <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                
                <p className="text-gray-600 text-sm mb-6 flex-grow">{gig.description}</p>
                
                <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> {gig.budget}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <Clock className="w-4 h-4 text-blue-600" /> {gig.duration}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <MapPin className="w-4 h-4 text-rose-600" /> {gig.location}
                  </div>
                </div>
                
                <button className="w-full bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-800 hover:text-indigo-700 font-bold px-4 py-3 rounded-xl transition-colors">
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No gigs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

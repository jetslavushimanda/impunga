import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, MapPin, Briefcase, Filter, Star, ExternalLink, Code, Layout, TrendingUp } from 'lucide-react';

const MOCK_PORTFOLIOS = [
  {
    id: '1',
    name: 'Chanda Mwale',
    title: 'Senior Frontend Developer',
    category: 'Technology',
    location: 'Lusaka',
    rate: 'K400/hr',
    rating: 4.9,
    skills: ['React', 'Tailwind CSS', 'Firebase'],
    description: 'Specializing in modern web applications and responsive design for Zambian startups.',
    avatarColor: 'bg-blue-100 text-blue-700',
    icon: Code
  },
  {
    id: '2',
    name: 'Sarah Banda',
    title: 'Brand Strategist & Designer',
    category: 'Design',
    location: 'Kitwe',
    rate: 'K300/hr',
    rating: 4.8,
    skills: ['Figma', 'Illustrator', 'Branding'],
    description: 'Helping businesses establish strong visual identities and marketing materials.',
    avatarColor: 'bg-purple-100 text-purple-700',
    icon: Layout
  },
  {
    id: '3',
    name: 'David Phiri',
    title: 'Digital Marketing Expert',
    category: 'Marketing',
    location: 'Ndola',
    rate: 'K250/hr',
    rating: 4.7,
    skills: ['SEO', 'Social Media', 'Analytics'],
    description: 'Driving growth and customer acquisition through targeted social media campaigns.',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    icon: TrendingUp
  }
];

export default function PortfolioShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Technology', 'Design', 'Marketing', 'Consulting', 'Writing'];

  const filteredPortfolios = MOCK_PORTFOLIOS.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          portfolio.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || portfolio.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Engine 4: Marketplace
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Portfolio Showcase</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">Discover and collaborate with top verified professionals across Zambia.</p>
        </div>
        
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
          Create Portfolio
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, skill, or keyword..."
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredPortfolios.length > 0 ? (
            filteredPortfolios.map(portfolio => {
              const Icon = portfolio.icon || User;
              return (
                <div key={portfolio.id} className="group flex flex-col border border-gray-100 hover:border-indigo-200 rounded-2xl p-6 transition-all hover:shadow-lg bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${portfolio.avatarColor}`}>
                      {portfolio.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-sm font-semibold">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {portfolio.rating}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900">{portfolio.name}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-3">{portfolio.title}</p>
                  
                  <p className="text-gray-600 text-sm mb-5 flex-grow">{portfolio.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {portfolio.skills.map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {portfolio.location}
                      </div>
                      <div className="text-sm font-bold text-gray-900">{portfolio.rate}</div>
                    </div>
                    <button className="bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2">
                      View Profile <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No portfolios found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

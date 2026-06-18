import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, MapPin, Briefcase, Filter, Star, ExternalLink, Code, Layout, TrendingUp, X } from 'lucide-react';
import { Toast, useToast } from '../components/shared/SuccessToast';
import PageHeaderCard from '../components/shared/PageHeaderCard';

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
  const { toast, show, hide } = useToast();

  const [portfolios, setPortfolios] = useState(() => {
    const saved = localStorage.getItem('impunga_portfolios');
    return saved ? JSON.parse(saved) : MOCK_PORTFOLIOS;
  });

  // Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);

  // Form States - Create Portfolio
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [rate, setRate] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');

  // Form States - Contact Professional
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const categories = ['All', 'Technology', 'Design', 'Marketing', 'Consulting', 'Writing'];

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          portfolio.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          portfolio.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || portfolio.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePortfolio = (e) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !rate.trim() || !location.trim() || !skills.trim() || !description.trim()) return;

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

    // Random avatar colors
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPortfolio = {
      id: String(Date.now()),
      name,
      title,
      category,
      location,
      rate: rate.startsWith('K') ? rate : `K${rate}/hr`,
      rating: 5.0,
      skills: skillsArray,
      description,
      avatarColor: randomColor,
      icon: User
    };

    const updated = [newPortfolio, ...portfolios];
    setPortfolios(updated);
    localStorage.setItem('impunga_portfolios', JSON.stringify(updated));

    // Reset Form
    setName('');
    setTitle('');
    setCategory('Technology');
    setRate('');
    setLocation('');
    setSkills('');
    setDescription('');

    setShowPostModal(false);
    show('Portfolio showcase created successfully!');
  };

  const handleContactProfessional = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    show(`Your message has been sent to ${selectedPortfolio.name}!`);

    // Reset Contact
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setShowContactForm(false);
    setSelectedPortfolio(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in text-left">
      <PageHeaderCard
        title="Portfolio Showcase"
        description="Discover and collaborate with top verified professionals across Zambia."
        icon={User}
        bg="bg-green-50"
        text="text-green-600"
        badge="Community"
        badgeColor="purple"
        rightElement={
          <button 
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Create Portfolio
          </button>
        }
      />

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
                    <button 
                      onClick={() => {
                        setSelectedPortfolio(portfolio);
                        setShowContactForm(false);
                      }}
                      className="bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 cursor-pointer"
                    >
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {/* Create Portfolio Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPostModal(false)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layout className="w-6 h-6 text-indigo-600" /> Create Showcase Portfolio
              </h3>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePortfolio} className="p-6 overflow-y-auto bg-gray-50/50 flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mwansa Mwape"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Professional Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrical Contractor"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Hourly Rate (ZMW) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K200/hr or Negotiable"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lusaka"
                    className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Skills (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wiring, Solar Installation, Troubleshooting"
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Short Bio & Experience *</label>
                <textarea
                  required
                  placeholder="Tell clients about your trade achievements, certifications, projects completed..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
              >
                Create Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail / Contact Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPortfolio(null)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-600" /> Professional Profile
              </h3>
              <button 
                onClick={() => setSelectedPortfolio(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50">
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 ${selectedPortfolio.avatarColor}`}>
                  {selectedPortfolio.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-gray-900 leading-tight">{selectedPortfolio.name}</h4>
                  <p className="text-indigo-600 font-semibold text-sm">{selectedPortfolio.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {selectedPortfolio.rating}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedPortfolio.location}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Rate</span>
                <span className="font-extrabold text-gray-900 text-base">{selectedPortfolio.rate}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">About Professional</span>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedPortfolio.description}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Skills & Specializations</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPortfolio.skills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-800 rounded-lg text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {showContactForm ? (
                <form onSubmit={handleContactProfessional} className="border-t border-gray-200/80 pt-5 space-y-4">
                  <h5 className="text-sm font-bold text-indigo-950">Send Inquiry</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Joseph Lungu"
                        className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Your Email/Phone *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. phone/email"
                        className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Message / Project Brief *</label>
                    <textarea
                      required
                      placeholder="Discuss timelines, project scope, or hire requirements..."
                      className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-24"
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 bg-white border border-gray-250 text-gray-700 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2 cursor-pointer font-sans"
                >
                  Contact Professional
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

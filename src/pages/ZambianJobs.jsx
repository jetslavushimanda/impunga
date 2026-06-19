import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Briefcase, Sparkles, MapPin, DollarSign, Clock, CheckCircle2, X, Search, Filter, ArrowLeft } from 'lucide-react';
import { Toast, useToast } from '../components/shared/SuccessToast';
import { ZAMBIAN_JOBS } from '../data/jobs';

export default function ZambianJobs() {
  const { user } = useAuthStore();
  const { getDocument } = useFirestore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!user);
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('general');

  // Jobs States
  const [gigs] = useState(() => {
    const saved = localStorage.getItem('impunga_gigs');
    return saved ? JSON.parse(saved) : ZAMBIAN_JOBS;
  });
  const [matchedGigs, setMatchedGigs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Apply Modal States
  const [selectedGigForApply, setSelectedGigForApply] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [applyRate, setApplyRate] = useState('');
  const [applyDuration, setApplyDuration] = useState('');

  // Toast Hook
  const { toast, show, hide } = useToast();

  const calculateJobMatches = (profileData, allJobs) => {
    const userSkills = profileData.selectedSkills || [];
    const topIndustry = profileData.topIndustry || '';
    const secondIndustry = profileData.secondIndustry || '';

    const scored = allJobs.map(job => {
      let score = 0;
      let matchedSkills = [];

      // 1. Sector matching
      if (job.sector && job.sector === topIndustry) {
        score += 40;
      } else if (job.sector && job.sector === secondIndustry) {
        score += 20;
      }

      // 2. Keyword/Skill matching in description or title
      userSkills.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(job.title) || regex.test(job.description)) {
          score += 20;
          matchedSkills.push(skill);
        }
      });

      // Cap score at 100, minimum 10 if in same sector
      score = Math.min(100, Math.max(10, score));

      return {
        ...job,
        score,
        matchedSkills
      };
    });

    // Sort descending by match score
    scored.sort((a, b) => b.score - a.score);
    return scored;
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadProfileAndCalculate() {
      setLoading(true);
      try {
        const data = await getDocument('skillProfiles', user.uid);
        if (data) {
          setProfile(data);
          const computed = calculateJobMatches(data, gigs);
          setMatchedGigs(computed);
          setActiveTab('expertise');
        } else {
          setProfile(null);
          setActiveTab('general');
        }
      } catch (err) {
        console.error('Failed to load skill profile:', err);
        setActiveTab('general');
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gigs]);

  const handleApplyGig = (e) => {
    e.preventDefault();
    if (!applyNote.trim()) return;

    show(`Application for "${selectedGigForApply.title}" submitted to ${selectedGigForApply.client} successfully!`);

    setApplyNote('');
    setApplyRate('');
    setApplyDuration('');
    setSelectedGigForApply(null);
  };

  function getBarColorClass(score) {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-blue-500';
    return 'bg-orange-500';
  }

  function getTextColorClass(score) {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-blue-600';
    return 'text-orange-600';
  }

  // General tab filtering logic
  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gig.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || gig.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading Zambian job postings and expertise matches..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 animate-fade-in text-left">
      

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 mb-8 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 max-w-md">
        <button
          onClick={() => setActiveTab('expertise')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'expertise'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Expertise Match
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Briefcase className="w-4 h-4" /> General Postings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'expertise' ? (
        // Expertise Match Tab Content
        !profile ? (
          <div className="max-w-md mx-auto py-16 px-6 text-center bg-white border border-gray-100 rounded-[2rem] shadow-lg shadow-gray-200/40">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-850 mb-2">You haven't built your skill profile yet.</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">Build your profile to unlock customized job matching. The system maps your skills and experience to actual active postings.</p>
            <button
              onClick={() => navigate('/skill-profile-builder')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
            >
              Build My Profile
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {/* Info Banner */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-4 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] text-indigo-650 text-indigo-600 uppercase font-extrabold tracking-wider mb-1">User Name</p>
                <p className="font-extrabold text-gray-800 text-lg">{profile.fullName}</p>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] text-indigo-650 text-indigo-600 uppercase font-extrabold tracking-wider mb-1">Province Location</p>
                <p className="font-extrabold text-gray-800 text-lg">{profile.province}</p>
              </div>
            </div>

            {/* Matched Gigs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedGigs.length > 0 ? (
                matchedGigs.map(gig => (
                  <div key={gig.id} className="group flex flex-col border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all hover:shadow-lg bg-white relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-indigo-100 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span className={getTextColorClass(gig.score)}>{gig.score}% Match</span>
                    </div>
                    
                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors">{gig.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-3">
                      Client: <span className="text-gray-800 font-bold">{gig.client}</span> 
                      {gig.client !== 'Custom User Listing' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ease-out ${getBarColorClass(gig.score)}`}
                          style={{ width: `${gig.score}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-gray-650 text-xs mb-4 flex-grow leading-relaxed line-clamp-3">{gig.description}</p>
                    
                    {gig.matchedSkills && gig.matchedSkills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Skills Matched</span>
                        <div className="flex flex-wrap gap-1">
                          {gig.matchedSkills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-150 rounded-md text-[10px] font-bold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" /> <span className="text-emerald-700">{gig.budget}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" /> <span>{gig.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" /> <span>{gig.location}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedGigForApply(gig);
                        setApplyRate(gig.budget);
                        setApplyDuration(gig.duration);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-750 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No matching postings found</h3>
                  <p className="text-gray-500 text-sm">We couldn't match active listings to your skills. Try adding more skills in your profile.</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        // General Postings Tab Content
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job postings by keyword, title, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-800"
              />
            </div>
            
            <div className="relative md:w-64">
              <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer text-sm bg-white font-bold text-gray-650"
              >
                {['All', 'Development', 'Design', 'Finance', 'Marketing', 'Trade', 'Agriculture'].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.length > 0 ? (
              filteredGigs.map(gig => (
                <div key={gig.id} className="group flex flex-col border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all hover:shadow-lg bg-white relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-750 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-indigo-100">
                    {gig.category}
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors">{gig.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-4">
                    Client: <span className="text-gray-800 font-bold">{gig.client}</span> 
                    {gig.client !== 'Custom User Listing' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-6 flex-grow leading-relaxed line-clamp-3">{gig.description}</p>
                  
                  <div className="space-y-2.5 mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold">
                      <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" /> <span className="text-emerald-700">{gig.budget}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" /> <span>{gig.duration}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-700 font-semibold">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" /> <span>{gig.location}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSelectedGigForApply(gig);
                      setApplyRate(gig.budget);
                      setApplyDuration(gig.duration);
                    }}
                    className="w-full bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-800 hover:text-indigo-700 font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer text-xs"
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No job postings found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search criteria or categories.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {/* Apply Modal */}
      {selectedGigForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedGigForApply(null)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20 z-10 text-left">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-indigo-600" /> Apply for Job / Piece-Work
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
                  placeholder="Introduce yourself, list your relevant skills, and explain why you're a great fit for this role..."
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

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Briefcase, ArrowRight, Map, Sparkles, Loader2, Bot, ArrowLeft } from 'lucide-react';

import { CAREERS } from '../data/careers';
import { ZAMBIAN_JOBS } from '../data/jobs';
import PageHeaderCard from '../components/shared/PageHeaderCard';

const RANKS = ['1st Match', '2nd Match', '3rd Match', '4th Match', '5th Match'];

export default function CareerMatches() {
  const { user } = useAuthStore();
  const { getDocument } = useFirestore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topMatches, setTopMatches] = useState([]);
  const [roadmaps, setRoadmaps] = useState({});
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const { generatePredictiveRoadmap } = useGemini();
  const navigate = useNavigate();

  async function handleGenerateRoadmap(career) {
    setActiveRoadmap(career.name);
    try {
      const roadmap = await generatePredictiveRoadmap(career, profile.selectedSkills || [], profile.province || 'Zambia');
      setRoadmaps(prev => ({ ...prev, [career.name]: roadmap }));
    } catch (err) {
      console.error(err);
    } finally {
      setActiveRoadmap(null);
    }
  }

  const calculateMatches = (profileData) => {
    const userSkills = profileData.selectedSkills || [];
    
    const scored = CAREERS.map(career => {
      const matched = career.requiredSkills.filter(skill => userSkills.includes(skill));
      const missing = career.requiredSkills.filter(skill => !userSkills.includes(skill));
      
      const totalRequired = career.requiredSkills.length;
      const baseScore = totalRequired > 0 ? (matched.length / totalRequired) * 100 : 0;
      
      let bonus = 0;
      if (career.sector === profileData.topIndustry) {
        bonus += 20;
      }
      if (career.sector === profileData.secondIndustry) {
        bonus += 10;
      }
      
      const score = Math.min(100, Math.round(baseScore + bonus));
      
      return {
        ...career,
        matched,
        missing,
        score
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    setTopMatches(scored.slice(0, 5));
  };

  useEffect(() => {
    if (!user) return;

    async function loadProfileAndCalculate() {
      setLoading(true);
      try {
        const data = await getDocument('skillProfiles', user.uid);
        if (data) {
          setProfile(data);
          calculateMatches(data);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Failed to load skill profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Analyzing skills and computing career matches..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">You have not built your skill profile yet.</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">Build your profile to unlock customized career matches and training gaps analysis.</p>
        <button
          onClick={() => navigate('/skill-profile-builder')}
          className="btn-primary w-full py-3 text-sm font-bold shadow-lg"
        >
          Build My Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4 animate-fade-in">
      <PageHeaderCard
        title="Your Career Matches"
        description="Based on your skill profile"
        icon={Briefcase}
        bg="bg-purple-50"
        text="text-purple-600"
        badge="Career Connect"
        badgeColor="purple"
        rightElement={
          <button
            onClick={() => navigate('/skill-profile-builder')}
            className="btn-secondary text-xs py-2.5 px-4 font-bold shadow-sm whitespace-nowrap"
          >
            Update My Profile
          </button>
        }
      />

      {/* Info Banner */}
      <div className="bg-primary text-white rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row justify-between gap-2">
        <div>
          <p className="text-xs text-blue-200">Entrepreneur Name</p>
          <p className="font-bold text-base">{profile.fullName}</p>
        </div>
        <div>
          <p className="text-xs text-blue-200">Province Location</p>
          <p className="font-bold text-base">{profile.province}</p>
        </div>
      </div>

      {/* Match Cards */}
      <div className="space-y-4">
        {topMatches.map((item, idx) => (
          <div key={item.name} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            
            {/* Header info */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {RANKS[idx] || `${idx + 1}th Match`}
                </span>
                <h2 className="text-lg font-bold text-gray-800 mt-1.5 leading-tight">{item.name}</h2>
                <span className="inline-block text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-0.5 rounded-full mt-1.5">
                  {item.sector}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xl font-extrabold ${getTextColorClass(item.score)}`}>
                  {item.score}%
                </span>
                <span className="text-gray-400 text-xs block font-medium">Match</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${getBarColorClass(item.score)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>

            {/* Description and earnings */}
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-medium">
              Average Earning: <span className="font-bold text-gray-900">{item.earnings}</span>
            </div>

            {/* Skills lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              
              {/* Matched skills */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matched Skills</p>
                {item.matched.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.matched.map(s => (
                      <span key={s} className="inline-block bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">None matched yet</p>
                )}
              </div>

              {/* Skills to develop */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills to Develop</p>
                {item.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.missing.map(s => (
                      <span key={s} className="inline-block bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2.5 py-1 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    ✓ All skills matched!
                  </p>
                )}
              </div>

            </div>

            {/* Matched active jobs on Gig Board */}
            {(() => {
              const matchedJobs = ZAMBIAN_JOBS.filter(job => job.sector === item.sector);
              if (matchedJobs.length === 0) return null;
              return (
                <div className="pt-4 border-t border-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matched Jobs on Gig Board ({matchedJobs.length})</h4>
                    <Link to="/gig-board" className="text-xs text-blue-600 hover:text-blue-800 font-bold">Open Board</Link>
                  </div>
                  <div className="space-y-2">
                    {matchedJobs.map(job => (
                      <div key={job.id} className="bg-gray-50/50 border border-gray-100 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-gray-800 block leading-tight">{job.title}</span>
                          <span className="text-[10px] text-gray-400 block mt-1">Client: {job.client} | Budget: {job.budget}</span>
                        </div>
                        <Link
                          to={`/gig-board?search=${encodeURIComponent(job.title)}`}
                          className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-blue-600 font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm shrink-0"
                        >
                          Apply Now
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Predictive Roadmap Section */}
            <div className="pt-4 border-t border-gray-50">
              {!roadmaps[item.name] ? (
                <button
                  onClick={() => handleGenerateRoadmap(item)}
                  disabled={activeRoadmap === item.name}
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {activeRoadmap === item.name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Map className="w-4 h-4" />
                  )}
                  Generate Predictive Roadmap
                </button>
              ) : (
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900 text-sm">AI Career Roadmap</h3>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">{roadmaps[item.name].summary}</p>
                  
                  {roadmaps[item.name].steps?.length > 0 && (
                    <div className="space-y-3 mt-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step-by-Step Path</h4>
                      {roadmaps[item.name].steps.map(step => (
                        <div key={step.step} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {step.step}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{step.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {roadmaps[item.name].trainingInstitutions?.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Local Training Options</h4>
                      <ul className="space-y-2">
                        {roadmaps[item.name].trainingInstitutions.map((inst, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-bold text-gray-800">{inst.name}</span>
                            <span className="text-gray-500"> — {inst.location}</span>
                            <p className="text-xs text-blue-600 mt-0.5">{inst.course}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-green-50 text-green-800 p-3 rounded-lg text-xs font-medium border border-green-100 flex gap-2 items-start mt-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-green-600" />
                    <p>{roadmaps[item.name].jobMarketOutlook}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Skill Gap Closer Promotion */}
      <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-base">Want to close your skill gaps?</h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            IMPUNGA's Finance & Funding engine can help you find grants and loans to develop the skills and business you need.
          </p>
        </div>
        <Link
          to="/engine/finance"
          className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-1.5"
        >
          Go to Finance & Funding <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>

    </div>
  );
}

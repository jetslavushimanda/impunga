import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Briefcase, ArrowRight } from 'lucide-react';

const CAREERS = [
  {
    name: 'Software Developer',
    sector: 'Information Technology',
    requiredSkills: ['Computer Programming', 'Web Development', 'Problem Solving', 'Data Analysis'],
    description: 'Builds websites, apps and software systems for businesses and organisations across Zambia.',
    earnings: 'K8,000 to K25,000 per month'
  },
  {
    name: 'ICT Support Technician',
    sector: 'Information Technology',
    requiredSkills: ['Networking and IT Support', 'Computer Programming', 'Problem Solving'],
    description: 'Installs, maintains and repairs computer systems and networks for schools, businesses and government offices.',
    earnings: 'K4,500 to K12,000 per month'
  },
  {
    name: 'Digital Marketing Specialist',
    sector: 'Media and Communications',
    requiredSkills: ['Social Media Management', 'Graphic Design', 'Communication', 'Sales and Marketing'],
    description: 'Manages online presence and digital advertising for Zambian businesses.',
    earnings: 'K5,000 to K15,000 per month'
  },
  {
    name: 'Accountant',
    sector: 'Finance and Banking',
    requiredSkills: ['Accounting and Bookkeeping', 'Financial Management', 'Data Analysis', 'Problem Solving'],
    description: 'Manages financial records, tax compliance and financial reporting for businesses and organisations.',
    earnings: 'K7,000 to K20,000 per month'
  },
  {
    name: 'Solar Installation Technician',
    sector: 'Construction and Infrastructure',
    requiredSkills: ['Solar Panel Installation', 'Electrical Installation', 'Problem Solving'],
    description: "Installs and maintains solar energy systems for households and businesses across Zambia's growing renewable energy sector.",
    earnings: 'K4,000 to K10,000 per month'
  },
  {
    name: 'Fashion Designer and Tailor',
    sector: 'Manufacturing',
    requiredSkills: ['Tailoring and Dressmaking', 'Graphic Design', 'Customer Service'],
    description: 'Creates and produces clothing and fashion products for the Zambian market including custom orders and wholesale supply.',
    earnings: 'K3,000 to K12,000 per month'
  },
  {
    name: 'Agricultural Extension Officer',
    sector: 'Agriculture and Farming',
    requiredSkills: ['Farming and Agriculture', 'Research', 'Communication', 'Teaching and Tutoring'],
    description: 'Guides farmers on modern agricultural techniques, crop management and market access across Zambian districts.',
    earnings: 'K5,500 to K14,000 per month'
  },
  {
    name: 'Construction Supervisor',
    sector: 'Construction and Infrastructure',
    requiredSkills: ['Bricklaying and Plastering', 'Project Management', 'Leadership', 'Problem Solving'],
    description: 'Oversees building construction projects ensuring quality, safety and timely completion.',
    earnings: 'K6,000 to K18,000 per month'
  },
  {
    name: 'Healthcare Worker — Clinical Officer',
    sector: 'Healthcare and Medicine',
    requiredSkills: ['Nursing and Healthcare', 'Communication', 'Problem Solving', 'Teamwork'],
    description: "Provides primary healthcare services at clinics and hospitals across Zambia's health system.",
    earnings: 'K6,500 to K16,000 per month'
  },
  {
    name: 'Secondary School Teacher',
    sector: 'Education and Training',
    requiredSkills: ['Teaching and Tutoring', 'Communication', 'Leadership', 'Public Speaking'],
    description: 'Delivers quality education to secondary school learners across all subjects and provinces.',
    earnings: 'K5,000 to K12,000 per month'
  },
  {
    name: 'Electrician',
    sector: 'Construction and Infrastructure',
    requiredSkills: ['Electrical Installation', 'Solar Panel Installation', 'Problem Solving'],
    description: 'Installs and maintains electrical systems in residential, commercial and industrial properties.',
    earnings: 'K4,500 to K14,000 per month'
  },
  {
    name: 'Transport and Logistics Coordinator',
    sector: 'Transport and Logistics',
    requiredSkills: ['Driving and Transport', 'Project Management', 'Communication', 'Financial Management'],
    description: 'Coordinates movement of goods and people for businesses, NGOs and government across Zambia.',
    earnings: 'K5,000 to K13,000 per month'
  },
  {
    name: 'Entrepreneur and Small Business Owner',
    sector: 'Self Employment and Entrepreneurship',
    requiredSkills: ['Sales and Marketing', 'Financial Management', 'Customer Service', 'Leadership', 'Problem Solving'],
    description: "Starts and runs their own business using IMPUNGA's full entrepreneurship toolkit.",
    earnings: 'K3,000 to K50,000 per month'
  },
  {
    name: 'Graphic Designer',
    sector: 'Media and Communications',
    requiredSkills: ['Graphic Design', 'Video Editing', 'Social Media Management', 'Communication'],
    description: 'Creates visual content for businesses, events and media organisations across Zambia.',
    earnings: 'K4,000 to K12,000 per month'
  },
  {
    name: 'Food and Catering Entrepreneur',
    sector: 'Tourism and Hospitality',
    requiredSkills: ['Catering and Cooking', 'Baking and Confectionery', 'Customer Service', 'Financial Management'],
    description: 'Operates catering businesses, restaurants, tuck shops and food supply services for events and institutions.',
    earnings: 'K3,000 to K15,000 per month'
  }
];

const RANKS = ['1st Match', '2nd Match', '3rd Match', '4th Match', '5th Match'];

export default function CareerMatches() {
  const { user } = useAuthStore();
  const { getDocument } = useFirestore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topMatches, setTopMatches] = useState([]);
  const navigate = useNavigate();

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
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Your Career Matches</h1>
          <p className="text-xs text-gray-400">Based on your skill profile</p>
        </div>
        <button
          onClick={() => navigate('/skill-profile-builder')}
          className="btn-secondary text-xs py-2.5 px-4 font-bold shadow-sm whitespace-nowrap"
        >
          Update My Profile
        </button>
      </div>

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

          </div>
        ))}
      </div>

      {/* Skill Gap Closer Promotion */}
      <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-base">Want to close your skill gaps?</h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            IMPUNGA's Funding Finder can help you find training programmes and bursaries to develop the skills you need.
          </p>
        </div>
        <Link
          to="/funding-finder"
          className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-1.5"
        >
          Go to Funding Finder <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>

    </div>
  );
}

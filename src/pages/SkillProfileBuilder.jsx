import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, X, Plus, ArrowLeft } from 'lucide-react';
import { getProvinces, getDistricts } from '../data/provinces';
import { useAI } from '../hooks/useAI';

const EDUCATION_LEVELS = [
  'Primary School Certificate',
  'Junior Secondary Certificate',
  'Senior Secondary Certificate',
  'TEVET Certificate',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree or Higher",
  'No Formal Certificate'
];

const WORK_TYPES = [
  'Employment — I want to work for someone',
  'Self Employment — I want to work for myself',
  'Both — I am open to either'
];

const INDUSTRIES = [
  'Agriculture and Farming',
  'Mining and Minerals',
  'Construction and Infrastructure',
  'Information Technology',
  'Healthcare and Medicine',
  'Education and Training',
  'Finance and Banking',
  'Retail and Trade',
  'Tourism and Hospitality',
  'Manufacturing',
  'Transport and Logistics',
  'Media and Communications',
  'Government and Public Service',
  'NGO and Development Work',
  'Self Employment and Entrepreneurship'
];

const CAT1_SKILLS = [
  'Computer Programming', 'Web Development', 'Mobile App Development', 'Data Analysis',
  'Graphic Design', 'Video Editing', 'Social Media Management', 'Accounting and Bookkeeping',
  'Electrical Installation', 'Plumbing', 'Welding', 'Carpentry and Joinery',
  'Motor Vehicle Mechanics', 'Air Conditioning and Refrigeration', 'Solar Panel Installation',
  'Networking and IT Support'
];

const CAT2_SKILLS = [
  'Tailoring and Dressmaking', 'Hairdressing and Beauty', 'Bricklaying and Plastering',
  'Painting and Decorating', 'Catering and Cooking', 'Baking and Confectionery',
  'Farming and Agriculture', 'Animal Husbandry', 'Fish Farming', 'Driving and Transport',
  'Security Services', 'Cleaning Services', 'Childcare', 'Teaching and Tutoring',
  'Nursing and Healthcare', 'Photography'
];

const CAT3_SKILLS = [
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Customer Service',
  'Sales and Marketing', 'Project Management', 'Public Speaking', 'Negotiation',
  'Financial Management', 'Research'
];

const CURRENT_STATUS_OPTIONS = [
  'Employed full time',
  'Employed part time',
  'Self employed',
  'Unemployed and looking for work',
  'In school or training',
  'Not currently looking'
];

const ALL_SKILLS = [
  'Computer Programming', 'Web Development', 'Mobile App Development', 'Data Analysis',
  'Graphic Design', 'Video Editing', 'Social Media Management', 'Accounting and Bookkeeping',
  'Electrical Installation', 'Plumbing', 'Welding', 'Carpentry and Joinery',
  'Motor Vehicle Mechanics', 'Air Conditioning and Refrigeration', 'Solar Panel Installation',
  'Networking and IT Support',
  'Tailoring and Dressmaking', 'Hairdressing and Beauty', 'Bricklaying and Plastering',
  'Painting and Decorating', 'Catering and Cooking', 'Baking and Confectionery',
  'Farming and Agriculture', 'Animal Husbandry', 'Fish Farming', 'Driving and Transport',
  'Security Services', 'Cleaning Services', 'Childcare', 'Teaching and Tutoring',
  'Nursing and Healthcare', 'Photography',
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Customer Service',
  'Sales and Marketing', 'Project Management', 'Public Speaking', 'Negotiation',
  'Financial Management', 'Research'
];

const QUIZ_QUESTIONS = [
  {
    id: 'customer',
    q: '1. Customer & Sales Experience',
    desc: 'Do you have experience communicating with customers, selling, or pitching?',
    options: [
      { label: 'Handling customer inquiries & complaints', skill: 'Customer Service' },
      { label: 'Selling goods or promoting services', skill: 'Sales and Marketing' },
      { label: 'Delivering public presentations or speeches', skill: 'Public Speaking' },
      { label: 'Negotiating prices or local agreements', skill: 'Negotiation' }
    ]
  },
  {
    id: 'digital',
    q: '2. Computer & Software Familiarity',
    desc: 'Select the IT, design, or tech skills you have used before:',
    options: [
      { label: 'Writing computer programs or software', skill: 'Computer Programming' },
      { label: 'Creating websites or online databases', skill: 'Web Development' },
      { label: 'Designing graphics, logos, or posters', skill: 'Graphic Design' },
      { label: 'Video editing or media creation', skill: 'Video Editing' },
      { label: 'Managing business pages on Facebook/WhatsApp', skill: 'Social Media Management' },
      { label: 'Troubleshooting network routers or computers', skill: 'Networking and IT Support' }
    ]
  },
  {
    id: 'trades',
    q: '3. Technical Trades & Handiwork',
    desc: 'Which hands-on trade skills do you have experience in?',
    options: [
      { label: 'Electrical wiring & installations', skill: 'Electrical Installation' },
      { label: 'Plumbing & fixing pipes', skill: 'Plumbing' },
      { label: 'Welding & structural metal works', skill: 'Welding' },
      { label: 'Carpentry, wood joinery, or furniture making', skill: 'Carpentry and Joinery' },
      { label: 'Solar panels, battery and inverter setups', skill: 'Solar Panel Installation' },
      { label: 'Motor vehicle repairs & mechanics', skill: 'Motor Vehicle Mechanics' },
      { label: 'AC and refrigeration maintenance', skill: 'Air Conditioning and Refrigeration' }
    ]
  },
  {
    id: 'vocational',
    q: '4. Local Vocational Services',
    desc: 'Select local services or vocational skills you possess:',
    options: [
      { label: 'Tailoring, dressmaking, or alterations', skill: 'Tailoring and Dressmaking' },
      { label: 'Hairdressing, braiding, or beauty treatments', skill: 'Hairdressing and Beauty' },
      { label: 'Bricklaying, plastering, or construction work', skill: 'Bricklaying and Plastering' },
      { label: 'Professional catering, cooking, or food prep', skill: 'Catering and Cooking' },
      { label: 'Baking bread or baking confectionery', skill: 'Baking and Confectionery' },
      { label: 'Farming, gardening, or crop harvesting', skill: 'Farming and Agriculture' },
      { label: 'Livestock management & poultry rearing', skill: 'Animal Husbandry' },
      { label: 'Fish farming or pond construction', skill: 'Fish Farming' },
      { label: 'Professional driving or transport delivery', skill: 'Driving and Transport' },
      { label: 'Tutoring or teaching academic subjects', skill: 'Teaching and Tutoring' },
      { label: 'First aid, nursing, or community healthcare', skill: 'Nursing and Healthcare' }
    ]
  },
  {
    id: 'business',
    q: '5. Business & Leadership Skills',
    desc: 'Select the operational or leadership skills you practice:',
    options: [
      { label: 'Leading groups, teams, or managing projects', skill: 'Leadership' },
      { label: 'Planning project milestones and schedules', skill: 'Project Management' },
      { label: 'Managing accounting records and books', skill: 'Accounting and Bookkeeping' },
      { label: 'Budgeting and managing cash flow balances', skill: 'Financial Management' },
      { label: 'Collaborating in teams and coordinating projects', skill: 'Teamwork' },
      { label: 'Evaluating and solving complex problems', skill: 'Problem Solving' }
    ]
  }
];

export default function SkillProfileBuilder() {
  const { user, userProfile } = useAuthStore();
  const { extractSkillsFromDescription, loading: aiLoading } = useAI();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [aiExtractionDone, setAiExtractionDone] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [skillsTab, setSkillsTab] = useState('quiz'); // 'quiz', 'catalog', 'ai'
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    province: '',
    district: '',
    educationLevel: '',
    preferredWorkType: '',
    selectedSkills: [],
    languages: '',
    topIndustry: '',
    secondIndustry: '',
    biggestChallenge: '',
    currentStatus: '',
  });

  useEffect(() => {
    if (userProfile?.fullName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userProfile.fullName,
      }));
    }
  }, [userProfile]);

  function handleFieldChange(field, val) {
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'province') {
        next.district = '';
      }
      return next;
    });
    setValidationError('');
  }

  function handleSkillToggle(skill) {
    setValidationError('');
    setFormData(prev => {
      const current = prev.selectedSkills;
      if (current.includes(skill)) {
        return { ...prev, selectedSkills: current.filter(s => s !== skill) };
      } else {
        return { ...prev, selectedSkills: [...current, skill] };
      }
    });
  }

  async function handleAIExtract() {
    if (experienceDescription.trim().length < 30) {
      setValidationError('Please describe your experience in at least 30 characters.');
      return;
    }
    setValidationError('');
    try {
      const result = await extractSkillsFromDescription(experienceDescription);
      if (result && result.extractedSkills) {
        setFormData(prev => ({ ...prev, selectedSkills: result.extractedSkills }));
        setAiSummary(result.summary || '');
        setAiSuggestions(result.suggestions || []);
        setAiExtractionDone(true);
      }
    } catch {
      setValidationError('AI extraction failed. Please try again or select skills manually.');
    }
  }

  function validateStep1() {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.age || parseInt(formData.age) <= 0) return 'Valid age is required';
    if (!formData.province) return 'Please select a province';
    if (!formData.district.trim()) return 'District is required';
    if (!formData.educationLevel) return 'Please select your education level';
    if (!formData.preferredWorkType) return 'Please select your preferred work type';
    return '';
  }

  function validateStep2() {
    if (formData.selectedSkills.length < 3) {
      return 'Please select at least 3 skills to proceed';
    }
    return '';
  }

  function validateStep3() {
    if (!formData.topIndustry) return 'Top industry interest is required';
    if (!formData.secondIndustry) return 'Second industry interest is required';
    if (!formData.currentStatus) return 'Please select your current employment status';
    return '';
  }

  function handleNext() {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setValidationError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setValidationError(err); return; }
      setStep(3);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      setValidationError('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (step !== 3) return;

    const err = validateStep3();
    if (err) { setValidationError(err); return; }

    if (!user) {
      setSubmitError('You must be logged in to save your profile.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await setDoc(doc(db, 'skillProfiles', user.uid), {
        ...formData,
        userId: user.uid,
        province: formData.province,
        createdAt: serverTimestamp(),
      });

      navigate('/career-matches');
    } catch (error) {
      console.error('Error saving skill profile:', error);
      setSubmitError('Failed to save your skill profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const progress = (step / 3) * 100;
  const stepTitles = ['Personal Details', 'Skills Selection', 'Career Interests'];

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Skill Profile Builder</h1>
          <p className="text-xs text-gray-400">Build your professional skills and profile</p>
        </div>
      </div>

      {/* Progress Bar & Steps indicator */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          {stepTitles.map((title, idx) => {
            const sNum = idx + 1;
            return (
              <div key={idx} className="text-center flex-1">
                <div className={`text-xs font-semibold ${sNum === step ? 'text-primary' : 'text-gray-400'}`}>
                  Step {sNum}
                </div>
                <div className={`text-[10px] hidden sm:block ${sNum === step ? 'text-gray-700 font-bold' : 'text-gray-400'}`}>
                  {title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {validationError && (
        <div className="mb-4">
          <ErrorMessage message={validationError} />
        </div>
      )}

      {submitError && (
        <div className="mb-4">
          <ErrorMessage message={submitError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">Step 1 — Personal Details</h2>
            
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Chanda Mwale"
                value={formData.fullName}
                onChange={e => handleFieldChange('fullName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 25"
                  value={formData.age}
                  onChange={e => handleFieldChange('age', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Province *</label>
                <select
                  className="select-field"
                  value={formData.province}
                  onChange={e => handleFieldChange('province', e.target.value)}
                >
                  <option value="">Select Province</option>
                  {getProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">District *</label>
              <select
                className="select-field"
                value={formData.district}
                onChange={e => handleFieldChange('district', e.target.value)}
                disabled={!formData.province}
              >
                <option value="">Select District</option>
                {getDistricts(formData.province).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Education Level *</label>
              <select
                className="select-field"
                value={formData.educationLevel}
                onChange={e => handleFieldChange('educationLevel', e.target.value)}
              >
                <option value="">Select Education Level</option>
                {EDUCATION_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Preferred Work Type *</label>
              <select
                className="select-field"
                value={formData.preferredWorkType}
                onChange={e => handleFieldChange('preferredWorkType', e.target.value)}
              >
                <option value="">Select Preferred Work Type</option>
                {WORK_TYPES.map(wt => <option key={wt} value={wt}>{wt}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Skills Selection & Extraction */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-800">Step 2 — Skills Profile</h2>
              <p className="text-xs text-gray-400 mt-1">Select your skills using a quiz, a catalog, or let Gemini AI extract them from a description.</p>
            </div>

            {/* Sub Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSkillsTab('quiz')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${skillsTab === 'quiz' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Skills Quiz
              </button>
              <button
                type="button"
                onClick={() => setSkillsTab('catalog')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${skillsTab === 'catalog' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Skill Catalog
              </button>
              <button
                type="button"
                onClick={() => setSkillsTab('ai')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${skillsTab === 'ai' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                AI Extractor
              </button>
            </div>

            {/* TAB 1: QUIZ */}
            {skillsTab === 'quiz' && (
              <div className="space-y-5 animate-fade-in">
                <p className="text-xs text-gray-500 font-medium">Select all statements that apply to you. Matching skills will be automatically added below.</p>
                {QUIZ_QUESTIONS.map(group => (
                  <div key={group.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{group.q}</h4>
                    <p className="text-[10px] text-gray-400 font-medium mb-3">{group.desc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map(opt => {
                        const isChecked = formData.selectedSkills.includes(opt.skill);
                        return (
                          <label key={opt.label} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSkillToggle(opt.skill)}
                              className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 rounded mt-0.5"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: CATALOG */}
            {skillsTab === 'catalog' && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-xs text-gray-500 font-medium">Click on any skill to add it directly to your profile.</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Technical & Creative Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {CAT1_SKILLS.map(skill => {
                        const isSelected = formData.selectedSkills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => handleSkillToggle(skill)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Trade & Local Services</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {CAT2_SKILLS.map(skill => {
                        const isSelected = formData.selectedSkills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => handleSkillToggle(skill)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Business & Leadership</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {CAT3_SKILLS.map(skill => {
                        const isSelected = formData.selectedSkills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => handleSkillToggle(skill)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${isSelected ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI EXTRACTOR */}
            {skillsTab === 'ai' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-850">AI Skill Extractor</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Powered by Gemini</span>
                  </div>
                  <p className="text-xs text-indigo-700">Describe your work experience, training, and abilities in your own words. The AI will extract corresponding skills.</p>
                  <textarea
                    className="input-field min-h-[100px] text-xs"
                    placeholder="e.g. I have been running a local shop for 3 years. I handle calculations of profit, buy stock in bulk, and manage three staff members. I am also fluent in Tonga..."
                    value={experienceDescription}
                    onChange={e => setExperienceDescription(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAIExtract}
                    disabled={aiLoading || experienceDescription.trim().length < 30}
                    className="btn-primary gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold"
                  >
                    {aiLoading ? (
                      <><LoadingSpinner size="sm" /> Extracting Skills...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Extract My Skills with AI</>
                    )}
                  </button>
                </div>

                {/* AI Result Summary */}
                {aiExtractionDone && aiSummary && (
                  <div className="bg-green-50 border border-green-150 p-4 rounded-xl">
                    <p className="text-xs font-bold text-green-700 mb-1">AI Profile Summary</p>
                    <p className="text-xs text-green-800 leading-relaxed">{aiSummary}</p>
                    {aiSuggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] text-green-600 font-semibold">Suggested additions: {aiSuggestions.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Extracted / Selected Skills (Always Visible) */}
            {formData.selectedSkills.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Your Selected Skills Profile ({formData.selectedSkills.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.selectedSkills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm">
                      {skill}
                      <button type="button" onClick={() => handleSkillToggle(skill)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            <div>
              <label className="label">Languages Spoken *</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. English, Bemba, Nyanja, Tonga"
                value={formData.languages}
                onChange={e => handleFieldChange('languages', e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-semibold flex items-center justify-between">
              <span>Selected skills count: <strong className="text-base text-blue-900">{formData.selectedSkills.length}</strong></span>
              <span>(Minimum 3 required)</span>
            </div>
          </div>
        )}

        {/* STEP 3: Career Interests */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">Step 3 — Career Interests</h2>

            <div>
              <label className="label">Top Industry Interest *</label>
              <select
                className="select-field"
                value={formData.topIndustry}
                onChange={e => handleFieldChange('topIndustry', e.target.value)}
              >
                <option value="">Select Top Industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Second Industry Interest *</label>
              <select
                className="select-field"
                value={formData.secondIndustry}
                onChange={e => handleFieldChange('secondIndustry', e.target.value)}
              >
                <option value="">Select Second Industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div>
              <label className="label">What is your biggest challenge in finding work or growing your business? (Optional)</label>
              <textarea
                className="input-field min-h-24 py-2"
                placeholder="Briefly describe your main challenge..."
                value={formData.biggestChallenge}
                onChange={e => handleFieldChange('biggestChallenge', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="label">Are you currently: *</label>
              <div className="space-y-2">
                {CURRENT_STATUS_OPTIONS.map(opt => (
                  <label key={opt} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="currentStatus"
                      className="text-primary focus:ring-primary h-4 w-4"
                      value={opt}
                      checked={formData.currentStatus === opt}
                      onChange={e => handleFieldChange('currentStatus', e.target.value)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-3"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-3"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-3"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="Saving Profile..." />
              ) : (
                'Submit Profile'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

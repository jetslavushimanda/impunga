import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, X, Plus } from 'lucide-react';
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

        {/* STEP 2: AI-Powered Skills Extraction */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-800">Step 2 — Skills Extraction</h2>
              <p className="text-xs text-gray-400 mt-1">Describe your experience and let AI identify your skills automatically.</p>
            </div>

            {/* AI Experience Description */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-800">AI Skill Extractor</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Powered by Gemini</span>
              </div>
              <p className="text-xs text-blue-700">Describe your work experience, training, and what you can do — in your own words. The AI will identify your skills automatically.</p>
              <textarea
                className="input-field min-h-[100px] text-sm"
                placeholder="e.g. I have been doing electrical wiring for 5 years. I can install solar panels and fix appliances. I also manage my own team of 3 workers and handle customer orders and payments..."
                value={experienceDescription}
                onChange={e => setExperienceDescription(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAIExtract}
                disabled={aiLoading || experienceDescription.trim().length < 30}
                className="btn-primary gap-2 w-full"
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
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-xs font-bold text-green-700 mb-1">AI Profile Summary</p>
                <p className="text-sm text-green-800">{aiSummary}</p>
                {aiSuggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 font-semibold">You might also have: {aiSuggestions.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Extracted / Selected Skills */}
            {formData.selectedSkills.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Your Extracted Skills ({formData.selectedSkills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedSkills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                      {skill}
                      <button type="button" onClick={() => handleSkillToggle(skill)} className="ml-1 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            <div>
              <label className="label">Languages — specify which you speak</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. English, Bemba, Nyanja, Tonga"
                value={formData.languages}
                onChange={e => handleFieldChange('languages', e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              Selected skills: <span className="font-bold">{formData.selectedSkills.length}</span> (Minimum 3 required)
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

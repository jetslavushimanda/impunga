import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { PenTool, ArrowLeft, Copy, User, Check, Sparkles } from 'lucide-react';

export default function CoverLetterGenerator() {
  const { user } = useAuthStore();
  const { getDocument } = useFirestore();
  const { generateCoverLetter, loading: aiLoading, error: aiError } = useGemini();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      try {
        const data = await getDocument('skillProfiles', user.uid);
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user, getDocument]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle || !company || !profile) return;
    
    try {
      const result = await generateCoverLetter(jobTitle, company, profile);
      setLetterContent(result);
      setCopied(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading Profile Data..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No Skill Profile Found</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">You need to build your skill profile before generating a cover letter.</p>
        <button onClick={() => navigate('/skill-profile-builder')} className="btn-primary w-full py-3">
          Build My Profile
        </button>
      </div>
    );
  }

  const inpClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white transition-all";
  const lblClass = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <PenTool className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Cover Letter AI</h1>
          <p className="text-gray-500 font-medium text-lg">Generate a professional, tailored cover letter instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Job Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className={lblClass}>Job Title</label>
                <input 
                  type="text" 
                  required
                  className={inpClass} 
                  placeholder="e.g. Sales Executive" 
                  value={jobTitle} 
                  onChange={e => setJobTitle(e.target.value)} 
                />
              </div>
              
              <div>
                <label className={lblClass}>Company Name</label>
                <input 
                  type="text" 
                  required
                  className={inpClass} 
                  placeholder="e.g. TradeKings Zambia" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                />
              </div>

              {aiError && <ErrorMessage message={aiError} />}

              <button 
                type="submit" 
                disabled={aiLoading || !jobTitle || !company}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                {aiLoading ? (
                  <LoadingSpinner size="sm" text="Writing Letter..." />
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
                )}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-800 leading-relaxed">
                The AI will use your saved Skill Profile (<strong>{profile.selectedSkills?.length || 0} skills</strong>) to automatically customize this letter.
              </p>
            </div>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Your Generated Letter</h2>
              {letterContent && (
                <button 
                  onClick={handleCopy}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? <><Check className="w-4 h-4 text-green-600"/> Copied!</> : <><Copy className="w-4 h-4"/> Copy Text</>}
                </button>
              )}
            </div>

            {letterContent ? (
              <div className="flex-1">
                <textarea 
                  className="w-full h-full min-h-[400px] p-4 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                <PenTool className="w-12 h-12 mb-3 text-gray-200" />
                <p className="text-sm">Enter the job details and click generate to see your letter here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

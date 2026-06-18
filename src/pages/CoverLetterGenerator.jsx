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

  // Address and header particulars
  const [details, setDetails] = useState({
    phone: '',
    email: '',
    location: '',
    date: new Date().toLocaleDateString('en-GB'),
    hiringManager: 'Hiring Team',
    companyAddress: 'Lusaka, Zambia'
  });

  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      try {
        const data = await getDocument('skillProfiles', user.uid);
        if (data) {
          setProfile(data);
          setDetails(prev => ({
            ...prev,
            email: data.email || user.email || '',
            phone: data.phone || '',
            location: data.district ? `${data.district}, ${data.province}` : ''
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle || !company || !profile) return;
    
    try {
      const result = await generateCoverLetter(jobTitle, company, profile, details);
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
    <div className="max-w-5xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <PenTool className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Cover Letter AI</h1>
          <p className="text-gray-500 font-medium text-lg">Generate a professional, structured cover letter matching standard Zambian layouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Panel */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Letter Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lblClass}>Your Phone</label>
                  <input type="text" required className={inpClass + " !py-2.5"} placeholder="e.g. 0961234567" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
                </div>
                <div>
                  <label className={lblClass}>Your Email</label>
                  <input type="email" required className={inpClass + " !py-2.5"} placeholder="e.g. name@domain.com" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className={lblClass}>Your Location</label>
                <input type="text" required className={inpClass + " !py-2.5"} placeholder="e.g. Lusaka, Lusaka Province" value={details.location} onChange={e => setDetails({...details, location: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lblClass}>Date</label>
                  <input type="text" required className={inpClass + " !py-2.5"} placeholder="DD/MM/YYYY" value={details.date} onChange={e => setDetails({...details, date: e.target.value})} />
                </div>
                <div>
                  <label className={lblClass}>Hiring Lead / Team</label>
                  <input type="text" required className={inpClass + " !py-2.5"} placeholder="e.g. Hiring Manager" value={details.hiringManager} onChange={e => setDetails({...details, hiringManager: e.target.value})} />
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 space-y-4">
                <div>
                  <label className={lblClass}>Target Job Title</label>
                  <input 
                    type="text" 
                    required
                    className={inpClass} 
                    placeholder="e.g. Assistant Accountant" 
                    value={jobTitle} 
                    onChange={e => setJobTitle(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className={lblClass}>Target Company Name</label>
                  <input 
                    type="text" 
                    required
                    className={inpClass} 
                    placeholder="e.g. TradeKings Zambia" 
                    value={company} 
                    onChange={e => setCompany(e.target.value)} 
                  />
                </div>

                <div>
                  <label className={lblClass}>Company Address</label>
                  <input 
                    type="text" 
                    required
                    className={inpClass} 
                    placeholder="e.g. Plot 1234, Industrial Area, Lusaka" 
                    value={details.companyAddress} 
                    onChange={e => setDetails({...details, companyAddress: e.target.value})} 
                  />
                </div>
              </div>

              {aiError && <ErrorMessage message={aiError} />}

              <button 
                type="submit" 
                disabled={aiLoading || !jobTitle || !company}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
              >
                {aiLoading ? (
                  <LoadingSpinner size="sm" text="Writing Letter..." />
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
                )}
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
              <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                Gemini AI will structure a complete document matching your exact contact information and skill list.
              </p>
            </div>
          </form>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col relative">
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
              <h2 className="text-lg font-bold text-gray-800">Your Structured Letter</h2>
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
              <div className="flex-1 flex flex-col">
                <textarea 
                  className="w-full flex-1 min-h-[450px] p-4 text-sm font-mono text-gray-700 bg-gray-50/50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-20">
                <PenTool className="w-12 h-12 mb-3 text-gray-200 animate-pulse" />
                <p className="text-sm font-medium">Enter the details on the left and click generate to generate your cover letter.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

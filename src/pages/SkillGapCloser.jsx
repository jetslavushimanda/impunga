import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { Target, ArrowLeft, Sparkles, Map, Calendar, ExternalLink } from 'lucide-react';

export default function SkillGapCloser() {
  const { userProfile } = useAuthStore();
  const { generateSkillGapPlan, loading: aiLoading, error: aiError } = useGemini();
  const navigate = useNavigate();

  const [skill, setSkill] = useState('');
  const [plan, setPlan] = useState(null);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!skill.trim()) return;

    try {
      const result = await generateSkillGapPlan(skill, userProfile?.province || 'Zambia');
      setPlan(result);
    } catch (err) {
      console.error(err);
    }
  };

  const inpClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 bg-white transition-all";
  
  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Skill Gap Closer</h1>
          <p className="text-gray-500 font-medium text-lg">Generate a personalized 4-week learning plan to master a new skill in Zambia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGeneratePlan} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">What do you want to learn?</h2>
            
            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  required
                  className={inpClass} 
                  placeholder="e.g. Data Analysis, Welding, Tailoring" 
                  value={skill} 
                  onChange={e => setSkill(e.target.value)} 
                />
                <p className="text-xs text-gray-400 mt-2">Enter any skill you are missing from your Career Matches.</p>
              </div>

              {aiError && <ErrorMessage message={aiError} />}

              <button 
                type="submit" 
                disabled={aiLoading || !skill.trim()}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
              >
                {aiLoading ? (
                  <LoadingSpinner size="sm" text="Creating Plan..." />
                ) : (
                  <><Map className="w-5 h-5" /> Generate Learning Plan</>
                )}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-cyan-50 rounded-xl border border-cyan-100 flex gap-3">
              <Sparkles className="w-5 h-5 text-cyan-600 shrink-0" />
              <p className="text-xs text-cyan-800 leading-relaxed">
                The AI will design a practical 4-week syllabus tailored to resources available in <strong>{userProfile?.province || 'Zambia'}</strong>.
              </p>
            </div>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          {!plan && !aiLoading && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col items-center justify-center text-center text-gray-400">
              <Target className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm">Enter a skill and click generate to see your 4-week plan here.</p>
            </div>
          )}

          {aiLoading && (
             <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
               <LoadingSpinner text={`Designing 4-week curriculum for ${skill}...`} />
             </div>
          )}

          {plan && !aiLoading && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-cyan-600" /> 4-Week Plan: {skill}
                  </h2>
                  <p className="text-gray-600 text-sm">{plan.summary}</p>
                </div>

                <div className="space-y-6">
                  {plan.weeks.map((week) => (
                    <div key={week.weekNumber} className="relative pl-6 border-l-2 border-cyan-100">
                      <div className="absolute w-4 h-4 bg-cyan-500 rounded-full -left-[9px] top-1 border-4 border-white"></div>
                      <h3 className="font-bold text-gray-800 text-base mb-1">Week {week.weekNumber}: {week.focus}</h3>
                      <ul className="space-y-2 mt-3">
                        {week.activities.map((act, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-cyan-500 mt-1 text-[10px]">■</span>
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 rounded-2xl p-5 border border-blue-100">
                  <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-blue-600" /> Recommended Local Resources
                  </h3>
                  <ul className="space-y-2">
                    {plan.localResources.map((res, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span> {res}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CDF Skills Development Bursaries Info */}
                <div className="mt-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6">
                  <h3 className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-1.5">
                    🎓 CDF Skills Development Bursaries (Zambia)
                  </h3>
                  <p className="text-xs text-indigo-800 leading-relaxed font-medium mb-3">
                    Did you know? Under the **Zambian Constituency Development Fund (CDF)**, you can apply for a full skills training bursary to attend TEVETA-approved institutions in your district.
                  </p>
                  <ul className="space-y-2 text-xs text-indigo-800 leading-relaxed font-medium">
                    <li className="flex gap-2">
                      <span className="text-indigo-500 font-bold">✓</span>
                      <span>Obtain an admission letter from a registered TEVETA training institution.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-500 font-bold">✓</span>
                      <span>Collect a CDF Bursary Application Form from your Ward Development Committee or local Council offices.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-500 font-bold">✓</span>
                      <span>Submit completed form alongside copies of your NRC, academic records, and admission letter.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

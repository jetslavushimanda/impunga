import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { MessageCircle, ArrowLeft, Send, Play, CheckCircle } from 'lucide-react';
import { CAREERS } from './CareerMatches';

export default function InterviewPrep() {
  const { userProfile } = useAuthStore();
  const { generateInterviewQuestions, evaluateInterviewAnswers, loading: aiLoading, error: aiError } = useGemini();
  const navigate = useNavigate();

  const [selectedCareer, setSelectedCareer] = useState('');
  const [customCareer, setCustomCareer] = useState('');
  
  const [step, setStep] = useState(1); // 1: Setup, 2: Interview, 3: Feedback
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [feedback, setFeedback] = useState(null);

  const activeCareer = selectedCareer === 'custom' ? customCareer : selectedCareer;

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!activeCareer) return;

    try {
      const qList = await generateInterviewQuestions(activeCareer, userProfile?.province || 'Zambia');
      setQuestions(qList);
      setAnswers(new Array(qList.length).fill(''));
      setCurrentQuestionIndex(0);
      setStep(2);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(newAnswers[currentQuestionIndex + 1] || '');
    } else {
      handleFinishInterview(newAnswers);
    }
  };

  const handleFinishInterview = async (finalAnswers) => {
    try {
      setStep(3); // Move to feedback step immediately to show loading
      const result = await evaluateInterviewAnswers(activeCareer, questions, finalAnswers);
      setFeedback(result);
    } catch (err) {
      console.error(err);
      setStep(2); // Go back if it fails
    }
  };

  const resetInterview = () => {
    setStep(1);
    setQuestions([]);
    setAnswers([]);
    setFeedback(null);
    setCurrentAnswer('');
  };

  const inpClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-white transition-all";
  const lblClass = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Interview Prep Wizard</h1>
          <p className="text-gray-500 font-medium text-lg">Practice your interview skills with AI-generated questions tailored to your target job in Zambia.</p>
        </div>
      </div>

      {aiError && <ErrorMessage message={aiError} />}

      {/* STEP 1: Setup */}
      {step === 1 && (
        <form onSubmit={handleStartInterview} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Select Target Role</h2>
          
          <div>
            <label className={lblClass}>Which job are you interviewing for?</label>
            <select 
              className={inpClass}
              value={selectedCareer}
              onChange={e => setSelectedCareer(e.target.value)}
              required
            >
              <option value="">-- Select a Career --</option>
              {CAREERS.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
              <option value="custom">Other (Type custom role)</option>
            </select>
          </div>

          {selectedCareer === 'custom' && (
            <div className="animate-fade-in">
              <label className={lblClass}>Custom Job Title</label>
              <input 
                type="text" 
                className={inpClass} 
                placeholder="e.g. Bank Teller" 
                value={customCareer} 
                onChange={e => setCustomCareer(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mt-4">
            <p className="text-sm text-rose-800 font-medium flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-rose-600" />
              The AI will generate 4 industry-specific questions. Treat this like a real interview!
            </p>
          </div>

          <button 
            type="submit" 
            disabled={aiLoading || !activeCareer}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base shadow-xl"
          >
            {aiLoading ? (
              <LoadingSpinner size="sm" text="Preparing Interview..." />
            ) : (
              <><Play className="w-5 h-5" /> Start Mock Interview</>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Interview */}
      {step === 2 && questions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-800">Mock Interview</h2>
            <span className="bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full text-xs">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Interviewer</p>
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              "{questions[currentQuestionIndex]}"
            </p>
          </div>

          <div>
            <label className={lblClass}>Your Answer</label>
            <textarea
              className={`${inpClass} min-h-32`}
              placeholder="Type your answer here as if you were speaking..."
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button type="button" onClick={resetInterview} className="text-xs font-bold text-gray-400 hover:text-gray-600">
              Quit Interview
            </button>
            <button 
              type="button"
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim() || aiLoading}
              className="btn-primary py-3 px-6 flex items-center gap-2"
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <><CheckCircle className="w-5 h-5" /> Finish & Get Feedback</>
              ) : (
                <><Send className="w-4 h-4" /> Next Question</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Feedback */}
      {step === 3 && (
        <div className="space-y-6">
          {!feedback ? (
             <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
               <LoadingSpinner text="Evaluating your answers and generating feedback..." />
             </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-fade-in">
              <div className="text-center pb-6 border-b border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 text-rose-600 mb-4">
                  <span className="text-3xl font-black">{feedback.score}</span>
                  <span className="text-sm font-bold mt-2">%</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Readiness Score</h2>
                <p className="text-gray-600 text-sm max-w-lg mx-auto">{feedback.feedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <h3 className="text-green-800 font-bold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                  <h3 className="text-orange-800 font-bold mb-3 flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5 rotate-45" /> Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {feedback.areasToImprove.map((a, i) => (
                      <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 text-center">
                <button onClick={resetInterview} className="btn-primary w-full py-4 shadow-lg text-base">
                  Practice Another Interview
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

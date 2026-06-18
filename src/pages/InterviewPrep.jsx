import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGemini } from '../hooks/useGemini';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { MessageCircle, ArrowLeft, Send, Play, CheckCircle, Volume2, VolumeX, Mic, MicOff, Settings, AlertCircle } from 'lucide-react';
import { CAREERS } from '../data/careers';

export default function InterviewPrep() {
  const { userProfile } = useAuthStore();
  const { generateInterviewQuestions, evaluateInterviewAnswers, loading: aiLoading, error: aiError } = useGemini();
  const navigate = useNavigate();

  const [selectedCareer, setSelectedCareer] = useState('');
  const [customCareer, setCustomCareer] = useState('');
  const [questionCount, setQuestionCount] = useState(6);
  
  const [step, setStep] = useState(1); // 1: Setup, 2: Interview, 3: Feedback
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [feedback, setFeedback] = useState(null);

  // Speech TTS states
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech STT states
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const activeCareer = selectedCareer === 'custom' ? customCareer : selectedCareer;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      
      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentAnswer(prev => {
            const spacing = prev.trim() ? ' ' : '';
            return prev + spacing + finalTranscript;
          });
        }
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };
      
      setRecognitionInstance(rec);
    }
  }, []);

  // TTS Speaker function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82; // Calm voice speed suited for HR interviewers
      utterance.pitch = 1.0;
      
      // Query calm professional English voice (female/natural if possible)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Female')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speak question when active index or step changes
  useEffect(() => {
    if (step === 2 && questions[currentQuestionIndex] && autoSpeak) {
      const t = setTimeout(() => {
        speak(questions[currentQuestionIndex]);
      }, 600);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    } else {
      stopSpeaking();
    }
  }, [step, currentQuestionIndex, questions, autoSpeak]);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!activeCareer) return;

    try {
      const qList = await generateInterviewQuestions(activeCareer, userProfile?.province || 'Zambia', questionCount);
      setQuestions(qList);
      setAnswers(new Array(qList.length).fill(''));
      setCurrentQuestionIndex(0);
      setStep(2);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextQuestion = () => {
    // Stop recording if active
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }
    stopSpeaking();

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

  const toggleListening = () => {
    if (!recognitionInstance) return;
    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionInstance.start();
    }
  };

  const resetInterview = () => {
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }
    stopSpeaking();
    setStep(1);
    setQuestions([]);
    setAnswers([]);
    setFeedback(null);
    setCurrentAnswer('');
    setCurrentQuestionIndex(0);
  };

  const inpClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-white transition-all";
  const lblClass = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Interactive Interview Prep</h1>
          <p className="text-gray-500 font-medium text-lg">Practice with interactive voice calls read out by a virtual HR manager.</p>
        </div>
      </div>

      {aiError && <ErrorMessage message={aiError} />}

      {/* STEP 1: Setup */}
      {step === 1 && (
        <form onSubmit={handleStartInterview} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Configure Mock Interview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className={lblClass}>Interview Length (Number of Questions)</label>
              <select 
                className={inpClass}
                value={questionCount}
                onChange={e => setQuestionCount(parseInt(e.target.value))}
              >
                <option value={3}>Short (3 questions)</option>
                <option value={6}>Standard (6 questions)</option>
                <option value={9}>Long (9 questions)</option>
              </select>
            </div>
          </div>

          {selectedCareer === 'custom' && (
            <div className="animate-fade-in">
              <label className={lblClass}>Custom Job Title</label>
              <input 
                type="text" 
                className={inpClass} 
                placeholder="e.g. Solar Installer or Retail Cashier" 
                value={customCareer} 
                onChange={e => setCustomCareer(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 p-5 rounded-2xl border border-rose-100/60 space-y-3">
            <h3 className="font-bold text-rose-950 text-sm flex items-center gap-1.5">🎙️ Voice & Interactive Settings</h3>
            <div className="flex flex-col sm:flex-row gap-4 text-xs font-semibold text-rose-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={autoSpeak} onChange={e => setAutoSpeak(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4" />
                <span>Auto-read questions aloud (Text-To-Speech)</span>
              </label>
              
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-rose-100">
                <span className="text-[10px] uppercase font-bold text-gray-500">Mic Status:</span>
                <span>{recognitionSupported ? '🎙️ Speech-to-Text Available' : '❌ Mic Unsupported'}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={aiLoading || !activeCareer}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base shadow-xl bg-rose-600 hover:bg-rose-700"
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

          {/* Question speaking card */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
            <div className="flex justify-between items-start gap-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Virtual HR Manager</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => speak(questions[currentQuestionIndex])}
                  className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${isSpeaking ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  <Volume2 className="w-4 h-4" /> {isSpeaking ? 'Speaking...' : 'Read Aloud'}
                </button>
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 text-xs font-bold"
                  >
                    <VolumeX className="w-4 h-4" /> Stop
                  </button>
                )}
              </div>
            </div>
            <p className="text-lg font-medium text-gray-900 leading-relaxed font-outfit">
              "{questions[currentQuestionIndex]}"
            </p>
          </div>

          {/* Interactive Answer Input with STT support */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className={lblClass}>Your Answer</label>
              {recognitionSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isListening ? 'bg-red-100 border border-red-200 text-red-700 animate-pulse' : 'bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100'}`}
                >
                  {isListening ? (
                    <><MicOff className="w-3.5 h-3.5" /> Stop Recording</>
                  ) : (
                    <><Mic className="w-3.5 h-3.5" /> Answer by Speaking</>
                  )}
                </button>
              )}
            </div>
            
            {isListening && (
              <div className="bg-red-50/70 border border-red-100 p-2.5 rounded-xl text-[11px] text-red-700 font-semibold flex items-center gap-2 animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span>
                Virtual HR is listening... Speak clearly. Click "Stop Recording" when done.
              </div>
            )}

            <textarea
              className={`${inpClass} min-h-36`}
              placeholder={recognitionSupported ? "Type your answer or click 'Answer by Speaking' to dictate verbally..." : "Type your answer here..."}
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
              className="btn-primary py-3 px-6 flex items-center gap-2 bg-rose-600 hover:bg-rose-700"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Readiness Score</h2>
                <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">{feedback.feedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <h3 className="text-green-800 font-bold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" /> Your Key Strengths
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
                    <AlertCircle className="w-5 h-5 text-orange-600" /> Areas to Improve
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
                <button onClick={resetInterview} className="btn-primary w-full py-4 shadow-lg text-base bg-rose-600 hover:bg-rose-700">
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

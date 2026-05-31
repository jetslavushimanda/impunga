import { useState } from 'react';
import { GraduationCap, ChevronRight, RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS, CATEGORIES } from '../data/quizQuestions';

function ScoreCard({ score, total, onRestart, onCategory }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? { label: 'Excellent!', color: 'text-accent-green', emoji: '🏆', msg: 'You are ready to be a successful Zambian entrepreneur!' }
    : pct >= 60 ? { label: 'Good Job!', color: 'text-primary', emoji: '⭐', msg: 'You have a solid foundation. Keep learning with IMPUNGA!' }
    : pct >= 40 ? { label: 'Keep Learning', color: 'text-accent-orange', emoji: '📚', msg: 'Good effort! Review the modules on IMPUNGA to strengthen your knowledge.' }
    : { label: 'Keep Practicing', color: 'text-accent-red', emoji: '💪', msg: 'Every expert was once a beginner. Use IMPUNGA to learn and try again!' };

  return (
    <div className="max-w-lg mx-auto text-center animate-slide-up">
      <div className="card mb-6">
        <div className="text-6xl mb-3">{grade.emoji}</div>
        <h2 className={`text-3xl font-bold ${grade.color} mb-1`}>{grade.label}</h2>
        <div className="text-6xl font-bold text-primary my-4">{pct}%</div>
        <p className="text-gray-600 text-lg mb-1">{score} out of {total} correct</p>
        <p className="text-gray-500 text-sm mb-6">{grade.msg}</p>

        <div className="progress-bar-track mb-6">
          <div className="progress-bar-fill transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? 'var(--color-accent-green)' : pct >= 60 ? 'var(--color-primary)' : pct >= 40 ? 'var(--color-accent-orange)' : 'var(--color-accent-red)' }} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Correct', value: score, color: 'text-accent-green' },
            { label: 'Wrong', value: total - score, color: 'text-accent-red' },
            { label: 'Score', value: `${pct}%`, color: 'text-primary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-light rounded-xl p-3">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <button onClick={onRestart} className="btn-primary w-full gap-2 mb-3">
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
        <button onClick={onCategory} className="btn-secondary w-full">
          Practice by Category
        </button>
      </div>
    </div>
  );
}

export default function BusinessQuiz() {
  const [mode, setMode] = useState('home'); // home | quiz | results | category
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  function startQuiz(category = 'All') {
    const pool = category === 'All' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter(q => q.category === category);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(20, pool.length));
    setQuestions(shuffled);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setResults([]);
    setMode('quiz');
  }

  function handleAnswer(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === questions[current].correct;
    if (correct) setScore(s => s + 1);
    setResults(prev => [...prev, { question: questions[current], selected: idx, correct }]);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setMode('results');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  if (mode === 'results') {
    return <ScoreCard score={score} total={questions.length} onRestart={() => startQuiz()} onCategory={() => setMode('home')} />;
  }

  if (mode === 'quiz') {
    const q = questions[current];
    const progress = ((current + 1) / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Question {current + 1} of {questions.length}</span>
          <span className="badge badge-government">{q.category}</span>
        </div>
        <div className="progress-bar-track mb-6">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="card mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-6">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, idx) => {
              let style = 'border-gray-200 text-gray-700 hover:border-primary hover:bg-surface-blue';
              if (answered) {
                if (idx === q.correct) style = 'border-accent-green bg-green-50 text-green-800';
                else if (idx === selected && idx !== q.correct) style = 'border-accent-red bg-red-50 text-red-800';
                else style = 'border-gray-200 text-gray-400 opacity-60';
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium flex items-center gap-3 ${style}`}
                >
                  <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0" style={{ borderColor: 'currentColor' }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                  {answered && idx === q.correct && <CheckCircle className="w-5 h-5 text-accent-green ml-auto shrink-0" />}
                  {answered && idx === selected && idx !== q.correct && <XCircle className="w-5 h-5 text-accent-red ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`mt-4 p-4 rounded-xl text-sm animate-slide-up ${selected === q.correct ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <p className="font-bold mb-1">{selected === q.correct ? '✅ Correct!' : '❌ Incorrect'}</p>
              <p>{q.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-gold" />
            <span className="font-bold text-gray-700">{score} / {current + (answered ? 1 : 0)}</span>
          </div>
          {answered && (
            <button onClick={handleNext} className="btn-primary gap-2">
              {current + 1 >= questions.length ? 'See Results' : 'Next Question'} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Home screen
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-accent-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Knowledge Quiz</h1>
          <p className="text-gray-500 text-sm">Test your Zambian entrepreneurship knowledge — 20 questions</p>
        </div>
      </div>

      <div className="card mb-4 text-center">
        <div className="text-5xl mb-3">🧠</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Are you ready to be a Zambian entrepreneur?</h2>
        <p className="text-gray-500 text-sm mb-6">Questions cover PACRA registration, ZRA taxes, pricing, funding, marketing and more.</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: '20 Questions', icon: '📝' },
            { label: '6 Categories', icon: '📂' },
            { label: 'Learn as You Go', icon: '💡' },
          ].map(({ label, icon }) => (
            <div key={label} className="bg-surface-light rounded-xl p-3">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xs font-medium text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        <button onClick={() => startQuiz()} className="btn-primary w-full text-base gap-2 mb-3">
          <GraduationCap className="w-5 h-5" /> Start Full Quiz (20 Questions)
        </button>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">Practice by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => {
            const count = QUIZ_QUESTIONS.filter(q => q.category === cat).length;
            const emojis = { Registration: '📋', Taxation: '🧾', Funding: '💰', 'Pricing & Profit': '📊', 'Business Structure': '🏢', Marketing: '📣', Finance: '🏦', Entrepreneurship: '🚀' };
            return (
              <button key={cat} onClick={() => startQuiz(cat)} className="p-4 bg-surface-light hover:bg-surface-blue rounded-xl text-left transition-colors border border-transparent hover:border-primary">
                <p className="text-2xl mb-1">{emojis[cat] || '📚'}</p>
                <p className="font-semibold text-gray-800 text-sm">{cat}</p>
                <p className="text-xs text-gray-400">{count} questions</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

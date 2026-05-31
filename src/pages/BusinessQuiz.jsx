import { useState } from 'react';
import {
  GraduationCap, ChevronRight, RotateCcw, Trophy, CheckCircle, XCircle,
  FileText, Folder, Lightbulb, Clipboard, Receipt, DollarSign,
  BarChart2, Building2, Megaphone, Landmark, TrendingUp, Star,
  BookOpen, Shield, Zap, AlertTriangle, Target
} from 'lucide-react';
import { QUIZ_QUESTIONS, CATEGORIES } from '../data/quizQuestions';

const CATEGORY_ICONS = {
  Registration: Clipboard,
  Taxation: Receipt,
  Funding: DollarSign,
  'Pricing & Profit': BarChart2,
  'Business Structure': Building2,
  Marketing: Megaphone,
  Finance: Landmark,
  Entrepreneurship: TrendingUp,
};

const GRADE_CONFIG = [
  { min: 80, label: 'Excellent!', color: 'text-accent-green', bgColor: 'bg-green-50 border-accent-green', icon: Trophy, iconColor: 'text-accent-gold', msg: 'You are ready to be a successful Zambian entrepreneur!' },
  { min: 60, label: 'Good Job!', color: 'text-primary', bgColor: 'bg-blue-50 border-primary', icon: Star, iconColor: 'text-primary', msg: 'You have a solid foundation. Keep learning with IMPUNGA!' },
  { min: 40, label: 'Keep Learning', color: 'text-accent-orange', bgColor: 'bg-orange-50 border-accent-orange', icon: BookOpen, iconColor: 'text-accent-orange', msg: 'Good effort! Review the modules on IMPUNGA to strengthen your knowledge.' },
  { min: 0, label: 'Keep Practicing', color: 'text-accent-red', bgColor: 'bg-red-50 border-accent-red', icon: Zap, iconColor: 'text-accent-red', msg: 'Every expert was once a beginner. Use IMPUNGA to learn and try again!' },
];

function ScoreCard({ score, total, onRestart, onCategory }) {
  const pct = Math.round((score / total) * 100);
  const grade = GRADE_CONFIG.find(g => pct >= g.min);
  const GradeIcon = grade.icon;

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className={`card mb-6 border-2 ${grade.bgColor}`}>
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${grade.bgColor}`}>
            <GradeIcon className={`w-10 h-10 ${grade.iconColor}`} />
          </div>
          <h2 className={`text-3xl font-bold ${grade.color} mb-1`}>{grade.label}</h2>
          <div className="text-6xl font-bold text-primary my-4">{pct}%</div>
          <p className="text-gray-600 text-lg mb-1">{score} out of {total} correct</p>
          <p className="text-gray-500 text-sm">{grade.msg}</p>
        </div>

        <div className="progress-bar-track mb-6">
          <div className="progress-bar-fill transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Correct', value: score, color: 'text-accent-green' },
            { label: 'Wrong', value: total - score, color: 'text-accent-red' },
            { label: 'Score', value: `${pct}%`, color: 'text-primary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-light rounded-xl p-3 text-center">
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
  const [mode, setMode] = useState('home');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  function startQuiz(category = 'All') {
    const pool = category === 'All' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter(q => q.category === category);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(20, pool.length));
    setQuestions(shuffled);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setMode('quiz');
  }

  function handleAnswer(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[current].correct) setScore(s => s + 1);
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
    const CategoryIcon = CATEGORY_ICONS[q.category] || GraduationCap;

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Question {current + 1} of {questions.length}</span>
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-primary" />
            <span className="badge badge-government text-xs">{q.category}</span>
          </div>
        </div>
        <div className="progress-bar-track mb-6">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="card mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, idx) => {
              let cls = 'border-gray-200 text-gray-700 hover:border-primary hover:bg-surface-blue cursor-pointer';
              if (answered) {
                if (idx === q.correct) cls = 'border-accent-green bg-green-50 text-green-800 cursor-default';
                else if (idx === selected) cls = 'border-accent-red bg-red-50 text-red-800 cursor-default';
                else cls = 'border-gray-100 text-gray-300 cursor-default';
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium flex items-center gap-3 ${cls}`}>
                  <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0" style={{ borderColor: 'currentColor' }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm sm:text-base">{option}</span>
                  {answered && idx === q.correct && <CheckCircle className="w-5 h-5 text-accent-green ml-auto shrink-0" />}
                  {answered && idx === selected && idx !== q.correct && <XCircle className="w-5 h-5 text-accent-red ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`mt-4 p-4 rounded-xl text-sm animate-slide-up border ${selected === q.correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                {selected === q.correct
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <XCircle className="w-4 h-4 shrink-0" />}
                <p className="font-bold">{selected === q.correct ? 'Correct!' : 'Incorrect'}</p>
              </div>
              <p className="leading-relaxed">{q.explanation}</p>
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
              {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
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
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-accent-gold" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Are you ready to be a Zambian entrepreneur?</h2>
        <p className="text-gray-500 text-sm mb-6">Questions cover PACRA registration, ZRA taxes, pricing, funding, marketing and more.</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: '20 Questions', icon: FileText },
            { label: '6 Categories', icon: Folder },
            { label: 'Learn as You Go', icon: Lightbulb },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="bg-surface-light rounded-xl p-3">
              <Icon className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        <button onClick={() => startQuiz()} className="btn-primary w-full text-base gap-2">
          <GraduationCap className="w-5 h-5" /> Start Full Quiz (20 Questions)
        </button>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">Practice by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || GraduationCap;
            const count = QUIZ_QUESTIONS.filter(q => q.category === cat).length;
            return (
              <button key={cat} onClick={() => startQuiz(cat)}
                className="p-4 bg-surface-light hover:bg-surface-blue rounded-xl text-left transition-colors border border-transparent hover:border-primary">
                <Icon className="w-6 h-6 text-primary mb-2" />
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

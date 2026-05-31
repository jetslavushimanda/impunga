import { useState } from 'react';
import { Building2, CheckSquare, Square, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { PACRA_STEPS, ZRA_STEPS, BANK_ACCOUNT_STEPS } from '../data/pacraSteps';

const RECOMMENDER_QUESTIONS = [
  { id: 'partners', q: 'How many people are starting this business?', options: ['Just me', '2-5 partners', '6 or more'] },
  { id: 'goal', q: 'What is your main goal for registering?', options: ['Open a bank account', 'Get contracts / tenders', 'Get funding / loans', 'Protect my business name', 'All of the above'] },
  { id: 'revenue', q: 'Estimated annual revenue?', options: ['Under K50,000', 'K50,000 – K500,000', 'Over K500,000'] },
  { id: 'liability', q: 'Do you want to limit personal liability?', options: ['Yes definitely', 'Not sure', 'Not important to me'] },
  { id: 'social', q: 'Is this a social or community project?', options: ['Yes, mainly community focused', 'Partly', 'No, purely business'] },
];

function recommendStructure(answers) {
  if (answers.social === 'Yes, mainly community focused') return { id: 'cbo', reason: 'A CBO (Community Based Organisation) is ideal for community-focused projects and gives you access to NGO and government donor funding.' };
  if (answers.partners === 'Just me' && answers.liability === 'Not important to me') return { id: 'sole_trader', reason: 'A Sole Trader registration is perfect for a one-person business. It is the cheapest and fastest to register in Zambia at only K220.' };
  if (answers.partners === '2-5 partners' && answers.liability === 'Not important to me') return { id: 'partnership', reason: 'A Partnership registration is right for 2-5 owners sharing the business. It is straightforward and affordable.' };
  if (answers.liability === 'Yes definitely' || answers.revenue === 'Over K500,000' || answers.goal === 'Get funding / loans') return { id: 'private_limited', reason: 'A Private Limited Company gives you limited liability protection, maximum credibility with banks and funders, and the ability to raise investment.' };
  return { id: 'sole_trader', reason: 'Based on your answers, a Sole Trader Business Name registration is the best starting point. You can always upgrade to a Limited Company as your business grows.' };
}

export default function RegistrationGuide() {
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [selectedType, setSelectedType] = useState('sole_trader');
  const [completedSteps, setCompletedSteps] = useState({});
  const [expanded, setExpanded] = useState({});

  function handleGetRecommendation() {
    const rec = recommendStructure(answers);
    setRecommendation(rec);
    setSelectedType(rec.id);
  }

  function toggleStep(stepNum) {
    setCompletedSteps(prev => ({ ...prev, [`${selectedType}-${stepNum}`]: !prev[`${selectedType}-${stepNum}`] }));
  }

  function toggleExpand(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const steps = PACRA_STEPS[selectedType] || [];
  const completedCount = steps.filter(s => completedSteps[`${selectedType}-${s.stepNumber}`]).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registration Guide</h1>
          <p className="text-gray-500 text-sm">Step-by-step PACRA and ZRA registration for Zambian entrepreneurs</p>
        </div>
      </div>

      {/* Business structure recommender */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Which Business Structure is Right for You?</h2>
        <div className="space-y-4">
          {RECOMMENDER_QUESTIONS.map(({ id, q, options }) => (
            <div key={id}>
              <p className="text-sm font-medium text-gray-700 mb-2">{q}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers(prev => ({ ...prev, [id]: opt }))}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers[id] === opt ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleGetRecommendation}
          disabled={Object.keys(answers).length < 5}
          className="btn-primary mt-4"
        >
          Get My Recommendation
        </button>
      </div>

      {/* Recommendation result */}
      {recommendation && (
        <div className="card border-l-4 border-accent-green mb-6 animate-slide-up">
          <p className="text-accent-green font-bold mb-1">✓ Recommended for You</p>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {BUSINESS_TYPES.find(t => t.id === recommendation.id)?.name}
          </h3>
          <p className="text-gray-600 text-sm">{recommendation.reason}</p>
        </div>
      )}

      {/* Structure tabs */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Business Structure Comparison</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {BUSINESS_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedType === type.id ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}
            >
              {type.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {(() => {
          const type = BUSINESS_TYPES.find(t => t.id === selectedType);
          if (!type) return null;
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-accent-green mb-1">ADVANTAGES</p>
                <ul className="space-y-1">{type.pros.map(p => <li key={p} className="text-sm text-gray-700 flex gap-2"><span className="text-accent-green">+</span>{p}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-bold text-accent-red mb-1">DISADVANTAGES</p>
                <ul className="space-y-1">{type.cons.map(c => <li key={c} className="text-sm text-gray-700 flex gap-2"><span className="text-accent-red">–</span>{c}</li>)}</ul>
              </div>
              <div className="sm:col-span-2 flex gap-4 text-sm pt-2 border-t border-gray-100">
                <span><b>Fee:</b> K{type.pacraFee}</span>
                <span><b>Time:</b> {type.timeToRegister}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Registration steps */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Registration Steps</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">{completedCount}/{steps.length} complete</p>
            <div className="progress-bar-track w-24 mt-1">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const key = `${selectedType}-${step.stepNumber}`;
            const done = !!completedSteps[key];
            const open = !!expanded[key];
            return (
              <div key={step.stepNumber} className={`border rounded-xl overflow-hidden ${done ? 'border-accent-green bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3 p-3">
                  <button onClick={() => toggleStep(step.stepNumber)} className="mt-0.5 flex-shrink-0">
                    {done ? <CheckSquare className="w-5 h-5 text-accent-green" /> : <Square className="w-5 h-5 text-gray-300" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-800">Step {step.stepNumber}: {step.title}</p>
                      <div className="flex items-center gap-2">
                        {step.cost > 0 && <span className="badge badge-loan">K{step.cost}</span>}
                        {step.onlineAvailable && <span className="badge badge-grant">Online</span>}
                        <button onClick={() => toggleExpand(key)}>
                          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-2 text-sm text-gray-600 space-y-2">
                        <p>{step.description}</p>
                        {step.documents?.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700">Documents needed:</p>
                            <ul className="list-disc ml-4 space-y-0.5">{step.documents.map(d => <li key={d}>{d}</li>)}</ul>
                          </div>
                        )}
                        {step.tips?.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700">Tips:</p>
                            <ul className="list-disc ml-4 space-y-0.5">{step.tips.map(t => <li key={t}>{t}</li>)}</ul>
                          </div>
                        )}
                        <p className="text-gray-400">Timeframe: {step.timeframe}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ZRA section */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-800 mb-4">ZRA Tax Registration</h2>
        <div className="space-y-3">
          {ZRA_STEPS.map(step => (
            <div key={step.stepNumber} className="border border-gray-200 rounded-xl p-3">
              <p className="font-semibold text-sm text-gray-800">Step {step.stepNumber}: {step.title}</p>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              {step.tips?.length > 0 && (
                <ul className="mt-2 text-xs text-primary space-y-0.5">{step.tips.map(t => <li key={t}>→ {t}</li>)}</ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bank account section */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">Opening a Business Bank Account</h2>
        {BANK_ACCOUNT_STEPS.map(step => (
          <div key={step.stepNumber} className="mb-4">
            <p className="font-semibold text-sm text-gray-800 mb-1">Step {step.stepNumber}: {step.title}</p>
            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
            {step.banks && <div className="flex flex-wrap gap-1">{step.banks.map(b => <span key={b} className="badge bg-blue-50 text-blue-700">{b}</span>)}</div>}
            {step.tips && <ul className="mt-2 text-xs text-primary space-y-0.5">{step.tips.map(t => <li key={t}>→ {t}</li>)}</ul>}
          </div>
        ))}
      </div>
    </div>
  );
}

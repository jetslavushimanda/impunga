import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Briefcase, ChevronRight, CheckCircle2, Lightbulb, Sparkles, ArrowRight, Trash2, Target, FileText, Presentation, Share2, Calculator, Building2, FolderOpen, X, Handshake, DollarSign } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';
import useAuthStore from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { ModuleCard } from './EngineView';
import { SectionHeader } from '../components/shared/SectionHeader';

const STARTUP_TOOLS = [
  {
    path: '/name-generator',
    icon: Sparkles,
    name: 'Name Generator',
    desc: 'Generate catchy, brandable business names tailored for Zambia.',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'AI Brand Engine'
  },
  {
    path: '/swot-analysis',
    icon: Target,
    name: 'SWOT Analysis',
    desc: 'Assess your strengths, weaknesses, opportunities, and threats.',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    badge: 'Strategy'
  },
  {
    path: '/business-plan',
    icon: FileText,
    name: 'Business Plan',
    desc: 'Generate a structured business plan outline and strategic roadmap.',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    badge: 'Roadmap'
  },
  {
    path: '/registration-guide',
    icon: Building2,
    name: 'PACRA Setup Guide',
    desc: 'Step-by-step instructions for formalising your business in Zambia.',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    badge: 'Compliance'
  },
  {
    path: '/pitch-deck',
    icon: Presentation,
    name: 'Pitch Deck Generator',
    desc: 'Structure a compelling presentation for potential investors or partners.',
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-600',
    badge: 'Investor Ready'
  },
  {
    path: '/pricing-calculator',
    icon: Calculator,
    name: 'Pricing Calculator',
    desc: 'Determine unit economics, cost structures, and optimal pricing.',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'Financials ZMW'
  }
];

// Dark system startup module card
function StartupModuleCard({ path, onClick, icon: Icon, name, desc, bg, text, badge }) {
  // Map bg/text classes to dark colour tokens
  const colourMap = {
    'text-blue-600':    ['var(--c-business)',   'rgba(79,142,247,0.15)'],
    'text-indigo-600':  ['#818CF8',             'rgba(99,102,241,0.15)'],
    'text-cyan-600':    ['var(--c-ai)',          'rgba(34,211,238,0.15)'],
    'text-emerald-600': ['var(--success)',       'rgba(16,185,129,0.15)'],
    'text-amber-600':   ['var(--c-market)',      'rgba(245,158,11,0.15)'],
    'text-fuchsia-600': ['#E879F9',             'rgba(232,121,249,0.15)'],
    'text-yellow-600':  ['var(--gold-bright)',   'var(--gold-glow)'],
    'text-purple-600':  ['var(--c-skills)',      'rgba(155,114,245,0.15)'],
  };

  const [iconColour, iconBg] = colourMap[text] || ['var(--text-secondary)', 'var(--bg-overlay)'];
  const isFolderBadge = badge === 'Folder';

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '14px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    textDecoration: 'none',
    textAlign: 'left',
    width: '100%',
    height: '100%',
    fontFamily: "'Inter', sans-serif",
  };

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: '22px', height: '22px', color: iconColour }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600, fontSize: '15px',
              color: 'var(--text-primary)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{name}</h2>
            {badge && (
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: '6px', flexShrink: 0,
                background: isFolderBadge ? 'var(--gold-glow)' : iconBg,
                border: `1px solid ${isFolderBadge ? 'var(--gold-border)' : iconColour + '44'}`,
                color: isFolderBadge ? 'var(--gold-bright)' : iconColour,
              }}>{badge}</span>
            )}
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px', color: 'var(--text-secondary)',
            margin: 0, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{desc}</p>
        </div>

        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
        </div>
      </div>
    </>
  );

  const handleHoverIn = (e) => {
    e.currentTarget.style.background = 'var(--bg-elevated)';
    e.currentTarget.style.borderColor = 'var(--border-default)';
  };
  const handleHoverOut = (e) => {
    e.currentTarget.style.background = 'var(--bg-surface)';
    e.currentTarget.style.borderColor = 'var(--border-subtle)';
  };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={cardStyle}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={path}
      style={cardStyle}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      {content}
    </Link>
  );
}

export default function BusinessHubView() {
  const { userProfile } = useAuthStore();
  const { updateProfile } = useAuth();
  const { getUserDocuments, deleteDocument } = useFirestore();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'paths';

  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [showSavedBlueprints, setShowSavedBlueprints] = useState(false);

  useEffect(() => {
    if (view === 'ideation') {
      loadSavedIdeas();
    }
  }, [view]);

  async function loadSavedIdeas() {
    setLoadingIdeas(true);
    try {
      const ideas = await getUserDocuments('businessIdeas');
      setSavedIdeas(ideas.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Failed to load saved ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function handleDeleteIdea(id, e) {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this saved blueprint?')) {
      try {
        await deleteDocument('businessIdeas', id);
        loadSavedIdeas();
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleReopenIdea(idea) {
    const wd = idea.wizardData || {
      businessType: 'other',
      problem: idea.ideaText || '',
      solution: '',
      budget: 'Under K5,000',
      location: 'Lusaka',
      extraInfo: ''
    };

    const compiledIdeaText = "Business Type: " + wd.businessType + "\nProblem: " + wd.problem + "\nSolution: " + wd.solution + "\nBudget: " + wd.budget + "\nLocation: " + wd.location + (wd.extraInfo ? "\nExtra: " + wd.extraInfo : "");

    localStorage.setItem('impunga_idea_pipeline', JSON.stringify({
      ideaText: compiledIdeaText,
      aiAnalysis: JSON.stringify(idea.result || {}, null, 2),
      viabilityScore: idea.score || 0,
      location: wd.location,
      budget: wd.budget,
      businessType: wd.businessType,
      timestamp: Date.now(),
      savedResult: idea.result || {},
      savedWizardData: wd
    }));
    navigate('/idea-validator');
  }

  const setView = (v) => {
    if (v === 'paths') {
      setSearchParams({});
    } else {
      setSearchParams({ view: v });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    sector: '',
    isRegistered: 'no'
  });

  const businessEngine = ENGINE_MODULES.business;

  function handlePathBClick() {
    if (userProfile?.businessProfile) {
      setView('operations');
    } else {
      setView('registration');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ businessProfile: formData });
      setView('operations');
    } catch (error) {
      console.error('Failed to register business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const backLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    marginBottom: '20px',
    transition: 'color 0.15s ease',
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '96px' }}>
      <Link
        to="/dashboard"
        onClick={(e) => {
          if (view !== 'paths') {
            e.preventDefault();
            setView('paths');
          }
        }}
        style={backLinkStyle}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
        {view === 'paths' ? 'Back to Home' : 'Back to Business Hub'}
      </Link>

      {/* ─── PATH SELECTION ─── */}
      {view === 'paths' && (
        <div>
          <SectionHeader
            title="Business Hub"
            description="Choose your path. Whether you are just starting out with an idea or managing an existing operation, we have the tools for you."
            icon={Building2}
            colour="var(--c-business)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Path A — Start a Business */}
            <button
              onClick={() => setView('ideation')}
              style={{
                textAlign: 'left',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderLeft: '3px solid var(--c-business)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'}
              onMouseLeave={e => {
                e.currentTarget.style.borderTopColor = 'var(--border-default)';
                e.currentTarget.style.borderRightColor = 'var(--border-default)';
                e.currentTarget.style.borderBottomColor = 'var(--border-default)';
                e.currentTarget.style.borderLeftColor = 'var(--c-business)';
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(79,142,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Rocket style={{ width: '24px', height: '24px', color: 'var(--c-business)' }} />
              </div>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600, fontSize: '18px',
                color: 'var(--text-primary)', margin: '0 0 6px 0',
              }}>Start a Business</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                I have an idea or need guidance on how to start a business in Zambia.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-business)' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>EXPLORE TOOLS</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </div>
            </button>

            {/* Path B — Manage my Business */}
            <button
              onClick={handlePathBClick}
              style={{
                textAlign: 'left',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderLeft: '3px solid var(--c-finance)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(45,212,191,0.5)'}
              onMouseLeave={e => {
                e.currentTarget.style.borderTopColor = 'var(--border-default)';
                e.currentTarget.style.borderRightColor = 'var(--border-default)';
                e.currentTarget.style.borderBottomColor = 'var(--border-default)';
                e.currentTarget.style.borderLeftColor = 'var(--c-finance)';
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(45,212,191,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Briefcase style={{ width: '24px', height: '24px', color: 'var(--c-finance)' }} />
              </div>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600, fontSize: '18px',
                color: 'var(--text-primary)', margin: '0 0 6px 0',
              }}>Manage my Business</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                I already have a business and need operational tools to run it.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-finance)' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>ENTER WORKSPACE</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ─── IDEATION VIEW ─── */}
      {view === 'ideation' && (
        <div>
          <SectionHeader
            title="Start a Business"
            description="Everything you need to validate your idea, structure a plan, and prepare for launch."
            icon={Rocket}
            colour="var(--c-business)"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '8px',
          }}>
            <StartupModuleCard
              onClick={() => {
                localStorage.removeItem('impunga_idea_pipeline');
                navigate('/idea-validator');
              }}
              icon={Lightbulb}
              name="Validate Idea"
              desc="Run your idea through our AI wizard for a viability score."
              bg="bg-indigo-50"
              text="text-indigo-600"
              badge="AI Wizard"
            />

            <StartupModuleCard
              onClick={() => setShowSavedBlueprints(true)}
              icon={FolderOpen}
              name="Saved Blueprints"
              desc="Access and review your previously validated business ideas."
              bg="bg-yellow-50"
              text="text-yellow-600"
              badge="Folder"
            />

            {STARTUP_TOOLS.map((tool) => (
              <StartupModuleCard key={tool.path} {...tool} />
            ))}
          </div>

          {/* Saved Blueprints Modal */}
          {showSavedBlueprints && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            }}>
              {/* Backdrop */}
              <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={() => setShowSavedBlueprints(false)}
              />

              {/* Modal */}
              <div style={{
                position: 'relative',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                width: '100%', maxWidth: '640px', maxHeight: '85vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {/* Modal Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600, fontSize: '18px',
                    color: 'var(--text-primary)',
                    margin: 0,
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <FolderOpen style={{ width: '22px', height: '22px', color: 'var(--gold-bright)' }} />
                    Saved Blueprints
                  </h3>
                  <button
                    onClick={() => setShowSavedBlueprints(false)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, background: 'var(--bg-base)' }}>
                  {loadingIdeas ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '48px 0', color: 'var(--text-muted)',
                      fontFamily: "'Inter', sans-serif", fontSize: '14px',
                    }}>
                      Loading saved ideas...
                    </div>
                  ) : savedIdeas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 0' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <FolderOpen style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                      </div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                        Folder is empty
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', maxWidth: '240px', margin: '0 auto' }}>
                        Your validated startup ideas and blueprints will show up here.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {savedIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          onClick={() => handleReopenIdea(idea)}
                          style={{
                            cursor: 'pointer',
                            padding: '14px 16px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                            transition: 'background 0.15s ease, border-color 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 700, fontSize: '13px',
                                color: 'var(--text-primary)',
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px',
                              }}>
                                {idea.wizardData?.businessType || 'General Idea'}
                              </span>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
                                {new Date(idea.timestamp || Date.now()).toLocaleDateString('en-GB')}
                              </span>
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '10px', fontWeight: 700,
                                padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase',
                                marginLeft: 'auto',
                                background: idea.verdict === 'PROCEED' ? 'rgba(16,185,129,0.15)' : idea.verdict === 'REFINE' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                                border: `1px solid ${idea.verdict === 'PROCEED' ? 'rgba(16,185,129,0.3)' : idea.verdict === 'REFINE' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                color: idea.verdict === 'PROCEED' ? 'var(--success)' : idea.verdict === 'REFINE' ? 'var(--warning)' : 'var(--danger)',
                              }}>
                                {idea.verdict || 'NEW'}
                              </span>
                              <span style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '12px', fontWeight: 700,
                                color: 'var(--c-business)',
                                background: 'rgba(79,142,247,0.12)',
                                border: '1px solid rgba(79,142,247,0.25)',
                                padding: '2px 8px', borderRadius: '20px',
                              }}>
                                {idea.score}/10
                              </span>
                            </div>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {idea.wizardData?.solution || 'No description provided'}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <button
                              onClick={(e) => handleDeleteIdea(idea.id, e)}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'transparent', border: 'none',
                                color: 'var(--text-muted)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s ease, color 0.15s ease',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── REGISTRATION VIEW ─── */}
      {view === 'registration' && (
        <div style={{ maxWidth: '480px', margin: '0 auto', marginTop: '32px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '20px',
            padding: '40px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Icon */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'rgba(45,212,191,0.15)',
              border: '1px solid rgba(45,212,191,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Briefcase style={{ width: '36px', height: '36px', color: 'var(--c-finance)' }} />
            </div>

            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: '24px',
              color: 'var(--text-primary)',
              textAlign: 'center', margin: '0 0 8px 0',
            }}>Register your Workspace</h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px', color: 'var(--text-secondary)',
              textAlign: 'center', margin: '0 0 32px 0', lineHeight: 1.5,
            }}>
              Before accessing the operational tools, please register your business profile.
            </p>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Business or Project Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px', padding: '12px 14px',
                    fontFamily: "'Inter', sans-serif", fontSize: '14px',
                    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                  }}
                  placeholder="e.g. Kalulu Farms"
                  onFocus={e => { e.target.style.borderColor = 'var(--gold-mid)'; e.target.style.boxShadow = '0 0 0 3px var(--gold-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Primary Sector
                </label>
                <select
                  required
                  value={formData.sector}
                  onChange={e => setFormData({ ...formData, sector: e.target.value })}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px', padding: '12px 14px',
                    fontFamily: "'Inter', sans-serif", fontSize: '14px',
                    color: 'var(--text-primary)', outline: 'none',
                    appearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--gold-mid)'; e.target.style.boxShadow = '0 0 0 3px var(--gold-glow)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="" disabled style={{ background: 'var(--bg-elevated)' }}>Select a sector...</option>
                  <option value="agriculture" style={{ background: 'var(--bg-elevated)' }}>Agriculture &amp; Farming</option>
                  <option value="retail" style={{ background: 'var(--bg-elevated)' }}>Retail &amp; Trade</option>
                  <option value="services" style={{ background: 'var(--bg-elevated)' }}>Professional Services</option>
                  <option value="manufacturing" style={{ background: 'var(--bg-elevated)' }}>Manufacturing</option>
                  <option value="tech" style={{ background: 'var(--bg-elevated)' }}>Technology</option>
                  <option value="other" style={{ background: 'var(--bg-elevated)' }}>Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Is it registered with PACRA?
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[['yes', 'Yes, Registered'], ['no', 'Not Yet']].map(([val, label]) => (
                    <label key={val} style={{ flex: 1, cursor: 'pointer' }}>
                      <input
                        type="radio" name="registered" value={val}
                        checked={formData.isRegistered === val}
                        onChange={e => setFormData({ ...formData, isRegistered: e.target.value })}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        borderRadius: '10px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600, fontSize: '14px',
                        border: formData.isRegistered === val ? '1px solid var(--c-business)' : '1px solid var(--border-default)',
                        background: formData.isRegistered === val ? 'rgba(79,142,247,0.15)' : 'var(--bg-elevated)',
                        color: formData.isRegistered === val ? 'var(--c-business)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}>
                        {label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.businessName || !formData.sector}
                style={{
                  width: '100%',
                  background: 'var(--gold-bright)',
                  color: 'var(--text-inverse)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700, fontSize: '15px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: (isSubmitting || !formData.businessName || !formData.sector) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '8px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = 'var(--gold-mid)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gold-bright)'}
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
                <CheckCircle2 style={{ width: '20px', height: '20px' }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── OPERATIONS VIEW ─── */}
      {view === 'operations' && (
        <div>
          <SectionHeader
            title={userProfile?.businessProfile?.businessName || 'Business Workspace'}
            description="Your operational tools for running and scaling your business."
            icon={Briefcase}
            colour="var(--c-finance)"
            rightAction={
              <button
                onClick={() => setView('registration')}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500, fontSize: '14px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'border-color 0.15s ease, color 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                <CheckCircle2 style={{ width: '14px', height: '14px', color: 'var(--success)' }} /> Platform Verified · Edit
              </button>
            }
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '8px',
          }}>
            {businessEngine.modules.map(mod => (
              <ModuleCard key={mod.path} {...mod} />
            ))}
            <ModuleCard path="/market-directory" icon={Handshake} name="Marketplace" desc="Trade and connect in the verified directory" bg="bg-blue-50" text="text-blue-600" border="border-l-blue-400" />
            <ModuleCard path="/funding-finder" icon={DollarSign} name="Funding Connect" desc="Institutional Gateway for Grants &amp; Loans" bg="bg-green-50" text="text-green-600" border="border-l-green-400" />
          </div>
        </div>
      )}
    </div>
  );
}

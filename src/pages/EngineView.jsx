import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';

import BusinessHubView from './BusinessHubView';
import { SectionHeader } from '../components/shared/SectionHeader';

// Product colour map
const PRODUCT_COLOUR = {
  business: 'var(--c-business)',
  skills:   'var(--c-skills)',
  finance:  'var(--c-finance)',
  connect:  'var(--c-market)',
  gateway:  'var(--c-ai)',
};

const PRODUCT_ICON_BG = {
  business: 'rgba(79, 142, 247, 0.15)',
  skills:   'rgba(155, 114, 245, 0.15)',
  finance:  'rgba(45, 212, 191, 0.15)',
  connect:  'rgba(245, 158, 11, 0.15)',
  gateway:  'rgba(34, 211, 238, 0.15)',
};

// Determine section from module bg or text class
function getIconBg(bg, text) {
  if (!bg && !text) return 'var(--bg-overlay)';
  const map = {
    'bg-blue':   'rgba(79, 142, 247, 0.15)',
    'bg-indigo': 'rgba(99, 102, 241, 0.15)',
    'bg-purple': 'rgba(155, 114, 245, 0.15)',
    'bg-green':  'rgba(45, 212, 191, 0.15)',
    'bg-emerald':'rgba(16, 185, 129, 0.15)',
    'bg-teal':   'rgba(45, 212, 191, 0.15)',
    'bg-cyan':   'rgba(34, 211, 238, 0.15)',
    'bg-amber':  'rgba(245, 158, 11, 0.15)',
    'bg-orange': 'rgba(251, 146, 60, 0.15)',
    'bg-rose':   'rgba(244, 63, 94, 0.15)',
    'bg-fuchsia':'rgba(232, 121, 249, 0.15)',
    'bg-red':    'rgba(239, 68, 68, 0.15)',
  };
  for (const [key, val] of Object.entries(map)) {
    if (bg?.includes(key) || text?.includes(key)) return val;
  }
  return 'var(--bg-overlay)';
}

function getIconColour(text) {
  if (!text) return 'var(--text-secondary)';
  const map = {
    'text-blue':   'var(--c-business)',
    'text-indigo': '#818CF8',
    'text-purple': 'var(--c-skills)',
    'text-green':  'var(--c-finance)',
    'text-emerald':'var(--success)',
    'text-teal':   'var(--c-finance)',
    'text-cyan':   'var(--c-ai)',
    'text-amber':  'var(--c-market)',
    'text-orange': '#FB923C',
    'text-rose':   '#FB7185',
    'text-fuchsia':'#E879F9',
    'text-red':    'var(--danger)',
  };
  for (const [key, val] of Object.entries(map)) {
    if (text?.includes(key)) return val;
  }
  return 'var(--text-secondary)';
}

export function ModuleCard({ path, icon: Icon, name, desc, bg, text, badge, engineId }) {
  const iconBg = getIconBg(bg, text);
  const iconColour = getIconColour(text);

  return (
    <Link
      to={path}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '16px',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        height: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-surface)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        {/* Icon box */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: '22px', height: '22px', color: iconColour }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{name}</h2>
            {badge && (
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                flexShrink: 0,
                background: iconBg,
                border: `1px solid ${iconColour}44`,
                color: iconColour,
              }}>{badge}</span>
            )}
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>{desc}</p>
        </div>

        {/* Arrow */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
        </div>
      </div>
    </Link>
  );
}

export default function EngineView() {
  const { engineId } = useParams();
  const engine = ENGINE_MODULES[engineId];

  if (!engine) {
    return <Navigate to="/dashboard" replace />;
  }

  if (engineId === 'business') {
    return <BusinessHubView />;
  }

  const { icon: EngineIcon, title, description, modules } = engine;
  const colour = PRODUCT_COLOUR[engineId] || 'var(--text-secondary)';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '96px' }}>
      <Link to="/dashboard" style={{
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
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
        Back to Home
      </Link>

      <SectionHeader
        title={title}
        description={description}
        icon={EngineIcon}
        colour={colour}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '8px',
      }}>
        {modules.map(mod => (
          <ModuleCard key={mod.path} {...mod} engineId={engineId} />
        ))}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getGreeting, getFirstName } from '../lib/utils';
import { PageLoader } from '../components/shared/LoadingSpinner';
import { ENGINE_MODULES } from '../data/engineModules';

// Product colour system
const PRODUCT_STYLE = {
  business: {
    colour: 'var(--c-business)',
    iconBg: 'rgba(79, 142, 247, 0.15)',
    accentBar: 'var(--c-business)',
    label: 'BUSINESS HUB',
  },
  skills: {
    colour: 'var(--c-skills)',
    iconBg: 'rgba(155, 114, 245, 0.15)',
    accentBar: 'var(--c-skills)',
    label: 'SKILLS IDENTITY',
  },
  finance: {
    colour: 'var(--c-finance)',
    iconBg: 'rgba(45, 212, 191, 0.15)',
    accentBar: 'var(--c-finance)',
    label: 'FINANCE & FUNDING',
  },
  connect: {
    colour: 'var(--c-market)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    accentBar: 'var(--c-market)',
    label: 'MARKETPLACE',
  },
  gateway: {
    colour: 'var(--c-ai)',
    iconBg: 'rgba(34, 211, 238, 0.15)',
    accentBar: 'var(--c-ai)',
    label: 'AI ASSISTANT',
  },
};

const ACTION_LABELS = {
  business: 'ENTER HUB',
  skills:   'EXPLORE SKILLS',
  finance:  'FIND FUNDING',
  connect:  'OPEN MARKET',
  gateway:  'TALK TO AI',
};

export default function Dashboard() {
  const { userProfile, loading } = useAuthStore();

  if (loading) return <PageLoader />;

  const firstName = getFirstName(userProfile?.fullName || '');
  const engines = Object.values(ENGINE_MODULES);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '96px' }}>

      {/* ─── Greeting ─── */}
      <div style={{ padding: '24px 4px 20px' }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(26px, 5vw, 32px)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {getGreeting()}{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginTop: '4px',
        }}>
          Zambia's Economic Intelligence Platform. Select an engine to begin.
        </p>

        {/* Stat Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <span style={{
            background: 'var(--gold-glow)',
            border: '1px solid var(--gold-border)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--gold-bright)',
          }}>● Active Member</span>

          <span style={{
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.25)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--c-finance)',
          }}>🇿🇲 Zambia</span>

          <span style={{
            background: 'rgba(79, 142, 247, 0.1)',
            border: '1px solid rgba(79, 142, 247, 0.25)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--c-business)',
          }}>✓ Verified</span>
        </div>

        {/* Gold divider */}
        <div style={{
          margin: '20px 0',
          height: '1px',
          background: 'linear-gradient(90deg, var(--gold-mid) 0%, rgba(212,172,13,0.1) 60%, transparent 100%)',
        }} />

        {/* Section label */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>Select Your Journey</p>
      </div>

      {/* ─── Engine Cards ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px' }}>
        {engines.map((engine) => {
          const { id, title, description, icon: Icon } = engine;
          const ps = PRODUCT_STYLE[id] || PRODUCT_STYLE.business;
          const to = id === 'gateway' ? '/ai-advisor' : `/engine/${id}`;

          return (
            <Link
              key={id}
              to={to}
              style={{
                display: 'block',
                position: 'relative',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${ps.accentBar}`,
                borderRadius: '16px',
                padding: '20px',
                overflow: 'hidden',
                textDecoration: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${ps.colour}66`}
              onMouseLeave={e => {
                e.currentTarget.style.borderTopColor = 'var(--border-subtle)';
                e.currentTarget.style.borderRightColor = 'var(--border-subtle)';
                e.currentTarget.style.borderBottomColor = 'var(--border-subtle)';
                e.currentTarget.style.borderLeftColor = ps.accentBar;
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: ps.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Icon style={{ width: '24px', height: '24px', color: ps.colour }} />
              </div>

              {/* Label above title */}
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: ps.colour,
                margin: '0 0 4px 0',
              }}>{ps.label}</p>

              {/* Title */}
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '18px',
                color: 'var(--text-primary)',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em',
              }}>{title}</h2>

              {/* Description */}
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: '0 0 14px 0',
              }}>{description}</p>

              {/* Action row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: ps.colour,
              }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '13px',
                }}>{ACTION_LABELS[id] || 'EXPLORE'}</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

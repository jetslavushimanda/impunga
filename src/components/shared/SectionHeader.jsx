import React from 'react';

const PRODUCT_GRADIENTS = {
  'var(--c-business)': 'var(--c-business)',
};

export function SectionHeader({ title, description, icon: Icon, gradient, colour, rightAction }) {
  const accentColour = colour || 'var(--gold-bright)';

  return (
    <div style={{
      paddingBottom: '20px',
      marginBottom: '20px',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Back navigation handled by parent page — header starts with icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
        {Icon && (
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: `${accentColour}22`,
            border: `1px solid ${accentColour}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon style={{ width: '26px', height: '26px', color: accentColour }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(22px, 4vw, 26px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}>{title}</h1>
        </div>
        {rightAction && (
          <div style={{ flexShrink: 0 }}>{rightAction}</div>
        )}
      </div>

      {description && (
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: '6px 0 0 0',
          maxWidth: '480px',
        }}>{description}</p>
      )}

      {/* Gold-tinted rule below header */}
      <div style={{
        marginTop: '20px',
        height: '1px',
        background: `linear-gradient(90deg, ${accentColour}44 0%, transparent 70%)`,
      }} />
    </div>
  );
}

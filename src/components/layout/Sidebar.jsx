import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Shield, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { ENGINE_MODULES } from '../../data/engineModules';

// Product colour map for sidebar icons
const PRODUCT_COLOURS = {
  business: 'var(--c-business)',
  skills:   'var(--c-skills)',
  finance:  'var(--c-finance)',
  connect:  'var(--c-market)',
  gateway:  'var(--c-ai)',
};

const PRODUCT_BG = {
  business: 'rgba(79, 142, 247, 0.15)',
  skills:   'rgba(155, 114, 245, 0.15)',
  finance:  'rgba(45, 212, 191, 0.15)',
  connect:  'rgba(245, 158, 11, 0.15)',
  gateway:  'rgba(34, 211, 238, 0.15)',
};

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { selectedPath, setSelectedPath, userProfile } = useAuthStore();
  const engines = Object.values(ENGINE_MODULES);

  const sidebarItemBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 12px',
    height: '44px',
    borderRadius: '10px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  };

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      <aside style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        width: '280px',
        flexShrink: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        // Mobile: slide in/out
        position: isOpen ? 'fixed' : undefined,
        top: 0,
        left: 0,
        height: isOpen ? '100vh' : '100%',
        transform: isOpen ? 'translateX(0)' : undefined,
        boxShadow: isOpen ? '0 0 40px rgba(0,0,0,0.6)' : 'none',
      }} className={`
        ${isOpen ? 'fixed top-0 left-0 h-screen translate-x-0 shadow-2xl' : '-translate-x-full'}
        lg:static lg:translate-x-0 lg:h-full lg:shadow-none
        transform transition-transform duration-300
        hidden lg:flex lg:flex-col
        ${isOpen ? '!flex' : ''}
      `}>
        {/* Header — mobile only */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '56px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }} className="lg:hidden">
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--gold-bright)',
            letterSpacing: '-0.01em',
          }}>IMPUNGA</span>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>

          {/* Home */}
          <NavLink
            to="/dashboard"
            onClick={onClose}
            style={({ isActive }) => ({
              ...sidebarItemBase,
              display: 'flex',
              background: isActive ? 'var(--gold-glow)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--gold-bright)' : '3px solid transparent',
              borderRadius: isActive ? '0 10px 10px 0' : '10px',
              color: isActive ? 'var(--gold-bright)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              marginBottom: '4px',
              paddingLeft: isActive ? '9px' : '12px',
            })}
          >
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              background: 'rgba(79, 142, 247, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <LayoutDashboard style={{ width: '16px', height: '16px', color: 'var(--c-business)' }} />
            </div>
            <span>Home</span>
          </NavLink>

          {/* Platform Modules section label */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '24px',
            marginBottom: '8px',
            paddingLeft: '12px',
          }}>Platform Modules</p>

          {engines.map(({ id, title, icon: Icon }) => (
            <NavLink
              key={id}
              to={id === 'gateway' ? '/ai-advisor' : `/engine/${id}`}
              onClick={onClose}
              style={({ isActive }) => ({
                ...sidebarItemBase,
                display: 'flex',
                background: isActive ? 'var(--gold-glow)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold-bright)' : '3px solid transparent',
                borderRadius: isActive ? '0 10px 10px 0' : '10px',
                color: isActive ? 'var(--gold-bright)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                marginBottom: '2px',
                paddingLeft: isActive ? '9px' : '12px',
              })}
            >
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: PRODUCT_BG[id] || 'var(--bg-overlay)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '16px', height: '16px', color: PRODUCT_COLOURS[id] || 'var(--text-secondary)' }} />
              </div>
              <span className="truncate">
                {title.split('—')[1] ? title.split('—')[1].trim() : title}
              </span>
            </NavLink>
          ))}

          {/* Account section label */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '24px',
            marginBottom: '8px',
            paddingLeft: '12px',
          }}>Account</p>

          <NavLink
            to="/profile"
            onClick={onClose}
            style={({ isActive }) => ({
              ...sidebarItemBase,
              display: 'flex',
              background: isActive ? 'var(--gold-glow)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--gold-bright)' : '3px solid transparent',
              borderRadius: isActive ? '0 10px 10px 0' : '10px',
              color: isActive ? 'var(--gold-bright)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              marginBottom: '2px',
              paddingLeft: isActive ? '9px' : '12px',
            })}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-overlay)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <User style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
            </div>
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/data-privacy"
            onClick={onClose}
            style={({ isActive }) => ({
              ...sidebarItemBase,
              display: 'flex',
              background: isActive ? 'var(--gold-glow)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--gold-bright)' : '3px solid transparent',
              borderRadius: isActive ? '0 10px 10px 0' : '10px',
              color: isActive ? 'var(--gold-bright)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              paddingLeft: isActive ? '9px' : '12px',
            })}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(45, 212, 191, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Shield style={{ width: '16px', height: '16px', color: 'var(--c-finance)' }} />
            </div>
            <span>Data Privacy</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

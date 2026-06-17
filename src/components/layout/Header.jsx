import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Menu, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { getGreeting, getFirstName, getInitials } from '../../lib/utils';
import SemanticSearch from '../shared/SemanticSearch';

export default function Header({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { logout } = useAuth();
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const firstName = getFirstName(userProfile?.fullName || '');
  const initials = getInitials(userProfile?.fullName || '?');

  return (
    <>
      <header style={{
        background: 'rgba(15, 22, 35, 0.92)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        paddingTop: 'env(safe-area-inset-top)',
      }} className="px-4 flex items-center justify-between h-14 lg:h-[60px]">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: 'var(--gold-bright)',
              letterSpacing: '-0.01em',
            }}>IMPUNGA</span>
            <span className="hidden sm:block" style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}>Start. Match. Build Zambia.</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:block" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </span>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              minHeight: '44px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            aria-label="Smart search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:block">Search...</span>
          </button>

          {/* Notifications */}
          <button
            style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: 'color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gold-glow)',
                border: '1px solid var(--gold-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--gold-bright)',
                cursor: 'pointer',
              }}>
                {initials}
              </div>
              <ChevronDown className="w-4 h-4 hidden sm:block" style={{ color: 'var(--text-muted)' }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '192px',
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                zIndex: 40,
                overflow: 'hidden',
              }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: 'var(--danger)',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Semantic Search Modal */}
      <SemanticSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

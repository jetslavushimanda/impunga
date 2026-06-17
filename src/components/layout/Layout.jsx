import { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Handshake, Bot, User } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import OfflineBanner from '../shared/OfflineBanner';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../shared/LoadingSpinner';

const BOTTOM_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/engine/connect', icon: Handshake, label: 'Market' },
  { path: '/ai-advisor', icon: Bot, label: 'AI' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuthStore();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <OfflineBanner />
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex h-[calc(100vh-57px)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6"
          style={{ background: 'var(--bg-base)' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30" style={{
        background: 'rgba(8, 13, 24, 0.96)',
        borderTop: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '64px',
      }}>
        <div className="grid grid-cols-4 h-full">
          {BOTTOM_NAV.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-0.5 relative"
              style={({ isActive }) => ({
                color: isActive ? 'var(--gold-bright)' : 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Gold indicator bar above active icon */}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '2px',
                      background: 'var(--gold-bright)',
                      borderRadius: '2px',
                    }} />
                  )}
                  <div style={{
                    width: '40px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background: isActive ? 'var(--gold-glow)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isActive ? 600 : 400,
                  }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

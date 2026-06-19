import { useState } from 'react';
import { Outlet, Navigate, NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Handshake, Bot, TrendingUp, GraduationCap, DollarSign } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import OfflineBanner from '../shared/OfflineBanner';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../shared/LoadingSpinner';

const BOTTOM_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/engine/business', icon: TrendingUp, label: 'Business' },
  { path: '/engine/skills', icon: GraduationCap, label: 'Career' },
  { path: '/engine/finance', icon: DollarSign, label: 'Funding' },
  { path: '/engine/connect', icon: Handshake, label: 'Community' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuthStore();
  const { pathname } = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const isAIAdvisor = pathname === '/ai-advisor';

  return (
    <div className="min-h-screen bg-surface-light relative">
      <OfflineBanner />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex h-[calc(100vh-57px)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Button */}
      {!isAIAdvisor && (
        <Link
          to="/ai-advisor"
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 z-40 border border-white/10"
          aria-label="Ask AI Assistant"
        >
          <Bot className="w-6 h-6 text-primary-light" />
        </Link>
      )}

      {/* Bottom navigation — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-pb">
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_NAV.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-surface-blue text-primary' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

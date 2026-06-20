import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Handshake, Bot, TrendingUp, GraduationCap, DollarSign } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import AIChatPanel from './AIChatPanel';
import OfflineBanner from '../shared/OfflineBanner';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../shared/LoadingSpinner';
// Ensure theme is applied on every load
import '../../store/themeStore';

const BOTTOM_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/engine/business', icon: TrendingUp, label: 'Business' },
  { path: '/engine/skills', icon: GraduationCap, label: 'Career' },
  { path: '/engine/finance', icon: DollarSign, label: 'Funding' },
  { path: '/engine/connect', icon: Handshake, label: 'Community' },
];

const BUSINESS_PATHS = new Set(['/business-ledger', '/invoice-generator', '/pricing-calculator', '/social-media', '/kpi-tracker', '/savings-module']);
const SKILLS_PATHS = new Set(['/skill-profile-builder', '/career-matches', '/zambian-jobs', '/cv-generator', '/cover-letter-generator', '/interview-prep', '/skill-gap-closer']);
const FINANCE_PATHS = new Set(['/grants-portal', '/loans-portal', '/investment-matchmaker']);

function trackRoute(pathname) {
  if (pathname === '/dashboard') return;
  try { localStorage.setItem('impunga_last_route', JSON.stringify({ path: pathname, time: Date.now() })); } catch {}
  const buckets = [
    { key: 'impunga_visited_business', set: BUSINESS_PATHS },
    { key: 'impunga_visited_skills', set: SKILLS_PATHS },
    { key: 'impunga_visited_finance', set: FINANCE_PATHS },
  ];
  for (const { key, set } of buckets) {
    if (!set.has(pathname)) continue;
    try {
      const existing = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      existing.add(pathname);
      localStorage.setItem(key, JSON.stringify([...existing]));
    } catch {}
    break;
  }
}

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuthStore();
  const { pathname } = useLocation();

  useEffect(() => { trackRoute(pathname); }, [pathname]);
  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const isAIAdvisor = pathname === '/ai-advisor';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f1117] relative">
      <ScrollToTop />
      <OfflineBanner />
      <Header onMenuToggle={() => setSidebarOpen(o => !o)} />

      <div className="flex h-[calc(100vh-57px)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-24 lg:pb-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Floating AI button */}
      {!isAIAdvisor && (
        <>
          {/* Mobile */}
          <Link
            to="/ai-advisor"
            className="lg:hidden fixed bottom-[80px] right-4 w-12 h-12 bg-primary rounded-full shadow-xl shadow-primary/30 flex items-center justify-center z-40 hover:bg-primary-dark hover:scale-[1.06] active:scale-[0.95] transition-all duration-200"
            aria-label="AI Assistant"
          >
            <Bot className="w-5 h-5 text-white" />
          </Link>

          {/* Desktop */}
          <button
            onClick={() => setChatOpen(p => !p)}
            className="hidden lg:flex fixed bottom-5 right-5 w-14 h-14 bg-primary rounded-full shadow-xl shadow-primary/30 items-center justify-center z-40 hover:bg-primary-dark hover:scale-[1.06] active:scale-[0.95] transition-all duration-200"
            aria-label="AI Assistant"
          >
            <Bot className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {chatOpen && (
        <>
          <div className="hidden lg:block fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={() => setChatOpen(false)} />
          <AIChatPanel onClose={() => setChatOpen(false)} />
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e2128] border-t border-gray-100 dark:border-[#2d3139] z-30 safe-area-pb">
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_NAV.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-primary dark:text-primary-light' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

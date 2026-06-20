import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, GraduationCap, DollarSign, Handshake, Sprout, Bot, X } from 'lucide-react';

const NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/engine/business', icon: TrendingUp, label: 'Business Space' },
  { path: '/engine/skills', icon: GraduationCap, label: 'Career Connect' },
  { path: '/engine/finance', icon: DollarSign, label: 'Finance & Funding' },
  { path: '/engine/connect', icon: Handshake, label: 'Community' },
  { path: '/ai-advisor', icon: Bot, label: 'AI Assistant' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        style={{ transition: 'width 0.3s ease, transform 0.3s ease' }}
        className={[
          /* Positioning */
          'fixed lg:static inset-y-0 left-0 z-50 lg:z-auto',
          /* Layout */
          'flex flex-col h-full shrink-0 overflow-hidden',
          /* Background */
          'bg-white dark:bg-[#1e2128]',
          /* Mobile: slide in/out from left */
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          /* Mobile width always 280px; Desktop width depends on open state */
          'w-[280px]',
          isOpen ? 'lg:w-[220px]' : 'lg:w-16',
        ].join(' ')}
      >
        {/* ── Mobile header: logo + X close ── */}
        <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-[#2d3139] shrink-0">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
            <span className="font-black text-primary dark:text-[#e8eaed] text-lg tracking-tight">IMPUNGA</span>
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#252830] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2d3139] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Desktop logo: icon-only when collapsed, full when expanded ── */}
        <div className="hidden lg:flex items-center px-3.5 pt-6 pb-5 select-none shrink-0 overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
            <span
              style={{ transition: 'opacity 0.2s ease, max-width 0.3s ease' }}
              className={`font-black text-primary dark:text-[#e8eaed] text-lg tracking-tight whitespace-nowrap overflow-hidden ${
                isOpen ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0'
              }`}
            >
              IMPUNGA
            </span>
          </Link>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden pt-2 lg:pt-0">
          {NAV.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              title={!isOpen ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-2xl transition-colors duration-150 group overflow-hidden
                 ${isOpen ? 'px-3' : 'lg:justify-center lg:px-3 px-3'}
                 ${isActive
                   ? 'bg-primary/10 dark:bg-primary/20'
                   : 'hover:bg-gray-100 dark:hover:bg-[#252830]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'bg-gray-100 dark:bg-[#252830] text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-[#2d3139]'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  {/* Label: always visible on mobile, shown/hidden on desktop via transition */}
                  <span
                    style={{ transition: 'opacity 0.2s ease, max-width 0.3s ease' }}
                    className={`text-sm whitespace-nowrap overflow-hidden ${
                      isActive
                        ? 'font-bold text-primary dark:text-[#e8eaed]'
                        : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                    } ${isOpen ? 'opacity-100 max-w-[160px]' : 'lg:opacity-0 lg:max-w-0'}`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div
          style={{ transition: 'opacity 0.2s ease' }}
          className={`px-4 py-4 shrink-0 overflow-hidden ${isOpen ? 'opacity-100' : 'lg:opacity-0'}`}
        >
          <p className="text-[10px] text-gray-300 dark:text-[#2d3139] font-medium whitespace-nowrap">IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

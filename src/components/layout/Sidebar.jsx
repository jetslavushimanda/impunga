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

function NavItems({ expanded, onNav }) {
  return (
    <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
      {NAV.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNav}
          title={!expanded ? label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 py-2.5 rounded-2xl transition-colors duration-150 group
             ${expanded ? 'px-3' : 'px-2 justify-center'}
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
              {expanded && (
                <span className={`text-sm whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-primary dark:text-[#e8eaed]'
                    : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                }`}>
                  {label}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* ══════════════════════════════════════
          MOBILE — fixed overlay drawer
      ══════════════════════════════════════ */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-white dark:bg-[#1e2128] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile logo + close */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-[#2d3139] shrink-0">
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
        <NavItems expanded={true} onNav={onClose} />
      </div>

      {/* ══════════════════════════════════════
          DESKTOP — static sidebar in flex flow
          Collapsed = icon strip, Expanded = icon + label
      ══════════════════════════════════════ */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-white dark:bg-[#1e2128] shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[220px]' : 'w-[72px]'
        }`}
      >
        {/* Desktop logo */}
        <div className={`flex items-center gap-2.5 pt-6 pb-5 select-none shrink-0 overflow-hidden ${isOpen ? 'px-4' : 'px-[18px]'}`}>
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
            {isOpen && (
              <span className="font-black text-primary dark:text-[#e8eaed] text-lg tracking-tight whitespace-nowrap">
                IMPUNGA
              </span>
            )}
          </Link>
        </div>

        <NavItems expanded={isOpen} onNav={() => {}} />

      </aside>
    </>
  );
}

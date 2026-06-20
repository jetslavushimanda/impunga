import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, GraduationCap, DollarSign, Handshake, Sprout, Bot } from 'lucide-react';

const NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/engine/business', icon: TrendingUp, label: 'Business' },
  { path: '/engine/skills', icon: GraduationCap, label: 'Career' },
  { path: '/engine/finance', icon: DollarSign, label: 'Funding' },
  { path: '/engine/connect', icon: Handshake, label: 'Community' },
  { path: '/ai-advisor', icon: Bot, label: 'AI Assistant' },
];

export default function Sidebar() {
  return (
    /* Desktop only — always visible, never toggled, hidden on mobile */
    <aside className="hidden lg:flex flex-col w-55 shrink-0 bg-white dark:bg-[#1e2128] h-full border-r-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5 select-none">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
          <span className="font-black text-primary dark:text-[#e8eaed] text-lg tracking-tight">IMPUNGA</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group ${
                isActive
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : 'hover:bg-gray-100 dark:hover:bg-[#252830]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'bg-gray-100 dark:bg-[#252830] text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-[#2d3139]'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={`text-sm transition-all ${
                  isActive
                    ? 'font-bold text-primary dark:text-[#e8eaed]'
                    : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                }`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 shrink-0">
        <p className="text-[10px] text-gray-300 dark:text-[#2d3139] font-medium">IMPUNGA © JETS 2026 · Zambia</p>
      </div>
    </aside>
  );
}

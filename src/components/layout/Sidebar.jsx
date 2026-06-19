import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, GraduationCap, DollarSign, Handshake, X, Sprout } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/engine/business', icon: TrendingUp, label: 'Business' },
  { path: '/engine/skills', icon: GraduationCap, label: 'Career' },
  { path: '/engine/finance', icon: DollarSign, label: 'Funding' },
  { path: '/engine/connect', icon: Handshake, label: 'Community' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-[280px] bg-surface-light border-r border-gray-200/50 z-40
        flex flex-col
        transform transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1)
        lg:static lg:translate-x-0 lg:z-auto lg:h-full lg:bg-surface-light
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Header with Logo — visible on both desktop & mobile */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200/50 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 select-none pointer-events-auto" onClick={onClose}>
            <Sprout className="w-5.5 h-5.5 text-primary-light logo-sprout shrink-0" />
            <span className="font-black text-primary text-xl tracking-tight">IMPUNGA</span>
          </Link>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden" aria-label="Close sidebar">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {SIDEBAR_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'bg-surface-blue text-primary font-bold shadow-sm border border-blue-200/50' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 font-medium border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[15px]">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 p-4 border-t border-gray-100 flex flex-col gap-2 bg-white/40">
          <p className="text-[10px] text-gray-400 text-center font-medium">IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

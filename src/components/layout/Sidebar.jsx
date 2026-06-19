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
        fixed top-0 left-0 h-screen bg-white border-r border-gray-200/50 z-40
        flex flex-col w-[280px]
        transform transition-all duration-300 ease-in-out
        lg:static lg:z-auto lg:h-full
        ${isOpen
          ? 'translate-x-0 shadow-2xl lg:w-[280px]'
          : '-translate-x-full lg:translate-x-0 lg:w-[72px]'}
      `}>
        {/* Logo */}
        <div className={`flex items-center border-b border-gray-200/50 shrink-0 transition-all duration-300 ${isOpen ? 'justify-between p-5' : 'justify-center p-4'}`}>
          <Link to="/dashboard" className="flex items-center gap-2 select-none" onClick={onClose}>
            <Sprout className="w-5.5 h-5.5 text-accent-gold logo-sprout shrink-0" />
            {isOpen && <span className="font-black text-primary text-xl tracking-tight">IMPUNGA</span>}
          </Link>
          {isOpen && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden" aria-label="Close sidebar">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-2">
          {SIDEBAR_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              title={!isOpen ? label : undefined}
              className={({ isActive }) => `
                flex items-center rounded-2xl transition-all duration-200
                ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center py-3 px-2'}
                ${isActive
                  ? 'bg-surface-blue text-primary font-bold shadow-sm border border-blue-200/50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 font-medium border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isOpen && <span className="text-[15px]">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {isOpen && (
          <div className="shrink-0 p-4 border-t border-gray-100 bg-white/40">
            <p className="text-[10px] text-gray-400 text-center font-medium">IMPUNGA © JETS 2026 · Zambia</p>
          </div>
        )}
      </aside>
    </>
  );
}

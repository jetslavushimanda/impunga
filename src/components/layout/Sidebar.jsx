import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Shield, X, Sprout } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { ENGINE_MODULES } from '../../data/engineModules';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { selectedPath, setSelectedPath, userProfile } = useAuthStore();
  const engines = Object.values(ENGINE_MODULES);

  const activeBgMap = {
    business: 'bg-blue-600/10',
    skills: 'bg-purple-600/10',
    finance: 'bg-emerald-500/10',
    connect: 'bg-orange-500/10',
    gateway: 'bg-slate-800/10',
  };

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
        {/* Header — only on mobile */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-accent-gold logo-sprout" />
            <span className="font-bold text-primary text-lg">IMPUNGA</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          
          {/* Group 1: Home */}
          <div className="px-1.5">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) => {
                const active = isActive || selectedPath === '/dashboard';
                return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active ? 'bg-blue-500/10 text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-50/50 font-medium'
                }`;
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="text-[15px]">Home</span>
            </NavLink>
          </div>

          {/* Group 2: Platform Modules */}
          <div>
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Platform Modules
            </p>
            <div className="bg-white/80 rounded-2xl p-1.5 border border-gray-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
              {engines.map(({ id, title, icon: Icon, bg }) => (
                <NavLink 
                  key={id} 
                  to={id === 'gateway' ? '/ai-advisor' : `/engine/${id}`} 
                  onClick={onClose} 
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive ? `${activeBgMap[id]} text-gray-900 font-bold` : 'text-gray-500 hover:bg-gray-50/50 font-medium'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] truncate">
                    {title.split('—')[1] ? title.split('—')[1].trim() : title}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Group 3: Settings */}
          <div>
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </p>
            <div className="bg-white/80 rounded-2xl p-1.5 border border-gray-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-gray-400/10 text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-50/50 font-medium'}
                `}
              >
                <div className="w-8 h-8 rounded-xl bg-gray-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[15px]">My Profile</span>
              </NavLink>
              <NavLink
                to="/data-privacy"
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-green-500/10 text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-50/50 font-medium'}
                `}
              >
                <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[15px]">Data Privacy</span>
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="shrink-0 p-3 border-t border-gray-100 flex flex-col gap-2">
          <p className="text-[10px] text-gray-400 text-center mt-2">IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

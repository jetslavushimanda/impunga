import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Shield, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { ENGINE_MODULES } from '../../data/engineModules';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { selectedPath, setSelectedPath, userProfile } = useAuthStore();
  const engines = Object.values(ENGINE_MODULES);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-[280px] bg-white/70 backdrop-blur-2xl border-r border-gray-200/50 z-40
        flex flex-col
        transform transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1)
        lg:static lg:translate-x-0 lg:z-auto lg:h-full lg:bg-gray-50/50 lg:backdrop-blur-none
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Header — only on mobile */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden shrink-0">
          <span className="font-bold text-primary text-lg">IMPUNGA</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          
          {/* Group 1: Home */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className={`font-medium text-[15px] ${selectedPath === '/dashboard' ? 'text-blue-600' : 'text-gray-800'}`}>Home</span>
            </NavLink>
          </div>

          {/* Group 2: Platform Modules */}
          <div>
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Platform Modules
            </p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {engines.map(({ id, title, icon: Icon, bg }, index) => (
                <NavLink 
                  key={id} 
                  to={id === 'gateway' ? '/ai-advisor' : `/engine/${id}`} 
                  onClick={onClose} 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 transition-colors ${index !== engines.length - 1 ? 'border-b border-gray-50' : ''} ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-[15px] text-gray-800 truncate">
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
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-xl bg-gray-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium text-[15px] text-gray-800">My Profile</span>
              </NavLink>
              <NavLink
                to="/data-privacy"
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-medium text-[15px] text-gray-800">Data Privacy</span>
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

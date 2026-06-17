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
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto lg:h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header — only on mobile */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden shrink-0">
          <span className="font-bold text-primary text-lg">IMPUNGA</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable nav — takes all remaining space */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Home</span>
            </NavLink>
          </div>

          <div className="mt-6">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Platform Modules
            </p>
            <div className="space-y-1">
              {engines.map(({ id, title, icon: Icon }) => (
                <NavLink 
                  key={id} 
                  to={id === 'gateway' ? '/ai-advisor' : `/engine/${id}`} 
                  onClick={onClose} 
                  className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
                >
                  <Icon className="w-5 h-5 shrink-0" /> 
                  <span className="truncate">{title.split('—')[1] ? title.split('—')[1].trim() : title}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100 mt-6">
            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <User className="w-5 h-5 shrink-0" />
              <span>My Profile</span>
            </NavLink>
            <NavLink
              to="/data-privacy"
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Shield className="w-5 h-5 shrink-0" />
              <span>Data Privacy</span>
            </NavLink>
          </div>
        </nav>

        <div className="shrink-0 p-3 border-t border-gray-100 flex flex-col gap-2">
          <p className="text-[10px] text-gray-400 text-center mt-2">IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

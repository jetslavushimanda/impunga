import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, Building2, FileText,
  Calculator, DollarSign, Bot, User, X,
  Sparkles, Receipt, ShoppingCart, MessageCircle, Target, Share2,
  BookOpen, Briefcase, Shield, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

const ENGINE_1_ITEMS = [
  { path: '/idea-validator', icon: Lightbulb, label: 'Idea Validator' },
  { path: '/name-generator', icon: Sparkles, label: 'Name Gen' },
  { path: '/registration-guide', icon: Building2, label: 'Registration Guide' },
  { path: '/business-plan', icon: FileText, label: 'Plan Builder' },
  { path: '/business-ledger', icon: BookOpen, label: 'Business Ledger' },
  { path: '/invoice-generator', icon: Receipt, label: 'Invoice Generator' },
  { path: '/pricing-calculator', icon: Calculator, label: 'Pricing Calculator' },
  { path: '/swot-analysis', icon: Target, label: 'SWOT Analysis' },
  { path: '/social-media', icon: Share2, label: 'Marketing Tools' },
];

const ENGINE_2_ITEMS = [
  { path: '/skill-profile-builder', icon: User, label: 'Skill Profile Builder' },
  { path: '/career-matches', icon: Briefcase, label: 'Career Matches' },
  { path: '/portfolio-showcase', icon: User, label: 'Portfolio Showcase' },
];

const ENGINE_3_ITEMS = [
  { path: '/funding-finder', icon: DollarSign, label: 'Funding Finder' },
];

const ENGINE_4_ITEMS = [
  { path: '/verified-directory', icon: ShieldCheck, label: 'Verified Service Directory' },
  { path: '/ai-advisor', icon: Bot, label: 'Mentorship Hub' },
];

const ENGINE_5_ITEMS = [
  { path: '/learning-insights', icon: Lightbulb, label: 'Learning Insight Cards' },
  { path: '/regulatory-gateway', icon: Building2, label: 'Regulatory Gateway' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { selectedPath, setSelectedPath, userProfile } = useAuthStore();

  const currentPath = selectedPath || userProfile?.selectedPath || 'both';

  const showEngine1 = currentPath === 'engine1' || currentPath === 'both';
  const showEngine2 = currentPath === 'engine2' || currentPath === 'both';

  async function handleSwitchPath() {
    try {
      if (user) {
        await updateProfile({ selectedPath: null });
      }
      setSelectedPath(null);
      navigate('/choose-path');
      onClose();
    } catch (err) {
      console.error('Failed to switch path:', err);
    }
  }

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
              <span>Dashboard</span>
            </NavLink>
          </div>

          {showEngine1 && (
            <div className="mt-6">
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Business
              </p>
              <div className="space-y-1">
                {ENGINE_1_ITEMS.map(({ path, icon: Icon, label }) => (
                  <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                    <Icon className="w-5 h-5 shrink-0" /> <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {showEngine2 && (
            <div className="mt-6">
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Skills
              </p>
              <div className="space-y-1">
                {ENGINE_2_ITEMS.map(({ path, icon: Icon, label }) => (
                  <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                    <Icon className="w-5 h-5 shrink-0" /> <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Finance
            </p>
            <div className="space-y-1">
              {ENGINE_3_ITEMS.map(({ path, icon: Icon, label }) => (
                <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                  <Icon className="w-5 h-5 shrink-0" /> <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Connect
            </p>
            <div className="space-y-1">
              {ENGINE_4_ITEMS.map(({ path, icon: Icon, label }) => (
                <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                  <Icon className="w-5 h-5 shrink-0" /> <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Learn & Gateway
            </p>
            <div className="space-y-1">
              {ENGINE_5_ITEMS.map(({ path, icon: Icon, label }) => (
                <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                  <Icon className="w-5 h-5 shrink-0" /> <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100">
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

        {/* Footer — always visible at bottom */}
        <div className="shrink-0 p-3 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={handleSwitchPath}
            className="text-xs text-gray-500 hover:text-primary font-medium text-center w-full py-1 hover:underline cursor-pointer bg-transparent border-none focus:outline-none"
          >
            Switch Path
          </button>
          <p className="text-[10px] text-gray-400 text-center">IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

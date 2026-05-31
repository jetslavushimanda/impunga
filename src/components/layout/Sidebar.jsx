import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, Building2, FileText,
  Calculator, DollarSign, Bot, TrendingUp, User, X, Sparkles, Receipt
} from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { path: '/idea-validator', icon: Lightbulb, key: 'ideaValidator' },
  { path: '/registration-guide', icon: Building2, key: 'registrationGuide' },
  { path: '/business-plan', icon: FileText, key: 'businessPlan' },
  { path: '/pricing-calculator', icon: Calculator, key: 'pricingCalculator' },
  { path: '/funding-finder', icon: DollarSign, key: 'fundingFinder' },
  { path: '/ai-advisor', icon: Bot, key: 'aiAdvisor' },
  { path: '/growth-tracker', icon: TrendingUp, key: 'growthTracker' },
  { path: '/name-generator', icon: Sparkles, key: 'nameGenerator' },
  { path: '/invoice-generator', icon: Receipt, key: 'invoiceGenerator' },
  { path: '/profile', icon: User, key: 'myProfile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useLang();
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <span className="font-bold text-primary text-lg">IMPUNGA</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-full pb-20">
          {NAV_ITEMS.map(({ path, icon: Icon, key }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400 text-center">IMPUNGA © JETS 2026 · Zambia</p>
        </div>
      </aside>
    </>
  );
}

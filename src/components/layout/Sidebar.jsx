import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, Building2, FileText,
  Calculator, DollarSign, Bot, TrendingUp, User, X,
  Sparkles, Receipt, ShoppingCart, MessageCircle, Target, Share2, GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/idea-validator', icon: Lightbulb, label: 'Idea Validator' },
  { path: '/registration-guide', icon: Building2, label: 'Registration Guide' },
  { path: '/business-plan', icon: FileText, label: 'Business Plan Builder' },
  { path: '/pricing-calculator', icon: Calculator, label: 'Pricing Calculator' },
  { path: '/funding-finder', icon: DollarSign, label: 'Funding Finder' },
  { path: '/ai-advisor', icon: Bot, label: 'AI Business Advisor' },
  { path: '/growth-tracker', icon: TrendingUp, label: 'Growth Tracker' },
  { path: '/name-generator', icon: Sparkles, label: 'Name Generator' },
  { path: '/invoice-generator', icon: Receipt, label: 'Invoice Generator' },
  { path: '/market-prices', icon: ShoppingCart, label: 'Market Prices' },
  { path: '/whatsapp-templates', icon: MessageCircle, label: 'WhatsApp Templates' },
  { path: '/swot-analysis', icon: Target, label: 'SWOT Analysis' },
  { path: '/social-media', icon: Share2, label: 'Social Media' },
  { path: '/business-quiz', icon: GraduationCap, label: 'Business Quiz' },
  { path: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
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
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{label}</span>
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

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Search, Sprout, ArrowLeft, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../lib/utils';
import SemanticSearch from '../shared/SemanticSearch';
import { ENGINE_MODULES } from '../../data/engineModules';

const ROUTE_TITLES = {
  '/dashboard': 'IMPUNGA',
  '/idea-validator': 'Idea Validator',
  '/registration-guide': 'Registration Guide',
  '/business-plan': 'Business Plan Builder',
  '/pitch-deck': 'Pitch Deck Generator',
  '/investment-matchmaker': 'Investment Matchmaker',
  '/pricing-calculator': 'Pricing Calculator',
  '/grants-portal': 'Grants & Subsidies',
  '/loans-portal': 'Loans & Credit',
  '/ai-advisor': 'AI Assistant',
  '/profile': 'My Profile',
  '/name-generator': 'Business Name Generator',
  '/invoice-generator': 'Invoice Generator',
  '/market-prices': 'Market Prices',
  '/whatsapp-templates': 'WhatsApp Templates',
  '/swot-analysis': 'SWOT Analysis',
  '/social-media': 'Marketing Tools',
  '/market-directory': 'Verified Directory',
  '/business-ledger': 'Business Ledger',
  '/skill-profile-builder': 'Skill Profile Builder',
  '/career-matches': 'Career Matches',
  '/zambian-jobs': 'Zambian Jobs',
  '/compliance-tracker': 'Compliance Tracker',
  '/data-privacy': 'Data Privacy',
  '/cv-generator': 'CV Generator',
  '/cover-letter-generator': 'Cover Letter AI',
  '/interview-prep': 'Interview Prep Wizard',
  '/skill-gap-closer': 'Skill Gap Closer',
  '/portfolio-showcase': 'Portfolio Showcase',
  '/b2b-tenders': 'B2B Tenders',
  '/gig-board': 'Piece-Work Board',
  '/asset-sharing': 'Asset Rentals',
  '/kpi-tracker': 'KPI & Summaries',
  '/savings-module': 'Savings Tracker',
  '/verified-directory': 'Verified Service Directory',
  '/agreement': 'Platform Governance & Disclaimers',
};

const getPageTitle = (path) => {
  if (path.startsWith('/engine/')) {
    const engineId = path.split('/')[2];
    return ENGINE_MODULES[engineId]?.title || 'Module';
  }
  return ROUTE_TITLES[path] || 'IMPUNGA';
};

export default function Header({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { logout } = useAuth();
  const { userProfile, customBack, customTitle } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = getInitials(userProfile?.fullName || '?');
  const isHome = pathname === '/dashboard';

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 select-none">
        <div className="flex items-center w-full max-w-7xl mx-auto gap-2">

          {/* Left: hamburger (home) or back arrow (sub-pages) */}
          <div className="shrink-0 flex items-center min-w-[40px]">
            {isHome ? (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all text-gray-600"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => customBack ? customBack() : navigate(-1)}
                className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all text-gray-600"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center: logo on home, page title on sub-pages */}
          <div className="flex-1 min-w-0 flex items-center justify-center px-2">
            {isHome ? (
              <Link to="/dashboard" className="flex items-center gap-2 select-none">
                <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
                <span className="text-xl font-black text-gray-900 tracking-tight">IMPUNGA</span>
              </Link>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-gray-800 tracking-tight truncate text-center block w-full max-w-sm">
                {customTitle || getPageTitle(pathname)}
              </span>
            )}
          </div>

          {/* Right: search, bell, avatar — always visible */}
          <div className="shrink-0 flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700 transition-all rounded-full sm:px-3 sm:py-1.5 text-xs border border-gray-200/50 sm:gap-1.5"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden sm:block font-normal text-gray-400 text-xs">Search...</span>
            </button>

            <button
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                  {initials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-40">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <button
                    onClick={async () => { await logout(); navigate('/'); }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-accent-red hover:bg-red-50 w-full text-left rounded-b-xl"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SemanticSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

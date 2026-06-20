import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Search, Sprout, ArrowLeft, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
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
  '/agreement': 'Platform Governance',
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
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = getInitials(userProfile?.fullName || '?');
  const isHome = pathname === '/dashboard';

  const THEME_OPTIONS = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <>
      <header className="bg-white dark:bg-[#1e2128] border-b border-gray-100 dark:border-[#2d3139] px-4 py-3 sticky top-0 z-30 select-none">
        <div className="flex items-center w-full gap-2">

          {/* Left: hamburger on home (mobile), back arrow on sub-pages */}
          <div className="shrink-0 w-9">
            {isHome ? (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252830] active:scale-95 transition-all text-gray-600 dark:text-gray-300"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => customBack ? customBack() : navigate(-1)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252830] active:scale-95 transition-all text-gray-600 dark:text-gray-300"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center: logo on home, page title elsewhere */}
          <div className="flex-1 min-w-0 flex items-center justify-center">
            {isHome ? (
              <Link to="/dashboard" className="flex items-center gap-2 select-none">
                <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
                <span className="text-xl font-black text-gray-900 dark:text-[#e8eaed] tracking-tight">IMPUNGA</span>
              </Link>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-gray-800 dark:text-[#e8eaed] tracking-tight truncate text-center">
                {customTitle || getPageTitle(pathname)}
              </span>
            )}
          </div>

          {/* Right: search, bell, avatar */}
          <div className="shrink-0 flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto bg-gray-100/80 dark:bg-[#252830] hover:bg-gray-200/80 dark:hover:bg-[#2d3139] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all rounded-full sm:px-3 sm:py-1.5 text-xs border border-gray-200/50 dark:border-[#2d3139] sm:gap-1.5"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden sm:block font-normal text-gray-400 dark:text-gray-500 text-xs">Search...</span>
            </button>

            <button
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252830] text-gray-500 dark:text-gray-400 active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252830] transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                  {initials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hidden sm:block shrink-0" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#1e2128] rounded-2xl shadow-xl dark:shadow-black/40 border border-gray-100 dark:border-[#2d3139] z-40 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2d3139]">
                      <p className="text-sm font-bold text-gray-900 dark:text-[#e8eaed] truncate">{userProfile?.fullName || 'Account'}</p>
                      <p className="text-xs text-gray-400 dark:text-[#9aa0a6] truncate">{userProfile?.province || ''}</p>
                    </div>

                    {/* Theme switcher */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-[#2d3139]">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-[#9aa0a6] uppercase tracking-wider mb-2 px-1">Appearance</p>
                      <div className="flex gap-1">
                        {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                          <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              theme === value
                                ? 'bg-primary text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252830]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <button
                      onClick={async () => { setDropdownOpen(false); await logout(); navigate('/'); }}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-accent-red hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <SemanticSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

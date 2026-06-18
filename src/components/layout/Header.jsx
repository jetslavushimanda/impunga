import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Menu, Search, Sprout, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { getGreeting, getFirstName, getInitials } from '../../lib/utils';
import SemanticSearch from '../shared/SemanticSearch';

export default function Header({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { logout } = useAuth();
  const { userProfile, customBack } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const firstName = getFirstName(userProfile?.fullName || '');
  const initials = getInitials(userProfile?.fullName || '?');
  const isHome = pathname === '/dashboard';

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 select-none">
        <div className="grid grid-cols-3 items-center w-full max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="flex items-center justify-start">
            {isHome ? (
              <button 
                onClick={onMenuToggle} 
                className="p-2 rounded-xl hover:bg-surface-light active:scale-95 transition-all text-gray-600" 
                aria-label="Toggle menu"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (customBack) {
                    customBack();
                  } else {
                    navigate(-1);
                  }
                }} 
                className="p-2 rounded-xl hover:bg-surface-light active:scale-95 transition-all text-gray-600" 
                aria-label="Go back"
              >
                <ArrowLeft className="w-5.5 h-5.5" />
              </button>
            )}
          </div>

          {/* Center Column */}
          <div className="flex items-center justify-center">
            <Link to="/dashboard" className="flex items-center gap-2 select-none pointer-events-auto">
              <Sprout className="w-5 h-5 text-accent-gold logo-sprout shrink-0" />
              <span className="text-xl font-black text-primary tracking-tight">IMPUNGA</span>
            </Link>
          </div>

          {/* Right Column */}
          <div className="flex items-center justify-end gap-2.5">
            {isHome ? (
              <>
                {/* Search Button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700 transition-all rounded-full px-3 py-1.5 text-xs font-bold border border-gray-200/30"
                  aria-label="Smart search"
                >
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="hidden sm:block font-normal">Search...</span>
                </button>

                <button className="p-2 rounded-xl hover:bg-surface-light text-gray-600 relative active:scale-95 transition-all" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-light transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                      {initials}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block shrink-0" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-150 z-40 animate-fade-in">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-surface-light rounded-t-xl"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-accent-red hover:bg-red-50 w-full text-left rounded-b-xl"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={onMenuToggle} 
                className="p-2 rounded-xl hover:bg-surface-light active:scale-95 transition-all text-gray-600" 
                aria-label="Toggle menu"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Semantic Search Modal */}
      <SemanticSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { getGreeting, getFirstName, getInitials } from '../../lib/utils';

export default function Header({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const firstName = getFirstName(userProfile?.fullName || '');
  const initials = getInitials(userProfile?.fullName || '?');

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-surface-light" aria-label="Toggle menu">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">IMPUNGA</span>
          <span className="hidden sm:block text-xs text-gray-400 font-medium">Plant. Grow. Feed Zambia.</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden md:block text-sm text-gray-600">
          {getGreeting()}{firstName ? `, ${firstName}` : ''}
        </span>

        <button className="p-2 rounded-lg hover:bg-surface-light relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-light"
          >
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-40">
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
      </div>
    </header>
  );
}

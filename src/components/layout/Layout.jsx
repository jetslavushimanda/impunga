import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import OfflineBanner from '../shared/OfflineBanner';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../shared/LoadingSpinner';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuthStore();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-surface-light">
      <OfflineBanner />
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex h-[calc(100vh-57px)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

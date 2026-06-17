import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getGreeting, getFirstName } from '../lib/utils';
import { PageLoader } from '../components/shared/LoadingSpinner';
import { ENGINE_MODULES } from '../data/engineModules';

export default function Dashboard() {
  const { userProfile, loading } = useAuthStore();

  if (loading) return <PageLoader />;

  const firstName = getFirstName(userProfile?.fullName || '');
  const engines = Object.values(ENGINE_MODULES);

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      {/* Welcome Message */}
      <div className="mb-8 px-1">
        <h1 className="text-3xl font-bold text-gray-800">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Welcome to Zambia's Economic Intelligence Platform. Select an engine to begin.
        </p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 mt-6">
        {engines.map((engine, index) => {
          const { id, title, description, icon: Icon, bg } = engine;
          const isLast = index === engines.length - 1;
          
          return (
            <Link
              key={id}
              to={id === 'gateway' ? '/ai-advisor' : `/engine/${id}`}
              className={`group flex items-center justify-between p-5 md:p-6 transition-colors hover:bg-gray-50 ${isLast ? '' : 'border-b border-gray-100'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white/20 ${bg}`}>
                  <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-0.5 tracking-tight group-hover:text-primary transition-colors">{title}</h2>
                  <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">{description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-4 group-hover:text-gray-600 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

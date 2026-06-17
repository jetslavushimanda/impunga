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

      <div className="flex flex-col gap-4">
        {engines.map((engine) => {
          const { id, title, description, icon: Icon, bg } = engine;
          return (
            <Link
              key={id}
              to={id === 'gateway' ? '/ai-advisor' : `/engine/${id}`}
              className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${bg}`}
            >
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                  <p className="text-white/80 text-sm md:text-base max-w-xl">{description}</p>
                </div>
              </div>
              <div className="relative z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
              
              {/* Decorative background icon */}
              <Icon className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

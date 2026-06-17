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
              className="group relative bg-white overflow-hidden rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative z-10 flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white/20 ${bg}`}>
                  <Icon className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1 tracking-tight">{title}</h2>
                  <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">{description}</p>
                </div>
              </div>
              <div className="relative z-10 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors border border-gray-100 text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </div>
              
              {/* Decorative background icon */}
              <div className="absolute -right-6 -bottom-6 w-48 h-48 text-gray-50/80 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <Icon className="w-full h-full" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

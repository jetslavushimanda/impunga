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
              className={`group relative overflow-hidden rounded-[2rem] p-6 md:p-8 flex items-center justify-between shadow-xl hover:shadow-2xl border border-white/20 transition-all duration-500 hover:scale-[1.02] ${bg}`}
            >
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner border border-white/30">
                  <Icon className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1.5 tracking-tight">{title}</h2>
                  <p className="text-white/80 text-sm md:text-base max-w-xl font-medium leading-relaxed">{description}</p>
                </div>
              </div>
              <div className="relative z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
              
              {/* Decorative background icon */}
              <div className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 blur-sm">
                <Icon className="w-full h-full" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

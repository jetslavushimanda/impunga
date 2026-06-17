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
              className="group relative bg-white overflow-hidden rounded-[2rem] p-6 md:p-8 flex items-center justify-between border border-gray-200 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1"
            >
              <div className="relative z-10 flex items-center gap-6">
                <div className="relative">
                  {/* Glowing backdrop */}
                  <div className={`absolute inset-0 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 rounded-full ${bg}`} />
                  {/* Actual icon box */}
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 ${bg}`}>
                    <Icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight group-hover:text-primary transition-colors">{title}</h2>
                  <p className="text-gray-500 text-sm md:text-base max-w-xl font-medium leading-relaxed">{description}</p>
                </div>
              </div>
              <div className="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-gray-400 group-hover:scale-110 group-hover:shadow-md">
                <ChevronRight className="w-6 h-6" />
              </div>
              
              {/* Decorative background icon */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 text-gray-50 group-hover:text-gray-100/80 pointer-events-none group-hover:scale-[1.15] group-hover:-rotate-6 transition-all duration-700">
                <Icon className="w-full h-full" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';

import BusinessHubView from './BusinessHubView';

export function ModuleCard({ path, icon: Icon, name, desc, bg, text }) {
  return (
    <Link
      to={path}
      className="group relative bg-white/85 backdrop-blur-xl overflow-hidden rounded-3xl p-6 flex flex-col border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start justify-between relative z-10 mb-5">
        <div className="relative">
          <div className={`absolute inset-0 blur-xl opacity-30 rounded-full ${bg}`} />
          <div className={`relative w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-md border border-white/40 ${bg}`}>
            <Icon className={`w-6 h-6 ${text || 'text-gray-700'} drop-shadow-sm`} />
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-50/80 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-gray-400 group-hover:scale-110">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-2 group-hover:text-primary transition-colors tracking-tight">{name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
      </div>
      
      {/* Decorative background icon */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.04] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500 text-gray-900">
        <Icon className="w-full h-full" />
      </div>
    </Link>
  );
}

export default function EngineView() {
  const { engineId } = useParams();
  const engine = ENGINE_MODULES[engineId];

  if (!engine) {
    return <Navigate to="/dashboard" replace />;
  }

  if (engineId === 'business') {
    return <BusinessHubView />;
  }

  const { icon: EngineIcon, title, description, bg, modules } = engine;

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-fade-in relative">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="mb-10 relative">
        <div className="flex items-start md:items-center gap-5 relative z-10">
          <div className="relative">
            <div className={`absolute inset-0 blur-2xl opacity-20 rounded-full ${bg}`} />
            <div className={`relative w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg border border-white/30 shrink-0 ${bg}`}>
              <EngineIcon className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{title}</h1>
            <p className="text-gray-500 text-base max-w-2xl font-medium leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(mod => (
          <ModuleCard key={mod.path} {...mod} />
        ))}
      </div>
    </div>
  );
}

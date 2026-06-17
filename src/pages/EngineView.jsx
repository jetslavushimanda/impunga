import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';

import BusinessHubView from './BusinessHubView';

export function ModuleCard({ path, icon: Icon, name, desc, bg, text, badge }) {
  return (
    <Link
      to={path}
      className="group relative bg-white/70 backdrop-blur-md overflow-hidden rounded-2xl p-4 flex items-center gap-4 border border-white/80 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(99,102,241,0.08)] hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 w-full"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative shrink-0 z-10">
        {/* Glowing background */}
        <div className={`absolute inset-0 opacity-20 blur-md rounded-full ${bg} group-hover:opacity-35 transition-opacity duration-300`} />
        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md border border-white/50 group-hover:scale-105 transition-transform duration-300 ${bg}`}>
          <Icon className={`w-6 h-6 ${text || 'text-gray-700'} drop-shadow-sm`} />
        </div>
      </div>

      <div className="flex-1 min-w-0 relative z-10 text-left">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
            {name}
          </h4>
          {badge && (
            <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 transition-all duration-300 ${badge === 'Folder' ? 'bg-yellow-50/80 text-yellow-600 border-yellow-200/40 group-hover:bg-yellow-500 group-hover:text-white' : 'bg-indigo-50/80 text-indigo-600 border-indigo-100/40 group-hover:bg-indigo-600 group-hover:text-white'}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">{desc}</p>
      </div>
      
      {/* Subtle background icon */}
      <div className="absolute -right-2 -bottom-2 w-16 h-16 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-500 text-gray-900">
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

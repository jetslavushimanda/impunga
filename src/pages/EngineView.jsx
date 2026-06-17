import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';

function ModuleCard({ path, icon: Icon, name, desc, bg, text, border }) {
  return (
    <Link
      to={path}
      className={`group flex flex-col gap-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 ${border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${text}`} />
        </div>
        <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0" />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-base leading-tight mb-1">{name}</p>
        <p className="text-gray-500 text-sm leading-snug">{desc}</p>
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

  const { icon: EngineIcon, title, description, bg, modules } = engine;

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white/20 shrink-0 ${bg}`}>
            <EngineIcon className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{title}</h1>
        </div>
        <p className="text-gray-500 text-base max-w-2xl leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => (
          <ModuleCard key={mod.path} {...mod} />
        ))}
      </div>
    </div>
  );
}

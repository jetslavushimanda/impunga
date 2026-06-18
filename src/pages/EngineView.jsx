import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';

import BusinessHubView from './BusinessHubView';

const badgeColorMap = {
  purple: 'bg-purple-50/80 text-purple-600 border-purple-100/40 group-hover:bg-purple-600 group-hover:text-white',
  green: 'bg-green-50/80 text-green-600 border-green-100/40 group-hover:bg-green-600 group-hover:text-white',
  blue: 'bg-blue-50/80 text-blue-600 border-blue-100/40 group-hover:bg-blue-600 group-hover:text-white',
  orange: 'bg-orange-50/80 text-orange-600 border-orange-100/40 group-hover:bg-orange-600 group-hover:text-white',
  teal: 'bg-teal-50/80 text-teal-600 border-teal-100/40 group-hover:bg-teal-600 group-hover:text-white',
  emerald: 'bg-emerald-50/80 text-emerald-600 border-emerald-100/40 group-hover:bg-emerald-600 group-hover:text-white',
  yellow: 'bg-yellow-50/80 text-yellow-600 border-yellow-200/40 group-hover:bg-yellow-500 group-hover:text-white',
  indigo: 'bg-indigo-50/80 text-indigo-600 border-indigo-100/40 group-hover:bg-indigo-600 group-hover:text-white',
};

export function ModuleCard({ path, icon: Icon, name, desc, bg, text, badge, badgeColor }) {
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
            <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 transition-all duration-300 ${badgeColorMap[badgeColor] || (badge === 'Folder' ? badgeColorMap.yellow : badgeColorMap.indigo)}`}>
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

const getCardStyles = (path) => {
  switch (path) {
    case '/grants-portal':
      return {
        hoverBorder: 'hover:border-emerald-200',
        hoverBg: 'hover:bg-emerald-50/30',
        iconBg: 'bg-emerald-50 border border-emerald-100',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-600',
        footerText: 'Explore Grants'
      };
    case '/loans-portal':
      return {
        hoverBorder: 'hover:border-blue-200',
        hoverBg: 'hover:bg-blue-50/30',
        iconBg: 'bg-blue-50 border border-blue-100',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-600',
        footerText: 'Explore Loans'
      };
    case '/investment-matchmaker':
      return {
        hoverBorder: 'hover:border-purple-200',
        hoverBg: 'hover:bg-purple-50/30',
        iconBg: 'bg-purple-50 border border-purple-100',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-600',
        footerText: 'Match Investors'
      };
    default:
      return {
        hoverBorder: 'hover:border-indigo-200',
        hoverBg: 'hover:bg-indigo-50/30',
        iconBg: 'bg-indigo-50 border border-indigo-100',
        iconColor: 'text-indigo-600',
        textColor: 'text-indigo-600',
        footerText: 'Explore'
      };
  }
};

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {engineId === 'finance' ? (
          modules.map(mod => {
            const styles = getCardStyles(mod.path);
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className={`group text-left bg-white rounded-2xl p-6 border border-gray-100 ${styles.hoverBorder} ${styles.hoverBg} hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full w-full`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{mod.name}</h2>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className={`${styles.textColor} font-bold text-xs uppercase tracking-wide`}>
                    {styles.footerText}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:${styles.iconColor} group-hover:translate-x-0.5 transition-all`} />
                </div>
              </Link>
            );
          })
        ) : (
          modules.map(mod => (
            <ModuleCard key={mod.path} {...mod} />
          ))
        )}
      </div>
    </div>
  );
}

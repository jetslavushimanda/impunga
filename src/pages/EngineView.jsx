import { useParams, Navigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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

const tintMap = {
  blue: 'rgba(59,130,246,0.06)',
  green: 'rgba(34,197,94,0.06)',
  purple: 'rgba(168,85,247,0.06)',
  orange: 'rgba(249,115,22,0.06)',
  amber: 'rgba(245,158,11,0.06)',
  teal: 'rgba(20,184,166,0.06)',
  cyan: 'rgba(6,182,212,0.06)',
  indigo: 'rgba(99,102,241,0.06)',
  fuchsia: 'rgba(217,70,239,0.06)',
  rose: 'rgba(244,63,94,0.06)',
  red: 'rgba(239,68,68,0.06)',
  yellow: 'rgba(234,179,8,0.06)',
  emerald: 'rgba(16,185,129,0.06)',
};

export function ModuleCard({ path, onClick, icon: Icon, name, desc, bg, text, badge, badgeColor }) {
  let color = 'indigo';
  if (text) {
    const match = text.match(/text-([a-z]+)-/);
    if (match) color = match[1];
  } else if (bg) {
    const match = bg.match(/bg-([a-z]+)-/);
    if (match) color = match[1];
  }

  const iconBg = `${bg || `bg-${color}-50`} border border-${color}-100`;
  const iconColor = text || `text-${color}-600`;
  const bgTint = tintMap[color] || 'rgba(99,102,241,0.04)';

  const content = (
    <div className="flex items-start gap-4 w-full">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {badge && (
          <div className="mb-2">
            <span className={`text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shrink-0 transition-all duration-300 ${badgeColorMap[badgeColor] || badgeColorMap.indigo}`}>
              {badge}
            </span>
          </div>
        )}
        <h4 className="font-bold text-gray-900 text-sm md:text-base leading-snug mb-1">{name}</h4>
        <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed">{desc}</p>
      </div>
      {/* Arrow — hidden at rest, visible on hover */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${iconBg}`}>
        <ChevronRight className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
    </div>
  );

  const className = 'group text-left bg-white overflow-hidden rounded-2xl p-5 lg:px-7 lg:py-5 border border-gray-300 shadow-sm shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 w-full cursor-pointer';

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link to={path} className={className}>
      {content}
    </Link>
  );
}

export default function EngineView() {
  const { engineId } = useParams();
  const engine = ENGINE_MODULES[engineId];

  if (!engine) return <Navigate to="/dashboard" replace />;
  if (engineId === 'business') return <BusinessHubView />;

  const { modules } = engine;

  return (
    <div className="max-w-2xl mx-auto lg:max-w-none pb-24 animate-fade-in px-2 sm:px-4">
      <div className="flex flex-col gap-4 lg:gap-5 mt-2">
        {modules.map(mod => (
          <ModuleCard key={mod.path} {...mod} />
        ))}
      </div>
    </div>
  );
}

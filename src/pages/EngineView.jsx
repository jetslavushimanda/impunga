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

export function ModuleCard({ path, onClick, icon: Icon, name, desc, bg, text, badge, badgeColor }) {
  // Extract color key from bg or text prop (e.g. "bg-green-50" -> "green")
  let color = 'indigo';
  if (text) {
    const match = text.match(/text-([a-z]+)-/);
    if (match) color = match[1];
  } else if (bg) {
    const match = bg.match(/bg-([a-z]+)-/);
    if (match) color = match[1];
  }
  if (color === 'emerald') color = 'green';

  const hoverBorder = `hover:border-${color}-200`;
  const hoverBg = `hover:bg-${color}-50/30`;
  const iconBg = `${bg || `bg-${color}-50`} border border-${color}-100`;
  const iconColor = text || `text-${color}-600`;

  // Determine an appropriate footer action text based on path or name
  let footerText = 'Explore Tools';
  const checkText = (path || name || '').toLowerCase();
  if (checkText.includes('ledger')) footerText = 'Track Ledger';
  else if (checkText.includes('invoice')) footerText = 'Create Invoice';
  else if (checkText.includes('pricing') || checkText.includes('calculator')) footerText = 'Calculate';
  else if (checkText.includes('profile')) footerText = 'Build Profile';
  else if (checkText.includes('career') || checkText.includes('match')) footerText = 'Match Careers';
  else if (checkText.includes('cv')) footerText = 'Generate CV';
  else if (checkText.includes('cover')) footerText = 'Generate Cover Letter';
  else if (checkText.includes('prep') || checkText.includes('interview')) footerText = 'Start Prep';
  else if (checkText.includes('gap') || checkText.includes('closer')) footerText = 'Close Gaps';
  else if (checkText.includes('grant')) footerText = 'Explore Grants';
  else if (checkText.includes('loan')) footerText = 'Explore Loans';
  else if (checkText.includes('directory') || checkText.includes('marketplace')) footerText = 'Enter Directory';
  else if (checkText.includes('showcase')) footerText = 'View Showcase';
  else if (checkText.includes('tender')) footerText = 'View Tenders';
  else if (checkText.includes('gig')) footerText = 'View Gig Board';
  else if (checkText.includes('asset') || checkText.includes('sharing')) footerText = 'Explore Sharing';
  else if (checkText.includes('name-generator') || checkText.includes('name')) footerText = 'Generate Names';
  else if (checkText.includes('swot')) footerText = 'Perform SWOT';
  else if (checkText.includes('plan')) footerText = 'Build Plan';
  else if (checkText.includes('pitch')) footerText = 'Generate Pitch';
  else if (checkText.includes('validate')) footerText = 'Validate Now';
  else if (checkText.includes('blueprints') || checkText.includes('folder')) footerText = 'Open Blueprints';

  const content = (
    <>
      <div className="flex items-start gap-4 w-full">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
              {name}
            </h4>
            {badge && (
              <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 transition-all duration-300 ${badgeColorMap[badgeColor] || (badge === 'Folder' ? badgeColorMap.yellow : badgeColorMap.indigo)}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4 w-full">
        <span className={`${iconColor} font-bold text-xs uppercase tracking-wide`}>{footerText}</span>
        <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:${iconColor} group-hover:translate-x-0.5 transition-all`} />
      </div>
    </>
  );

  const className = `group text-left bg-white overflow-hidden rounded-2xl p-6 border border-gray-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-${color}-300 hover:bg-${color}-50/10 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 w-full flex flex-col justify-between h-full relative cursor-pointer`;

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
        {modules.map(mod => (
          <ModuleCard key={mod.path} {...mod} />
        ))}
      </div>
    </div>
  );
}

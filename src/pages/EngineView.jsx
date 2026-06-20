import { useParams, Navigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';
import BusinessHubView from './BusinessHubView';

// Color → subtle tint rgba values (4-5% opacity)
const tintMap = {
  blue:    'rgba(59,130,246,0.05)',
  green:   'rgba(34,197,94,0.05)',
  purple:  'rgba(168,85,247,0.05)',
  orange:  'rgba(249,115,22,0.05)',
  amber:   'rgba(245,158,11,0.05)',
  teal:    'rgba(20,184,166,0.05)',
  cyan:    'rgba(6,182,212,0.05)',
  indigo:  'rgba(99,102,241,0.05)',
  fuchsia: 'rgba(217,70,239,0.05)',
  rose:    'rgba(244,63,94,0.05)',
  red:     'rgba(239,68,68,0.05)',
  yellow:  'rgba(234,179,8,0.05)',
  emerald: 'rgba(16,185,129,0.05)',
};

const tintMapDark = {
  blue:    'rgba(59,130,246,0.08)',
  green:   'rgba(34,197,94,0.08)',
  purple:  'rgba(168,85,247,0.08)',
  orange:  'rgba(249,115,22,0.08)',
  amber:   'rgba(245,158,11,0.08)',
  teal:    'rgba(20,184,166,0.08)',
  cyan:    'rgba(6,182,212,0.08)',
  indigo:  'rgba(99,102,241,0.08)',
  fuchsia: 'rgba(217,70,239,0.08)',
  rose:    'rgba(244,63,94,0.08)',
  red:     'rgba(239,68,68,0.08)',
  yellow:  'rgba(234,179,8,0.08)',
  emerald: 'rgba(16,185,129,0.08)',
};

const badgeBg = {
  purple:  'bg-purple-50/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
  green:   'bg-green-50/80 dark:bg-green-900/30 text-green-600 dark:text-green-300',
  blue:    'bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
  orange:  'bg-orange-50/80 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300',
  teal:    'bg-teal-50/80 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300',
  emerald: 'bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300',
  yellow:  'bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300',
  indigo:  'bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300',
};

function extractColor(text = '', bg = '') {
  const src = text || bg;
  const m = src.match(/(?:text|bg)-([a-z]+)-/);
  return m ? m[1] : 'indigo';
}

export function ModuleCard({ path, onClick, icon: Icon, name, desc, bg, text, badge, badgeColor }) {
  const color = extractColor(text, bg);
  const iconBg = bg || `bg-${color}-50`;
  const iconColor = text || `text-${color}-600`;
  const isDark = document.documentElement.classList.contains('dark');
  const tint = isDark ? (tintMapDark[color] || tintMapDark.indigo) : (tintMap[color] || tintMap.indigo);

  const content = (
    <div
      className="group flex items-center gap-4 w-full rounded-2xl px-5 py-4 lg:px-6 lg:py-5
        border border-gray-200/80 dark:border-[#2d3139]
        shadow-sm hover:shadow-md dark:hover:shadow-black/30
        hover:-translate-y-0.5 active:scale-[0.99]
        transition-all duration-200 cursor-pointer
        bg-white dark:bg-[#1e2128]"
      style={{ backgroundImage: `linear-gradient(to right, ${tint} 0%, transparent 60%)` }}
    >
      {/* Icon */}
      <div className={`w-11 h-11 ${iconBg} dark:opacity-90 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className={`w-5.5 h-5.5 ${iconColor}`} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 text-left">
        {badge && (
          <span className={`inline-block text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-1.5 ${badgeBg[badgeColor] || badgeBg.indigo}`}>
            {badge}
          </span>
        )}
        <h4 className="font-bold text-gray-900 dark:text-[#e8eaed] text-sm lg:text-[15px] leading-snug">{name}</h4>
        <p className="text-gray-500 dark:text-[#9aa0a6] text-xs lg:text-sm font-medium leading-relaxed mt-0.5 line-clamp-2">{desc}</p>
      </div>

      {/* Chevron — always visible */}
      <ChevronRight className={`w-4 h-4 shrink-0 ${iconColor} dark:opacity-70 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200`} />
    </div>
  );

  if (onClick) return <button onClick={onClick} className="w-full text-left">{content}</button>;
  return <Link to={path} className="block">{content}</Link>;
}

export default function EngineView() {
  const { engineId } = useParams();
  const engine = ENGINE_MODULES[engineId];

  if (!engine) return <Navigate to="/dashboard" replace />;
  if (engineId === 'business') return <BusinessHubView />;

  return (
    <div className="max-w-2xl mx-auto lg:max-w-none pb-24 animate-fade-in px-1 sm:px-2">
      <div className="flex flex-col gap-3 mt-2">
        {engine.modules.map(mod => (
          <ModuleCard key={mod.path} {...mod} />
        ))}
      </div>
    </div>
  );
}

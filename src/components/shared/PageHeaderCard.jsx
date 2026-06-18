import { Sprout } from 'lucide-react';

const badgeColorMap = {
  purple: 'bg-purple-50 text-purple-650 border-purple-100/40',
  green: 'bg-green-50 text-green-600 border-green-100/40',
  blue: 'bg-blue-50 text-blue-600 border-blue-100/40',
  orange: 'bg-orange-50 text-orange-600 border-orange-100/40',
  teal: 'bg-teal-50 text-teal-600 border-teal-100/40',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/40',
  yellow: 'bg-yellow-50 text-yellow-650 border-yellow-250/40',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100/40',
  slate: 'bg-slate-50 text-slate-700 border-slate-200/40',
};

export default function PageHeaderCard({ 
  title, 
  description, 
  icon: Icon, 
  bg = 'bg-indigo-50', 
  text = 'text-indigo-600', 
  badge, 
  badgeColor = 'indigo', 
  rightElement 
}) {
  return (
    <div className="bg-white border border-gray-200/60 rounded-[2rem] p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-6 relative overflow-hidden text-left">
      {/* Subtle ambient glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-gray-150/10 to-gray-200/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-14 h-14 ${bg} border border-gray-100/30 rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
            {Icon ? <Icon className={`w-7 h-7 ${text}`} /> : <Sprout className={`w-7 h-7 ${text}`} />}
          </div>
          <div className="flex-1 min-w-0">
            {badge && (
              <div className="mb-1.5">
                <span className={`text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${badgeColorMap[badgeColor] || badgeColorMap.indigo}`}>
                  {badge}
                </span>
              </div>
            )}
            <h1 className="font-extrabold text-gray-900 text-lg md:text-xl leading-snug mb-1">
              {title}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed">{description}</p>
          </div>
        </div>

        {rightElement && (
          <div className="shrink-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      
      {/* Decorative large background icon */}
      {Icon && (
        <div className="absolute -right-10 -bottom-10 w-64 h-64 text-gray-50 pointer-events-none opacity-[0.25]">
          <Icon className="w-full h-full" />
        </div>
      )}
    </div>
  );
}

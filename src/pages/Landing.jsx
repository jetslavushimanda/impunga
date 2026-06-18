import { Link } from 'react-router-dom';
import { Sprout, ChevronRight, Briefcase, Cpu, ShieldCheck, Globe, Star, Sparkles } from 'lucide-react';

export default function Landing() {
  const stats = [
    { icon: Briefcase, name: '12 Modules', desc: 'SME toolkit & jobs' },
    { icon: Sparkles, name: '2 Engines', desc: 'Business & Career' },
    { icon: Cpu, name: 'AI Powered', desc: 'Personalized advising' },
    { icon: ShieldCheck, name: '25+ Funders', desc: 'Grants and credit' },
    { icon: Globe, name: '116 Districts', desc: 'Zambia-wide coverage' },
    { icon: Star, name: 'K0 Cost', desc: '100% Free platform' },
  ];

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #154360 0%, #1B4F72 100%)' }}>
      {/* Decorative Sprouts in Background */}
      <Sprout className="absolute -right-8 -top-8 w-48 h-48 text-white/5 pointer-events-none" />
      <Sprout className="absolute -left-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="card w-full max-w-2xl shadow-2xl p-8 md:p-12 text-center bg-white rounded-2xl">
          
          {/* Logo / Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sprout className="w-10 h-10 text-accent-gold" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">IMPUNGA</h1>
            <Sprout className="w-10 h-10 text-accent-gold" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Start. Match. Build Zambia.
          </h2>

          <p className="text-sm md:text-base text-gray-500 italic mb-8 max-w-lg mx-auto">
            "Plant Your Idea. Grow Your Business. Feed Zambia."
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-left">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <s.icon className="w-4 h-4 text-accent-gold" />
                  <span className="font-bold text-sm tracking-wide">{s.name}</span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium leading-tight">{s.desc}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link to="/register" className="btn-green flex-1 py-3 text-base font-semibold shadow-lg shadow-green-700/20 flex items-center justify-center gap-1">
              Get Started — It's Free
            </Link>
            <Link to="/login" className="btn-secondary flex-1 py-3 text-base font-semibold flex items-center justify-center gap-1.5 shadow-sm">
              Login <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-primary-dark/40 backdrop-blur-sm border-t border-white/5 py-4 px-6 relative z-10">
        <p className="text-center text-blue-200/50 text-xs font-semibold tracking-wider uppercase">
          IMPUNGA Economic Intelligence Platform &copy; 2026 · Built in Zambia
        </p>
      </div>

    </div>
  );
}

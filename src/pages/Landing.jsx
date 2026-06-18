import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';
import { Sprout, ChevronRight } from 'lucide-react';

export default function Landing() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #154360 0%, #1B4F72 100%)' }}>
      
      {/* Decorative Sprouts in Background */}
      <Sprout className="absolute -right-8 -top-8 w-48 h-48 text-white/5 pointer-events-none" />
      <Sprout className="absolute -left-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-2xl text-center px-4">
          
          {/* Logo / Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sprout className="w-12 h-12 text-accent-gold logo-sprout" />
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">IMPUNGA</h1>
            <Sprout className="w-12 h-12 text-accent-gold logo-sprout" />
          </div>

          {/* Tagline */}
          <h2 className="text-xl md:text-3xl font-bold text-blue-100 mb-12 max-w-xl mx-auto leading-normal">
            {t('appTagline')}
          </h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto justify-center">
            <Link to="/register" className="btn-green text-base px-10 py-3.5 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all">
              Get Started — It's Free
            </Link>
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 border-2 border-white/80 text-white hover:border-white hover:bg-white hover:text-primary-dark transition-all px-10 py-3.5 rounded-lg font-semibold text-base min-h-11"
            >
              Login <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-primary-dark/40 backdrop-blur-sm border-t border-white/5 py-4 px-6 relative z-10">
        <p className="text-center text-blue-200/40 text-xs font-semibold tracking-wider uppercase">
          IMPUNGA Economic Intelligence Platform &copy; 2026 · Built in Zambia
        </p>
      </div>

    </div>
  );
}

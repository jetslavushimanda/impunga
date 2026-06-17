import { Link } from 'react-router-dom';
import { Sprout, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-primary">

      {/* HERO */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Sprout className="w-10 h-10 text-accent-gold" />
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">IMPUNGA</h1>
          <Sprout className="w-10 h-10 text-accent-gold" />
        </div>

        <p className="text-xl md:text-2xl font-semibold text-primary-light mb-1">
          Start. Match. Build Zambia.
        </p>

        <p className="text-sm md:text-base text-blue-200 italic mb-6">
          Plant Your Idea. Grow Your Business. Feed Zambia.
        </p>

        <p className="text-blue-300 text-sm md:text-base mb-12">
          Economic Intelligence Platform
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="btn-green text-base px-10 py-3 shadow-lg">
            Get Started — It's Free
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 border-2 border-white text-white px-10 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-base min-h-11"
          >
            Login <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="bg-primary-dark py-4 px-6">
        <p className="text-center text-blue-300 text-sm font-medium tracking-wide">
          12 Modules &nbsp;·&nbsp; 2 Engines &nbsp;·&nbsp; AI Powered &nbsp;·&nbsp; 25+ Funders &nbsp;·&nbsp; 116 Districts &nbsp;·&nbsp; K0 Cost
        </p>
      </div>

      {/* FOOTER */}
      <div className="bg-primary-dark border-t border-white/10 py-3 px-6">
        <p className="text-center text-blue-400 text-xs">
          IMPUNGA © 2026 · Built in Zambia
        </p>
      </div>

    </div>
  );
}

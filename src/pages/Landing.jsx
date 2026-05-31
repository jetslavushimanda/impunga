import { Link } from 'react-router-dom';
import { Lightbulb, Building2, FileText, TrendingUp, Sprout } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex items-center gap-3 mb-4">
          <Sprout className="w-10 h-10 text-accent-gold" />
          <h1 className="text-6xl font-bold text-white tracking-tight">IMPUNGA</h1>
          <Sprout className="w-10 h-10 text-accent-gold" />
        </div>
        <p className="text-primary-light text-xl font-medium mb-2">Plant Your Idea. Grow Your Business. Feed Zambia.</p>
        <p className="text-blue-200 text-sm max-w-md mb-10">
          Zambia's first AI-powered entrepreneurship platform. Free tools and expert guidance for every Zambian with a business idea.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl w-full">
          {[
            { icon: Lightbulb, title: 'AI Idea Validation', desc: 'Gemini AI rates your business idea for the Zambian market' },
            { icon: Building2, title: 'PACRA Registration', desc: 'Step-by-step guide to registering your business legally' },
            { icon: FileText, title: 'Business Plan Builder', desc: 'Generate a professional PDF business plan for free' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 rounded-xl p-4 text-left backdrop-blur">
              <Icon className="w-6 h-6 text-accent-gold mb-2" />
              <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
              <p className="text-blue-200 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="btn-green text-base px-8 py-3 shadow-lg">
            Get Started — It's Free
          </Link>
          <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-base flex items-center justify-center">
            Login
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-primary-dark py-4 px-4">
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-blue-200 text-center">
          {[
            { stat: '7 Modules', label: 'Complete toolkit' },
            { stat: 'Gemini AI', label: 'Business mentor' },
            { stat: '25+ Funders', label: 'Zambian funding' },
            { stat: '116 Districts', label: 'Nationwide' },
            { stat: 'K0 Cost', label: 'Completely free' },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <span className="block font-bold text-white text-base">{stat}</span>
              <span className="block">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

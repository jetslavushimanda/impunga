import { Link } from 'react-router-dom';
import {
  Sprout, Lightbulb, Building2, FileText, Calculator,
  DollarSign, Bot, TrendingUp, Zap, MapPin, Brain,
  GraduationCap, ShoppingBag, Wheat, Briefcase, User, Heart, ChevronRight
} from 'lucide-react';

const FEATURE_CARDS = [
  { icon: Lightbulb, title: 'AI Idea Validator', desc: 'AI rates your business idea for the Zambian market', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { icon: Building2, title: 'PACRA Registration Guide', desc: 'Step-by-step guide to legally registering your business', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: FileText, title: 'Business Plan Builder', desc: 'Build and download a professional business plan PDF', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Calculator, title: 'Pricing Calculator', desc: 'Calculate your true costs and set profitable prices', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: DollarSign, title: 'Funding Finder', desc: '25+ real Zambian funders — CEEC, grants and more', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Bot, title: 'AI Business Advisor', desc: 'Your personal AI mentor available 24 hours a day', color: 'text-primary', bg: 'bg-blue-50' },
];

const REASONS = [
  { icon: Zap, title: 'Completely Free', desc: 'Every tool, every feature, every module. Zero Kwacha. No hidden fees ever.', color: 'text-accent-gold', bg: 'bg-yellow-50' },
  { icon: MapPin, title: 'Built for Zambia', desc: 'PACRA, ZRA, CEEC. All 10 provinces. 116 districts. Real Zambian tools.', color: 'text-accent-green', bg: 'bg-green-50' },
  { icon: Brain, title: 'AI Powered', desc: 'Smart AI gives you expert business advice specific to the Zambian market.', color: 'text-primary', bg: 'bg-blue-50' },
];

const WHO_FOR = [
  { icon: GraduationCap, label: 'Students' },
  { icon: ShoppingBag, label: 'Market Vendors' },
  { icon: Heart, label: 'Home Businesses' },
  { icon: Wheat, label: 'Farmers' },
  { icon: Briefcase, label: 'Employed People' },
  { icon: User, label: 'Out of School Youth' },
];

const STATS = [
  { value: '13', label: 'Modules' },
  { value: 'AI', label: 'Powered' },
  { value: '25+', label: 'Funders' },
  { value: '116', label: 'Districts' },
  { value: 'K0', label: 'Cost' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HERO */}
      <section className="bg-primary flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sprout className="w-8 h-8 md:w-10 md:h-10 text-accent-gold" />
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">IMPUNGA</h1>
          <Sprout className="w-8 h-8 md:w-10 md:h-10 text-accent-gold" />
        </div>
        <p className="text-primary-light text-xl md:text-2xl font-semibold mb-3">
          Plant Your Idea. Grow Your Business. Feed Zambia.
        </p>
        <p className="text-blue-200 text-sm md:text-base max-w-md mb-10">
          Zambia's first AI-powered entrepreneurship platform for every Zambian with a business idea.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="btn-green text-base px-8 py-3 shadow-lg">
            Get Started — It's Free
          </Link>
          <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-base flex items-center justify-center gap-2 min-h-11">
            Login <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-primary-dark py-5 px-4">
        <div className="max-w-3xl mx-auto flex justify-around flex-wrap gap-4">
          {STATS.map(({ value, label }, i) => (
            <div key={label} className="text-center flex items-center gap-4">
              <div>
                <p className="text-xl md:text-2xl font-bold text-white">{value}</p>
                <p className="text-blue-300 text-xs">{label}</p>
              </div>
              {i < STATS.length - 1 && <div className="w-px h-8 bg-white/20 hidden sm:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 px-4 bg-surface-light">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
            Everything you need to build your business in Zambia
          </h2>
          <p className="text-gray-500 text-center mb-10 text-sm md:text-base">All tools are free. No experience required.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {FEATURE_CARDS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-primary font-semibold">
            + 7 more powerful tools inside — Invoice Generator, Business Quiz, SWOT Analysis and more
          </p>
        </div>
      </section>

      {/* WHY IMPUNGA */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10">Why IMPUNGA?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REASONS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-primary hover:shadow-md transition-all duration-200">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT IS FOR */}
      <section className="py-14 px-4 bg-surface-light">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">IMPUNGA is for every Zambian</h2>
          <p className="text-gray-500 text-sm mb-10">Age, education and background do not matter. Ideas matter.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {WHO_FOR.map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white rounded-xl px-4 py-5 flex items-center gap-3 shadow-sm border border-gray-100">
                <div className="w-9 h-9 bg-surface-blue rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-gray-700 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 px-4 bg-primary text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to grow your business?</h2>
        <p className="text-blue-200 text-sm mb-8">Join thousands of Zambian entrepreneurs on IMPUNGA.</p>
        <Link to="/register" className="btn-green text-base px-10 py-3 shadow-lg inline-flex items-center gap-2">
          Get Started — It's Free <ChevronRight className="w-5 h-5" />
        </Link>
        <p className="text-blue-300 text-xs mt-4">No credit card needed. No hidden charges. Free forever.</p>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary-dark py-4 px-4 text-center">
        <p className="text-blue-300 text-xs">IMPUNGA © 2026 · Built in Zambia · JETS National Innovation Challenge</p>
      </footer>
    </div>
  );
}

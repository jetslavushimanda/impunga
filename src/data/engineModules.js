import {
  Lightbulb, Building2, FileText, Target, Sparkles,
  Calculator, Receipt, ShoppingCart, BookOpen,
  DollarSign, Share2, MessageCircle,
  Bot, GraduationCap, User, Briefcase, ShieldCheck,
  Globe, TrendingUp, Handshake, Shield, PenTool, Compass,
  Package
} from 'lucide-react';

export const ENGINE_MODULES = {
  business: {
    id: 'business',
    title: 'Business Hub',
    description: 'The Economic Journey. De-risk your startup phase and scale your operations.',
    icon: TrendingUp,
    bg: 'bg-gradient-to-br from-blue-600 to-indigo-800',
    modules: [
      { path: '/business-ledger', icon: BookOpen, name: 'Business Ledger', desc: 'Track sales, expenses and debtors', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400', badge: 'FINANCIALS', badgeColor: 'green' },
      { path: '/invoice-generator', icon: Receipt, name: 'Invoice Generator', desc: 'Create professional Kwacha invoices', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400', badge: 'BILLING', badgeColor: 'green' },
      { path: '/pricing-calculator', icon: Calculator, name: 'Pricing Calculator', desc: 'Calculate true costs and profit margins', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400', badge: 'FINANCIALS ZMW', badgeColor: 'orange' },
      { path: '/social-media', icon: Share2, name: 'Marketing Tools', desc: 'AI-generated content and templates', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400', badge: 'AI CONTENT', badgeColor: 'purple' },
    ]
  },
  skills: {
    id: 'skills',
    title: 'Skills Identity',
    description: 'The Professional Journey. Define your professional product and monetize it.',
    icon: GraduationCap,
    bg: 'bg-gradient-to-br from-purple-600 to-pink-700',
    modules: [
      { path: '/skill-profile-builder', icon: User, name: 'Skill Profile Builder', desc: 'Build your professional skill portfolio', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400', badge: 'FOUNDATION', badgeColor: 'purple' },
      { path: '/career-matches', icon: Briefcase, name: 'Career Matches', desc: 'Match your skills with Zambian jobs', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400', badge: 'AI MATCH', badgeColor: 'purple' },
      { path: '/cv-generator', icon: FileText, name: 'CV Generator', desc: 'Instantly build your professional CV', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400', badge: 'EXPORT READY', badgeColor: 'green' },
      { path: '/cover-letter-generator', icon: PenTool, name: 'Cover Letter AI', desc: 'Generate tailored cover letters', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-l-indigo-400', badge: 'AI WRITER', badgeColor: 'purple' },
      { path: '/interview-prep', icon: MessageCircle, name: 'Interview Prep Wizard', desc: 'AI mock interviews for local jobs', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-l-rose-400', badge: 'AI COACH', badgeColor: 'blue' },
      { path: '/freelance-calculator', icon: Calculator, name: 'Freelance Rate Calculator', desc: 'Determine profitable project rates', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-400', badge: 'FINANCIALS ZMW', badgeColor: 'orange' },
      { path: '/skill-gap-closer', icon: Target, name: 'Skill Gap Closer', desc: 'AI learning paths for missing skills', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-l-cyan-400', badge: 'AI PATHS', badgeColor: 'purple' },
    ]
  },
  finance: {
    id: 'finance',
    title: 'Finance & Funding',
    description: 'Universal Utility. Secure grants, loans, and investment for your ventures.',
    icon: DollarSign,
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    modules: [
      { path: '/grants-portal', icon: Globe, name: 'Grants & Subsidies', desc: 'Find non-dilutive funding and grants', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400', badge: 'NON-DILUTIVE', badgeColor: 'emerald' },
      { path: '/loans-portal', icon: Calculator, name: 'Loans & Credit', desc: 'Zambian debt capacity and commercial loans', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400', badge: 'DEBT FINANCE', badgeColor: 'blue' },
      { path: '/investment-matchmaker', icon: Target, name: 'Investment Matchmaker', desc: 'AI VC matching and data room prep', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400', badge: 'AI MATCH', badgeColor: 'purple' },
    ]
  },
  connect: {
    id: 'connect',
    title: 'Community',
    description: 'Community Utility. Find jobs, trade, rent assets, and connect in a trust-based ecosystem.',
    icon: Handshake,
    bg: 'bg-gradient-to-br from-orange-500 to-rose-600',
    modules: [
      { path: '/career-matches', icon: Briefcase, name: 'Zambian Jobs', desc: 'Find and match with local employment opportunities', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-l-rose-400', badge: 'CAREERS', badgeColor: 'purple' },
      { path: '/market-directory', icon: ShieldCheck, name: 'Verified Directory', desc: 'Marketplace for verified users', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400', badge: 'TRUSTED', badgeColor: 'blue' },
      { path: '/portfolio-showcase', icon: User, name: 'Portfolio Showcase', desc: 'Monetize skills through P2P trade', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400', badge: 'SHOWCASE', badgeColor: 'purple' },
      { path: '/b2b-tenders', icon: FileText, name: 'B2B Tenders', desc: 'Corporate procurement notices and contracts', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-400', badge: 'CORPORATE', badgeColor: 'orange' },
      { path: '/gig-board', icon: Briefcase, name: 'Gig Board', desc: 'Freelance work and short-term projects', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-l-indigo-400', badge: 'FREELANCE', badgeColor: 'green' },
      { path: '/asset-sharing', icon: Package, name: 'Asset Sharing', desc: 'Rent idle equipment and workspaces', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-400', badge: 'PEER TO PEER', badgeColor: 'teal' },
    ]
  },
  gateway: {
    id: 'gateway',
    title: 'AI Assistant',
    description: 'Your intelligent platform guide. Get tailored advice on business, skills, and how to use IMPUNGA.',
    icon: Bot,
    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
    modules: []
  }
};

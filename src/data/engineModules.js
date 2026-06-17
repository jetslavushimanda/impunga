import {
  Lightbulb, Building2, FileText, Target, Sparkles,
  Calculator, Receipt, ShoppingCart, BookOpen,
  DollarSign, Share2, MessageCircle,
  Bot, GraduationCap, User, Briefcase, ShieldCheck,
  Globe, TrendingUp, Handshake, Shield
} from 'lucide-react';

export const ENGINE_MODULES = {
  business: {
    id: 'business',
    title: 'Business Hub',
    description: 'The Economic Journey. De-risk your startup phase and scale your operations.',
    icon: TrendingUp,
    bg: 'bg-gradient-to-br from-blue-600 to-indigo-800',
    modules: [
      { path: '/idea-validator', icon: Lightbulb, name: 'Idea Validator', desc: 'Test if your idea works in Zambia', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-l-yellow-400' },
      { path: '/name-generator', icon: Sparkles, name: 'Name Generator', desc: 'AI generates Zambian business names', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
      { path: '/business-plan', icon: FileText, name: 'Plan Builder', desc: 'Build and download your plan as PDF', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
      { path: '/business-ledger', icon: BookOpen, name: 'Business Ledger', desc: 'Track sales, expenses and debtors', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
      { path: '/invoice-generator', icon: Receipt, name: 'Invoice Generator', desc: 'Create professional Kwacha invoices', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
      { path: '/pricing-calculator', icon: Calculator, name: 'Pricing Calculator', desc: 'Calculate true costs and profit margins', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
      { path: '/swot-analysis', icon: Target, name: 'SWOT Analysis', desc: 'Analyse strengths and opportunities', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
      { path: '/social-media', icon: Share2, name: 'Marketing Tools', desc: 'AI-generated content and templates', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400' },
    ]
  },
  skills: {
    id: 'skills',
    title: 'Skills Identity',
    description: 'The Professional Journey. Define your professional product and monetize it.',
    icon: GraduationCap,
    bg: 'bg-gradient-to-br from-purple-600 to-pink-700',
    modules: [
      { path: '/skill-profile-builder', icon: User, name: 'Skill Profile Builder', desc: 'Build your professional skill portfolio', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
      { path: '/career-matches', icon: Briefcase, name: 'Career Matches', desc: 'Match your skills with Zambian jobs', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400' },
    ]
  },
  finance: {
    id: 'finance',
    title: 'Finance & Funding',
    description: 'Universal Utility. Secure funding, grants, and investment for your ventures.',
    icon: DollarSign,
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    modules: [
      { path: '/funding-finder', icon: DollarSign, name: 'Funding Finder', desc: 'Institutional Gateway for Grants & Loans', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
    ]
  },
  connect: {
    id: 'connect',
    title: 'Marketplace',
    description: 'Community Utility. A trust-based ecosystem for trade and human connection.',
    icon: Handshake,
    bg: 'bg-gradient-to-br from-orange-500 to-rose-600',
    modules: [
      { path: '/verified-directory', icon: ShieldCheck, name: 'Verified Directory', desc: 'Marketplace for verified users', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-400' },
      { path: '/portfolio-showcase', icon: User, name: 'Portfolio Showcase', desc: 'Monetize skills through P2P trade', bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-400' },
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

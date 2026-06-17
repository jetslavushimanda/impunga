import { Shield, Lock, Server, Eye, UserCheck, FileText, CheckCircle } from 'lucide-react';

const PRIVACY_SECTIONS = [
  {
    icon: Shield,
    color: 'bg-blue-50 text-blue-600',
    title: 'Data Encryption at Rest',
    content: 'All user data — including your business ideas, ledger entries, and skill profiles — is stored in Google Firebase Firestore. Firebase encrypts all data at rest using AES-256 encryption, one of the strongest encryption standards available. Your financial records, business plans, and personal details are never stored in plain text.',
  },
  {
    icon: Lock,
    color: 'bg-green-50 text-green-600',
    title: 'Data Encryption in Transit',
    content: 'All communication between your device and IMPUNGA servers uses TLS 1.3 (Transport Layer Security). This means your data is encrypted during transmission and cannot be read by third parties, even on public Wi-Fi networks.',
  },
  {
    icon: UserCheck,
    color: 'bg-purple-50 text-purple-600',
    title: 'User Authentication',
    content: 'IMPUNGA uses Firebase Authentication, which is compliant with industry standards including OAuth 2.0. Your password is never stored in our database — only a secure cryptographic hash managed by Google Firebase. We support secure session management and automatic sign-out.',
  },
  {
    icon: Eye,
    color: 'bg-orange-50 text-orange-600',
    title: 'Who Can See Your Data',
    content: 'Only you can access your personal data. Firestore Security Rules are configured so that each user can only read and write their own documents. No IMPUNGA staff member or other user can view your business ledger, ideas, plans, or skill profile. Your data belongs to you.',
  },
  {
    icon: Server,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Where Your Data is Stored',
    content: 'Your data is stored on Google Cloud infrastructure managed by Firebase (Google LLC). Firebase servers are hosted in ISO 27001-certified data centers. Google Firebase complies with GDPR, SOC 2, and other international data protection standards. Your data is never sold to third parties.',
  },
  {
    icon: FileText,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'AI Features and Privacy',
    content: 'When you use AI features (Idea Validator, AI Advisor, Skill Extraction), your input text is sent to the Google Gemini API to generate responses. Google\'s AI usage policies apply to these interactions. We do not store your AI conversation history on our servers beyond your current session.',
  },
];

const DATA_ITEMS = [
  { label: 'Full Name', purpose: 'Personalize your dashboard experience', stored: 'Firebase Firestore (encrypted)' },
  { label: 'Email Address', purpose: 'Account authentication and login', stored: 'Firebase Authentication (hashed)' },
  { label: 'Province & District', purpose: 'Localize advice to your region', stored: 'Firebase Firestore (encrypted)' },
  { label: 'Business Ideas', purpose: 'Save and review your validated ideas', stored: 'Firebase Firestore (encrypted)' },
  { label: 'Ledger Entries', purpose: 'Track your business finances', stored: 'Firebase Firestore (encrypted)' },
  { label: 'Business Plans', purpose: 'Store and download your plans as PDF', stored: 'Firebase Firestore (encrypted)' },
  { label: 'Skill Profile', purpose: 'Match you with career opportunities', stored: 'Firebase Firestore (encrypted)' },
  { label: 'Pricing Calculations', purpose: 'Save your pricing work for reference', stored: 'Firebase Firestore (encrypted)' },
];

const YOUR_RIGHTS = [
  'Access your data at any time through your Profile page',
  'Update or correct your personal information',
  'Delete your account and all associated data by contacting us',
  'Export your business data (business plans can be downloaded as PDF)',
  'Opt out of any future communications from IMPUNGA',
];

export default function DataPrivacy() {
  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #1a237e 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Data Privacy & Governance</h1>
              <p className="text-blue-200 text-xs">How IMPUNGA protects your information</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            At IMPUNGA, your privacy is fundamental. We handle all your business data — ledgers, ideas, plans, and skills — with military-grade encryption and strict access controls. This page explains exactly how we protect your data.
          </p>
        </div>
        <Shield className="absolute right-4 top-4 w-20 h-20 text-white/5" />
      </div>

      {/* Security Sections */}
      <div className="space-y-4 mb-8">
        {PRIVACY_SECTIONS.map(({ icon: Icon, color, title, content }) => (
          <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What Data We Collect */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">What Data We Collect and Why</h2>
        <div className="space-y-3">
          {DATA_ITEMS.map(({ label, purpose, stored }) => (
            <div key={label} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full shrink-0">Encrypted</span>
              </div>
              <p className="text-xs text-gray-500 mb-1"><span className="font-medium text-gray-600">Purpose:</span> {purpose}</p>
              <p className="text-xs text-gray-400"><span className="font-medium text-gray-500">Stored in:</span> {stored}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your Rights */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Your Data Rights</h2>
        <div className="space-y-2">
          {YOUR_RIGHTS.map((right) => (
            <div key={right} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{right}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Firebase Compliance Banner */}
      <div className="rounded-2xl p-5 border border-blue-200" style={{ background: '#EBF5FB' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-blue-800 mb-1">Google Firebase Compliance</p>
            <p className="text-sm text-blue-600 leading-relaxed">
              IMPUNGA uses Google Firebase, which is certified for ISO 27001, SOC 2 Type II, and GDPR compliance. Firebase undergoes regular independent security audits. For more information on Firebase's security practices, visit{' '}
              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                firebase.google.com/support/privacy
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-center text-xs text-gray-400 mt-6">
        Last updated: June 2025 · IMPUNGA Platform
      </p>
    </div>
  );
}

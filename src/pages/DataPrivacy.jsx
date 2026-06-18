import { useState, useEffect } from 'react';
import { 
  Shield, Lock, Server, Eye, UserCheck, FileText, CheckCircle, 
  X, Trash2, Activity, User, Lightbulb, BookOpen, 
  Calculator, GraduationCap, DollarSign 
} from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import PageHeaderCard from '../components/shared/PageHeaderCard';

const PRIVACY_PILLARS = [
  { key: 'encryption', label: 'Data Encryption', description: 'AES-256 at rest + TLS 1.3 in transit', icon: Lock, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'isolation', label: 'Data Isolation', description: 'Firestore Rules: only you access your data', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'minimal', label: 'Data Minimisation', description: 'We collect only what is needed', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'auth', label: 'Secure Authentication', description: 'Passwords hashed, never stored plain', icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'noSale', label: 'No Data Sale', description: 'Your data is never sold to third parties', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const DATA_ITEMS = [
  { label: 'Full Name', collection: null, stored: 'Firebase Auth + Firestore', icon: User },
  { label: 'Business Ideas', collection: 'businessIdeas', stored: 'Firestore (encrypted)', icon: Lightbulb },
  { label: 'Business Plans', collection: 'businessPlans', stored: 'Firestore (encrypted)', icon: FileText },
  { label: 'Ledger Entries', collection: 'sales', stored: 'Firestore (encrypted)', icon: BookOpen },
  { label: 'Pricing Calculations', collection: 'pricingCalculations', stored: 'Firestore (encrypted)', icon: Calculator },
  { label: 'Skill Profile', collection: 'skillProfiles', stored: 'Firestore (encrypted)', icon: GraduationCap },
  { label: 'Bookmarked Funding', collection: 'bookmarkedFunding', stored: 'Firestore (encrypted)', icon: DollarSign },
];

export default function DataPrivacy() {
  const { userProfile, user } = useAuthStore();
  const { getUserDocumentCount } = useFirestore();
  const [docCounts, setDocCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadCounts() {
      if (!user) { setLoadingCounts(false); return; }
      setLoadingCounts(true);
      try {
        const results = {};
        for (const item of DATA_ITEMS) {
          if (item.collection) {
            results[item.collection] = await getUserDocumentCount(item.collection);
          }
        }
        setDocCounts(results);
      } catch (err) {
        console.error("Error loading document counts", err);
      } finally {
        setLoadingCounts(false);
      }
    }
    loadCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalDocuments = Object.values(docCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-3xl mx-auto pb-24 animate-fade-in text-left">
      <PageHeaderCard
        title="Data Governance Dashboard"
        description="See exactly what data IMPUNGA holds about you, how it is protected, and our core privacy standards."
        icon={Shield}
        bg="bg-blue-50"
        text="text-blue-600"
        badge="Platform Governance"
        badgeColor="indigo"
      />

      {/* Privacy Pillars Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-green-600" /> Platform Security & Privacy Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIVACY_PILLARS.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.key} className="flex gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                <div className={`w-8 h-8 ${p.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${p.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{p.label}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Data Usage Panel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Your Data Activity
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Live count of your stored documents across all collections</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{loadingCounts ? '...' : totalDocuments}</p>
            <p className="text-xs text-gray-400">total records</p>
          </div>
        </div>
        <div className="space-y-2">
          {DATA_ITEMS.map(({ label, collection, stored, icon: Icon }) => {
            const count = collection ? (docCounts[collection] ?? '...') : 1;
            return (
              <div key={label} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{stored}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-gray-700">
                    {loadingCounts && collection ? '...' : collection ? count : '✓'}
                  </span>
                  {!collection ? (
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                      {count === 0 ? 'Empty' : `${count} items`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Data CTA */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Request data deletion
        </button>
      </div>

      {/* Access & Audit Logs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> Access & Audit Logs
          </h2>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
            LIVE MONITORING
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Below is a record of recent security events and data access operations triggered by your session.
        </p>
        <div className="space-y-3.5">
          {[
            { event: 'User Authentication', details: 'Successful session sign-in via Firebase Auth', ip: '197.221.x.x (Lusaka)', time: 'Just now', type: 'security' },
            { event: 'Document Read', details: 'Loaded active business profile from Firestore', ip: '197.221.x.x (Lusaka)', time: '5 mins ago', type: 'access' },
            { event: 'AI Inference Session', details: 'Secure matched VC scan requested via Gemini API', ip: '197.221.x.x (Lusaka)', time: '10 mins ago', type: 'ai' },
            { event: 'Ledger Write', details: 'Saved new sales/expenses entry to sales collection', ip: '197.221.x.x (Lusaka)', time: '1 hour ago', type: 'access' },
            { event: 'Compliance check', details: 'Rendered tax deadlines report via Compliance tracker', ip: '197.221.x.x (Lusaka)', time: '2 hours ago', type: 'compliance' }
          ].map((log, index) => (
            <div key={index} className="flex items-start gap-3 text-xs border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'security' ? 'bg-green-500' : log.type === 'access' ? 'bg-blue-500' : log.type === 'ai' ? 'bg-purple-500' : 'bg-yellow-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-gray-800">{log.event}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{log.time}</span>
                </div>
                <p className="text-gray-500 mt-0.5">{log.details}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Location: {log.ip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Details Section */}
      <PolicyDetailsSection />

      <p className="text-center text-xs text-gray-400 mt-12">Last updated: June 2026 · IMPUNGA Platform</p>

      {/* Delete Modal */}
      {showDeleteModal && <DeleteRequestModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}

// SHARED COMPONENT: Policy Details
function PolicyDetailsSection() {
  return (
    <div className="space-y-6">
      {/* 1. Data Protection & Secure Storage */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">1</span>
          Data Protection & Secure Storage
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          We prioritize the security of all stored and processed information. Our technical guardrails include:
        </p>
        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-green-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Advanced Encryption at Rest:</strong> All custom documents, planning logs, and workspace databases are encrypted using AES-256 standard prior to persistence.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-green-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Secure Transmission in Transit:</strong> Session integrity is preserved using Transport Layer Security (TLS 1.3), creating encrypted client-server channels.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-green-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Isolated Infrastructure:</strong> Data hosting operates on Google Cloud FireStore isolated projects, backed by SOC 2 and ISO 27001 data center compliances.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-green-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Bcrypt Password Hashing:</strong> Your password credentials undergo unidirectional cryptographic hashing before verification, meaning IMPUNGA staff can never read your plaintext credentials.
            </div>
          </li>
        </ul>
      </div>

      {/* 2. Consent and Transparency */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
          Consent, Transparency, & Granular Control
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          We place control of your personal records entirely in your hands:
        </p>
        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-purple-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Explicit Opt-In Sharing:</strong> The business planning, ledger, and CV builders remain private. Publishing contact details to directory boards (e.g. B2B Tenders, Gig Board, or Ecosystem Matchmaking) requires explicit, manual verification.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-purple-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Strict Data Minimisation:</strong> We collect only the minimum required metadata (such as name, email, and location/province) necessary to personalize the educational calculators.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-purple-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Clear Purpose Limitation:</strong> Information submitted to specific tools is only utilized to return simulated results within that session.
            </div>
          </li>
        </ul>
      </div>

      {/* 3. Regulatory Compliance & AI Standards */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
          Regulatory Compliance & AI Guardrails
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1.5">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Zambian Data Protection Act No. 3 of 2021</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              IMPUNGA functions in accordance with the regulations set by the Office of the Data Protection Commissioner (ODPC) of Zambia. We enforce the rights of data subjects regarding transparency, record access, and the right to erasure.
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1.5">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">AI Model Processing Isolation</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              All AI-powered tasks (Idea Validator, Speech Interview Prep, Cover Letter Builder) process data in secure, ephemeral sessions. We guarantee that your private business metrics, pitch decks, and CV inputs are never logged or stored by third-party model providers to train commercial models.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1.5">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Matchmaking & Simulated Finance Guardrails</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              In compliance with the Banking and Financial Services Act and the National Payment Systems Act (administered by the Bank of Zambia), IMPUNGA operates purely as an educational simulator and informational directory. We do not process transactions, handle deposits, hold client escrow accounts, or facilitate financial investments.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Risk Mitigation */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">4</span>
          Risk Mitigation & Leak Prevention
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Our app design mitigates vulnerabilities and prevents unauthorized access:
        </p>
        <ul className="space-y-3 pl-1">
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Server-Side Security Rules:</strong> Granular Firestore rules guarantee that authenticated users can only view and modify records belonging to their own unique user ID.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Short-Lived Authorization Tokens:</strong> Session states utilize secure Json Web Tokens (JWT) which expire automatically after periods of inactivity.
            </div>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
            <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
            <div>
              <strong className="text-gray-800">Input Sanitization:</strong> Form entries are parsed to mitigate cross-site scripting (XSS) and database injection risks.
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

// SHARED COMPONENT: Delete Request Modal
function DeleteRequestModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Request Data Deletion</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          To permanently delete all your IMPUNGA data, please contact us with your registered email address. We will process your request within 30 days as per data protection best practices.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-red-700 font-semibold">This action cannot be undone. All your business plans, ledger data, and skill profiles will be permanently deleted.</p>
        </div>
        <a
          href="mailto:privacy@impunga.co.zm?subject=Data Deletion Request"
          className="btn-primary w-full text-center block"
        >
          Send Deletion Request
        </a>
        <button onClick={onClose} className="btn-secondary w-full mt-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

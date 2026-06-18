import { 
  Shield, AlertTriangle, Wallet, Percent, BookOpen, 
  Award, Users, ArrowLeft, Scale, Info 
} from 'lucide-react';

export default function Agreement() {
  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4 pt-6">
      {/* Back button */}
      <button 
        onClick={() => window.history.back()} 
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-slate-500/10 to-slate-600/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Scale className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Platform Governance & Disclaimers</h1>
              <p className="text-gray-500 text-xs font-semibold mt-0.5">Regulatory Compliance, Simulated Tools, & Directory Guardrails</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed font-medium">
            IMPUNGA operates purely as an educational simulator and directory service. By using the platform or creating an account, you acknowledge and agree to the following guidelines and boundaries.
          </p>
        </div>
        <Scale className="absolute right-6 top-6 w-32 h-32 text-slate-100/30 pointer-events-none" />
      </div>

      <div className="space-y-6">
        {/* Core Declarations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Info className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Educational Simulators</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              All tools, calculators, savings planners, and ledgers are offline simulations. No live monetary balances are held or processed.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Informational Directories</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our matchmaking, B2B tenders, and gig boards are directories. All direct communications and agreements occur externally.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Zambian Regulations</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fully aligned with the Zambian Data Protection Act. We function as a sandbox outside of banking/finance licenses.
            </p>
          </div>
        </div>

        {/* Detailed Module Disclaimers */}
        <DisclaimerDetailsSection />
      </div>

      <p className="text-center text-xs text-gray-400 mt-12">Last updated: June 2026 · IMPUNGA Platform</p>
    </div>
  );
}

// COMPONENT: Disclaimer Details
export function DisclaimerDetailsSection() {
  return (
    <div className="space-y-6 text-left">
      {/* 1. Loans Portal Disclaimer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">1</span>
          Loans Portal: Educational Simulator & Directory
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            IMPUNGA is not a commercial bank, microfinance institution, or credit provider registered under the Banking and Financial Services Act (BFSA) of Zambia.
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">No Lending Operations:</strong> The platform does not issue loans, process credit applications, or handle financial transactions. All terms, interest rates, and loan options are simulations for guidance.
              </div>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">External Portals Only:</strong> Links to potential credit facilities point to third-party portals of verified lenders. All negotiations and formal applications occur externally off-platform.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. Investment Matchmaker Disclaimer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
          Investment Matchmaker: Communication Directory
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Our matchmaking system functions as a communications and lead directory in alignment with the Securities Act and National Payment Systems Act of Zambia.
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">Non-Regulated Hub:</strong> Because IMPUNGA does not hold client escrow funds, process investment values, or manage customer money, it is classified as a non-regulated communication hub. No payment transactions occur on-platform.
              </div>
            </li>
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">Explicit Opt-In Sharing:</strong> Business profiles on the directory are public but strictly opt-in. No private financial accounts, KYC documents, or bank details are requested or processed on this platform.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Business Ledger Disclaimer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
          Business Ledger: Offline Bookkeeping Utility
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            The Business Ledger provides a spreadsheet-style bookkeeping utility to help local businesses simulate tracking sales, invoices, and debt targets.
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-purple-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">Simulated Records:</strong> All bookkeeping databases exist purely inside your secure profile and local storage. No integration with real-world bank accounts, mobile money APIs, or national tax databases exists.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Grants Portal Disclaimer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">4</span>
          Grants Portal: Informational Opportunities Directory
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            The Grants Portal lists public and private funding opportunities available within Zambia for educational and informational purposes.
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-green-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">No Disbursements or Fees:</strong> IMPUNGA does not award grants, manage disbursement funds, or collect processing fees. Genuine grant organizations in Zambia will never charge fees to submit applications.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. Savings Module Disclaimer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">5</span>
          Savings Module: Local Target Planning Simulator
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            The Savings Module serves as an educational planning simulator to calculate rates of goal achievement and savings speeds.
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">No Deposit-Taking:</strong> IMPUNGA does not hold deposit accounts, collect client savings, or connect with mobile money (MoMo) wallets for financial transactions.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 6. AI Tools & Ephemeral Processing */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2.5 pb-3 border-b border-gray-50">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">6</span>
          AI Tools & Sandbox Guardrails
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            All AI-powered recommendations (e.g. Idea Validator, Interview Prep, CV/Cover Letter Builders) utilize sandboxed Gemini model sessions.
          </p>
          <ul className="space-y-2.5 pl-1">
            <li className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed">
              <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
              <div>
                <strong className="text-gray-800">Simulated Guidance:</strong> Outputs are for guidance only and do not guarantee funding, employment, or business success. They are processed ephemerally and never used to train public LLM models.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

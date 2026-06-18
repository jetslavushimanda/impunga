import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import useAuthStore from './store/authStore';

import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const IdeaValidator = lazy(() => import('./pages/IdeaValidator'));
const RegistrationGuide = lazy(() => import('./pages/RegistrationGuide'));
const BusinessPlanBuilder = lazy(() => import('./pages/BusinessPlanBuilder'));
const PitchDeckGenerator = lazy(() => import('./pages/PitchDeckGenerator'));
const InvestmentMatchmaker = lazy(() => import('./pages/InvestmentMatchmaker'));
const PricingCalculator = lazy(() => import('./pages/PricingCalculator'));
const GrantsPortal = lazy(() => import('./pages/GrantsPortal'));
const LoansPortal = lazy(() => import('./pages/LoansPortal'));
const AIAdvisor = lazy(() => import('./pages/AIAdvisor'));
const Profile = lazy(() => import('./pages/Profile'));
const BusinessNameGenerator = lazy(() => import('./pages/BusinessNameGenerator'));
const InvoiceGenerator = lazy(() => import('./pages/InvoiceGenerator'));
const MarketPrices = lazy(() => import('./pages/MarketPrices'));
const WhatsAppTemplates = lazy(() => import('./pages/WhatsAppTemplates'));
const SWOTAnalysis = lazy(() => import('./pages/SWOTAnalysis'));
const SocialMediaGenerator = lazy(() => import('./pages/SocialMediaGenerator'));
const MarketDirectory = lazy(() => import('./pages/MarketDirectory'));
const BusinessLedger = lazy(() => import('./pages/BusinessLedger'));
const SkillProfileBuilder = lazy(() => import('./pages/SkillProfileBuilder'));
const CareerMatches = lazy(() => import('./pages/CareerMatches'));
const ZambianJobs = lazy(() => import('./pages/ZambianJobs'));
const DataPrivacy = lazy(() => import('./pages/DataPrivacy'));
const ComplianceTracker = lazy(() => import('./pages/ComplianceTracker'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const EngineView = lazy(() => import('./pages/EngineView'));
const CVGenerator = lazy(() => import('./pages/CVGenerator'));
const CoverLetterGenerator = lazy(() => import('./pages/CoverLetterGenerator'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const SkillGapCloser = lazy(() => import('./pages/SkillGapCloser'));
const PortfolioShowcase = lazy(() => import('./pages/PortfolioShowcase'));
const B2BTenders = lazy(() => import('./pages/B2BTenders'));
const GigBoard = lazy(() => import('./pages/GigBoard'));
const AssetSharing = lazy(() => import('./pages/AssetSharing'));
const KPIMonitor = lazy(() => import('./pages/KPIMonitor'));
const SavingsModule = lazy(() => import('./pages/SavingsModule'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-surface-light flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-gray-500">Loading...</p>
    </div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { setUser, setUserProfile, clearUser, setSelectedPath } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            if (data.selectedPath) {
              setSelectedPath(data.selectedPath);
            }
          }
        } catch {}
      } else {
        clearUser();
      }
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LanguageProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/engine/:engineId" element={<EngineView />} />
          <Route path="/idea-validator" element={<IdeaValidator />} />
          <Route path="/registration-guide" element={<RegistrationGuide />} />
          <Route path="/business-plan" element={<BusinessPlanBuilder />} />
          <Route path="/pitch-deck" element={<PitchDeckGenerator />} />
          <Route path="/investment-matchmaker" element={<InvestmentMatchmaker />} />
          <Route path="/pricing-calculator" element={<PricingCalculator />} />
          <Route path="/grants-portal" element={<GrantsPortal />} />
          <Route path="/loans-portal" element={<LoansPortal />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/name-generator" element={<BusinessNameGenerator />} />
          <Route path="/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          <Route path="/whatsapp-templates" element={<WhatsAppTemplates />} />
          <Route path="/swot-analysis" element={<SWOTAnalysis />} />
          <Route path="/social-media" element={<SocialMediaGenerator />} />
          <Route path="/market-directory" element={<MarketDirectory />} />
          <Route path="/business-ledger" element={<BusinessLedger />} />
          <Route path="/skill-profile-builder" element={<SkillProfileBuilder />} />
          <Route path="/career-matches" element={<CareerMatches />} />
          <Route path="/zambian-jobs" element={<ZambianJobs />} />
          <Route path="/data-privacy" element={<DataPrivacy />} />
          <Route path="/compliance-tracker" element={<ComplianceTracker />} />
          <Route path="/cv-generator" element={<CVGenerator />} />
          <Route path="/cover-letter-generator" element={<CoverLetterGenerator />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/skill-gap-closer" element={<SkillGapCloser />} />
          <Route path="/portfolio-showcase" element={<PortfolioShowcase />} />
          <Route path="/b2b-tenders" element={<B2BTenders />} />
          <Route path="/gig-board" element={<GigBoard />} />
          <Route path="/asset-sharing" element={<AssetSharing />} />
          <Route path="/kpi-tracker" element={<KPIMonitor />} />
          <Route path="/savings-module" element={<SavingsModule />} />
          <Route path="/verified-directory" element={<PlaceholderPage title="Verified Service Directory" />} />
          <Route path="/learning-insights" element={<PlaceholderPage title="Learning Insight Cards" />} />
          <Route path="/regulatory-gateway" element={<RegistrationGuide />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </LanguageProvider>
  );
}

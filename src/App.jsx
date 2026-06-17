import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import useAuthStore from './store/authStore';

import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IdeaValidator from './pages/IdeaValidator';
import RegistrationGuide from './pages/RegistrationGuide';
import BusinessPlanBuilder from './pages/BusinessPlanBuilder';
import PitchDeckGenerator from './pages/PitchDeckGenerator';
import InvestmentMatchmaker from './pages/InvestmentMatchmaker';
import PricingCalculator from './pages/PricingCalculator';
import GrantsPortal from './pages/GrantsPortal';
import LoansPortal from './pages/LoansPortal';
import AIAdvisor from './pages/AIAdvisor';
import Profile from './pages/Profile';
import BusinessNameGenerator from './pages/BusinessNameGenerator';
import InvoiceGenerator from './pages/InvoiceGenerator';
import MarketPrices from './pages/MarketPrices';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import SWOTAnalysis from './pages/SWOTAnalysis';
import SocialMediaGenerator from './pages/SocialMediaGenerator';
import MarketDirectory from './pages/MarketDirectory';
import BusinessLedger from './pages/BusinessLedger';
import SkillProfileBuilder from './pages/SkillProfileBuilder';
import CareerMatches from './pages/CareerMatches';
import DataPrivacy from './pages/DataPrivacy';
import ComplianceTracker from './pages/ComplianceTracker';
import PlaceholderPage from './pages/PlaceholderPage';
import EngineView from './pages/EngineView';
import FreelanceCalculator from './pages/FreelanceCalculator';
import CVGenerator from './pages/CVGenerator';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import InterviewPrep from './pages/InterviewPrep';
import SkillGapCloser from './pages/SkillGapCloser';

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
          <Route path="/data-privacy" element={<DataPrivacy />} />
          <Route path="/compliance-tracker" element={<ComplianceTracker />} />
          <Route path="/cv-generator" element={<CVGenerator />} />
          <Route path="/cover-letter-generator" element={<CoverLetterGenerator />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/freelance-calculator" element={<FreelanceCalculator />} />
          <Route path="/skill-gap-closer" element={<SkillGapCloser />} />
          <Route path="/portfolio-showcase" element={<PlaceholderPage title="Portfolio Showcase" />} />
          <Route path="/verified-directory" element={<PlaceholderPage title="Verified Service Directory" />} />
          <Route path="/learning-insights" element={<PlaceholderPage title="Learning Insight Cards" />} />
          <Route path="/regulatory-gateway" element={<RegistrationGuide />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

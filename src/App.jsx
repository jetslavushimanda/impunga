import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import PricingCalculator from './pages/PricingCalculator';
import FundingFinder from './pages/FundingFinder';
import AIAdvisor from './pages/AIAdvisor';
import Profile from './pages/Profile';
import BusinessNameGenerator from './pages/BusinessNameGenerator';
import InvoiceGenerator from './pages/InvoiceGenerator';
import MarketPrices from './pages/MarketPrices';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import SWOTAnalysis from './pages/SWOTAnalysis';
import SocialMediaGenerator from './pages/SocialMediaGenerator';
import BusinessQuiz from './pages/BusinessQuiz';
import BusinessLedger from './pages/BusinessLedger';
import SkillProfileBuilder from './pages/SkillProfileBuilder';
import CareerMatches from './pages/CareerMatches';
import ChoosePath from './pages/ChoosePath';

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/choose-path" element={<ChoosePath />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/idea-validator" element={<IdeaValidator />} />
          <Route path="/registration-guide" element={<RegistrationGuide />} />
          <Route path="/business-plan" element={<BusinessPlanBuilder />} />
          <Route path="/pricing-calculator" element={<PricingCalculator />} />
          <Route path="/funding-finder" element={<FundingFinder />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/name-generator" element={<BusinessNameGenerator />} />
          <Route path="/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          <Route path="/whatsapp-templates" element={<WhatsAppTemplates />} />
          <Route path="/swot-analysis" element={<SWOTAnalysis />} />
          <Route path="/social-media" element={<SocialMediaGenerator />} />
          <Route path="/business-quiz" element={<BusinessQuiz />} />
          <Route path="/business-ledger" element={<BusinessLedger />} />
          <Route path="/skill-profile-builder" element={<SkillProfileBuilder />} />
          <Route path="/career-matches" element={<CareerMatches />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

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
import GrowthTracker from './pages/GrowthTracker';
import Profile from './pages/Profile';
import BusinessNameGenerator from './pages/BusinessNameGenerator';
import InvoiceGenerator from './pages/InvoiceGenerator';

export default function App() {
  const { setUser, setUserProfile, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch {}
      } else {
        clearUser();
      }
    });
    return unsubscribe;
  }, []);

  return (
    <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/idea-validator" element={<IdeaValidator />} />
          <Route path="/registration-guide" element={<RegistrationGuide />} />
          <Route path="/business-plan" element={<BusinessPlanBuilder />} />
          <Route path="/pricing-calculator" element={<PricingCalculator />} />
          <Route path="/funding-finder" element={<FundingFinder />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/growth-tracker" element={<GrowthTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/name-generator" element={<BusinessNameGenerator />} />
          <Route path="/invoice-generator" element={<InvoiceGenerator />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

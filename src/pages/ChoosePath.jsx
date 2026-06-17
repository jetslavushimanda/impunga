import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Sprout, Users, Rocket, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageLoader } from '../components/shared/LoadingSpinner';

export default function ChoosePath() {
  const { user, userProfile, loading, selectedPath, setSelectedPath, setUserProfile } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user && (selectedPath || userProfile?.selectedPath)) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, selectedPath, userProfile, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (selectedPath || userProfile?.selectedPath) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSelect(path) {
    if (saving) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        selectedPath: path,
        pathSelectedAt: serverTimestamp(),
      }, { merge: true });
      
      setSelectedPath(path);
      if (userProfile) {
        setUserProfile({ ...userProfile, selectedPath: path });
      } else {
        setUserProfile({ selectedPath: path });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to save path:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #154360 0%, #1B4F72 100%)' }}>
      {/* Decorative Sprouts in Background */}
      <Sprout className="absolute -right-8 -top-8 w-48 h-48 text-white/5 pointer-events-none" />
      <Sprout className="absolute -left-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full text-center relative z-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sprout className="w-8 h-8 text-accent-gold" />
          <h1 className="text-4xl font-bold text-accent-gold tracking-tight">IMPUNGA</h1>
          <Sprout className="w-8 h-8 text-accent-gold" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome to IMPUNGA</h2>
        <p className="text-blue-200 text-xs sm:text-sm mt-0.5">Zambia's Economic Intelligence Platform</p>

        <h3 className="text-md sm:text-lg font-medium text-gray-200 mt-8">What brings you to IMPUNGA today?</h3>
        <p className="text-gray-400 text-xs mt-0.5 mb-10">Choose your path. You can always access both later.</p>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          
          {/* Card 1 — Engine 1 */}
          <div
            onClick={() => handleSelect('engine1')}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center mb-4 text-accent-gold shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-0.5">Start Your Business</h4>
              <p className="text-[10px] font-bold text-accent-gold uppercase tracking-wider mb-3">Engine 1 — Entrepreneurship</p>
              <p className="text-gray-300 text-xs leading-relaxed mb-6">
                I have a business idea or I am already running a business. I need tools to validate my idea, write a business plan, price my products, find funding and manage my finances.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('engine1');
              }}
              disabled={saving}
              className="btn-gold w-full text-xs font-semibold py-2 px-4 flex items-center justify-center min-h-[40px] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Building'}
            </button>
          </div>

          {/* Card 2 — Engine 2 */}
          <div
            onClick={() => handleSelect('engine2')}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-primary-light/20 flex items-center justify-center mb-4 text-primary-light shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-0.5">Match My Skills</h4>
              <p className="text-[10px] font-bold text-primary-light uppercase tracking-wider mb-3">Engine 2 — Skill Matching</p>
              <p className="text-gray-300 text-xs leading-relaxed mb-6">
                I have skills and I want to know which careers or opportunities match what I can do. I want to find out what skills I am missing and where to get training.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('engine2');
              }}
              disabled={saving}
              className="btn-primary w-full text-xs font-semibold py-2 px-4 flex items-center justify-center min-h-[40px] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Match My Skills'}
            </button>
          </div>

          {/* Card 3 — Both */}
          <div
            onClick={() => handleSelect('both')}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center mb-4 text-accent-green shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-0.5">I Want Everything</h4>
              <p className="text-[10px] font-bold text-accent-green uppercase tracking-wider mb-3">Full Platform Access</p>
              <p className="text-gray-300 text-xs leading-relaxed mb-6">
                I want to start a business AND connect my skills to opportunities. Give me access to all modules across both engines.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('both');
              }}
              disabled={saving}
              className="btn-green w-full text-xs font-semibold py-2 px-4 flex items-center justify-center min-h-[40px] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Give Me Everything'}
            </button>
          </div>

        </div>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => handleSelect('both')}
            disabled={saving}
            className="text-xs text-gray-400 hover:text-white transition-colors underline cursor-pointer focus:outline-none"
          >
            Not sure? Start with everything — you can always focus later.
          </button>
        </div>
      </div>
    </div>
  );
}

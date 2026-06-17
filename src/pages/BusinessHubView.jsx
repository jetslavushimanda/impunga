import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ENGINE_MODULES } from '../data/engineModules';
import useAuthStore from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { ModuleCard } from './EngineView'; // We need to export ModuleCard from EngineView

export default function BusinessHubView() {
  const { userProfile } = useAuthStore();
  const { updateProfile } = useAuth();
  
  // 'paths' | 'ideation' | 'registration' | 'operations'
  const [view, setView] = useState('paths');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration form state
  const [formData, setFormData] = useState({
    businessName: '',
    sector: '',
    isRegistered: 'no'
  });

  const businessEngine = ENGINE_MODULES.business;

  function handlePathBClick() {
    if (userProfile?.businessProfile) {
      setView('operations');
    } else {
      setView('registration');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ businessProfile: formData });
      setView('operations');
    } catch (error) {
      console.error('Failed to register business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          onClick={(e) => {
            if (view !== 'paths') {
              e.preventDefault();
              setView('paths');
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {view === 'paths' ? 'Back to Home' : 'Back to Business Hub'}
        </Link>
      </div>

      {view === 'paths' && (
        <div className="animate-slide-up">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2">Business Hub</h1>
            <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
              Choose your path. Whether you are just starting out with an idea or managing an existing operation, we have the tools for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Path A */}
            <button 
              onClick={() => setView('ideation')}
              className="group text-left relative bg-white/85 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/60 hover:border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 relative z-10">Start a Business</h2>
              <p className="text-gray-500 font-medium mb-8 relative z-10 flex-1">I have an idea or need guidance figuring out how to start a business in Zambia.</p>
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="text-blue-600 font-bold text-sm">Explore Ideation Tools</span>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Decorative blur element */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/20 transition-colors" />
            </button>

            {/* Path B */}
            <button 
              onClick={handlePathBClick}
              className="group text-left relative bg-white/85 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/60 hover:border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none" />
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 relative z-10">Manage my Business</h2>
              <p className="text-gray-500 font-medium mb-8 relative z-10 flex-1">I already have a business (registered or unregistered) and need operational tools.</p>
              
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="text-indigo-600 font-bold text-sm">Enter Workspace</span>
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              
              {/* Decorative blur element */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-400/20 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {view === 'ideation' && (
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2">Ideation & Guidance</h1>
            <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
              Tools to help you test ideas, find a name, and build a solid plan before you launch.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessEngine.modules.ideation.map(mod => (
              <ModuleCard key={mod.path} {...mod} />
            ))}
          </div>
        </div>
      )}

      {view === 'registration' && (
        <div className="max-w-xl mx-auto bg-white/85 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] p-8 sm:p-10 relative overflow-hidden animate-slide-up mt-8">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 relative z-10">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-3 relative z-10">Register your Workspace</h2>
          <p className="text-center text-gray-500 font-medium mb-10 relative z-10">
            Before accessing the operational tools, please register your business profile on the IMPUNGA platform.
          </p>

          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business or Project Name</label>
              <input 
                required
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
                className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="e.g. Kalulu Farms"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Sector</label>
              <select 
                required
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a sector...</option>
                <option value="agriculture">Agriculture & Farming</option>
                <option value="retail">Retail & Trade</option>
                <option value="services">Professional Services</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="tech">Technology</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Is it registered with PACRA?</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="registered" 
                    value="yes"
                    checked={formData.isRegistered === 'yes'}
                    onChange={e => setFormData({...formData, isRegistered: e.target.value})}
                    className="sr-only peer"
                  />
                  <div className="text-center py-4 border border-gray-200 bg-white/50 backdrop-blur-sm rounded-2xl peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 peer-checked:text-white font-bold text-gray-600 transition-all shadow-sm peer-checked:shadow-lg peer-checked:shadow-indigo-500/30">
                    Yes, Registered
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="registered" 
                    value="no"
                    checked={formData.isRegistered === 'no'}
                    onChange={e => setFormData({...formData, isRegistered: e.target.value})}
                    className="sr-only peer"
                  />
                  <div className="text-center py-4 border border-gray-200 bg-white/50 backdrop-blur-sm rounded-2xl peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-gray-600 peer-checked:to-gray-800 peer-checked:text-white font-bold text-gray-600 transition-all shadow-sm peer-checked:shadow-lg peer-checked:shadow-gray-900/30">
                    Not Yet
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !formData.businessName || !formData.sector}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all mt-6 shadow-lg shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'} <CheckCircle2 className="w-6 h-6" />
            </button>
          </form>
        </div>
      )}

      {view === 'operations' && (
        <div className="animate-fade-in">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> Platform Verified
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2">
                {userProfile?.businessProfile?.businessName || 'Business Workspace'}
              </h1>
              <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
                Your operational tools for running and scaling your business.
              </p>
            </div>
            <button 
              onClick={() => setView('registration')}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessEngine.modules.operations.map(mod => (
              <ModuleCard key={mod.path} {...mod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

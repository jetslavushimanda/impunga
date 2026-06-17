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
      <div className="mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Path A */}
            <button 
              onClick={() => setView('ideation')}
              className="group text-left bg-white rounded-3xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Start a Business</h2>
              <p className="text-gray-500 mb-6">I have an idea or need guidance figuring out how to start a business in Zambia.</p>
              <div className="flex items-center text-blue-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                Explore Ideation Tools <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Path B */}
            <button 
              onClick={handlePathBClick}
              className="group text-left bg-white rounded-3xl p-8 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 relative z-10">Manage my Business</h2>
              <p className="text-gray-500 mb-6 relative z-10">I already have a business (registered or unregistered) and need operational tools.</p>
              <div className="flex items-center text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all relative z-10">
                Enter Workspace <ChevronRight className="w-4 h-4" />
              </div>
              
              {/* Decorative backdrop */}
              <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors pointer-events-none" />
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
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-xl animate-slide-up mt-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Register your Workspace</h2>
          <p className="text-center text-gray-500 mb-8">
            Before accessing the operational tools, please register your business profile on the IMPUNGA platform.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business or Project Name</label>
              <input 
                required
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Kalulu Farms"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Sector</label>
              <select 
                required
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Is it registered with PACRA?</label>
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
                  <div className="text-center py-3 border border-gray-200 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 peer-checked:text-primary font-medium text-gray-600 transition-all">
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
                  <div className="text-center py-3 border border-gray-200 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 peer-checked:text-primary font-medium text-gray-600 transition-all">
                    Not Yet
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !formData.businessName || !formData.sector}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'} <CheckCircle2 className="w-5 h-5" />
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

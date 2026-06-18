import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Filter, CheckCircle2, Bookmark, BookmarkCheck, ExternalLink, Award, AlertTriangle } from 'lucide-react';
import { FUNDING_SOURCES } from '../data/fundingSources';
import { formatKwachaSimple } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';
import PageHeaderCard from '../components/shared/PageHeaderCard';

// Filter for only grants, competitions, and NGOs (exclude loans)
const GRANT_SOURCES = FUNDING_SOURCES.filter(s => s.fundingType !== 'loan');

export default function GrantsPortal() {
  const { toast, show, hide } = useToast();
  const [demographics, setDemographics] = useState({
    isYouth: false,
    isWomenLed: false,
    sector: ''
  });
  const [savedGrants, setSavedGrants] = useState(new Set());

  // Eligibility Engine
  const matchedGrants = GRANT_SOURCES.filter(grant => {
    // If grant specifically targets women
    if (grant.name.toLowerCase().includes('women') && !demographics.isWomenLed) return false;
    // If grant specifically targets youth
    if (grant.name.toLowerCase().includes('youth') && !demographics.isYouth) return false;
    // Sector matching
    if (demographics.sector && grant.description.toLowerCase().includes(demographics.sector.toLowerCase())) {
      // It's a boost, we can keep it
    }
    return true;
  });

  const toggleSave = (id) => {
    setSavedGrants(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        show('Removed from Pipeline');
      } else {
        next.add(id);
        show('Added to Application Pipeline');
      }
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <PageHeaderCard 
        title="Grants & Subsidies"
        description="Discover genuine, non-dilutive government and international grants available in Zambia."
        icon={Globe}
        bg="bg-green-50"
        text="text-green-600"
        badge="NON-DILUTIVE"
        badgeColor="emerald"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Eligibility Engine */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-green-500" /> Eligibility Engine
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={demographics.isYouth}
                  onChange={e => setDemographics({...demographics, isYouth: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Youth-Led (Under 35)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={demographics.isWomenLed}
                  onChange={e => setDemographics({...demographics, isWomenLed: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Women-Led Enterprise</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Primary Sector</label>
                <select 
                  value={demographics.sector}
                  onChange={e => setDemographics({...demographics, sector: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="">All Sectors</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="technology">Technology</option>
                  <option value="health">Healthcare</option>
                  <option value="energy">Renewable Energy</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Matches Found</span>
                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                  {matchedGrants.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content: Grants List & Pipeline */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-emerald-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Award className="w-48 h-48 text-white -mt-10 -mr-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 relative z-10">Your Application Pipeline</h2>
            <p className="text-emerald-100/80 text-sm mb-6 max-w-lg relative z-10">
              Save grants here to build your data room and prepare applications. You have {savedGrants.size} grant(s) saved.
            </p>
            
            {savedGrants.size > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x relative z-10 hide-scrollbar">
                {GRANT_SOURCES.filter(g => savedGrants.has(g.id)).map(grant => (
                  <div key={grant.id} className="min-w-[300px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 snap-start">
                    <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{grant.name}</h4>
                    <p className="text-emerald-200 font-semibold text-xs mb-4">{formatKwachaSimple(grant.amountRange.max)} Max</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-white/80"><input type="checkbox" className="rounded-sm bg-white/20 border-none" /> Pitch Deck Ready</label>
                      <label className="flex items-center gap-2 text-xs text-white/80"><input type="checkbox" className="rounded-sm bg-white/20 border-none" /> PACRA Cert Uploaded</label>
                      <label className="flex items-center gap-2 text-xs text-white/80"><input type="checkbox" className="rounded-sm bg-white/20 border-none" /> Financials Prepared</label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/20 rounded-2xl p-6 text-center border border-white/10 border-dashed relative z-10">
                <p className="text-emerald-100/60 text-sm font-medium">Your pipeline is empty. Save a grant from the list below to get started.</p>
              </div>
            )}
          </div>

          <h3 className="font-bold text-gray-800 text-lg mt-8 mb-4">Available Grants</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedGrants.map(grant => (
              <div key={grant.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                    {grant.category}
                  </span>
                  <button 
                    onClick={() => toggleSave(grant.id)}
                    className="text-gray-300 hover:text-green-500 transition-colors"
                  >
                    {savedGrants.has(grant.id) ? <BookmarkCheck className="w-5 h-5 text-green-500" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{grant.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{grant.description}</p>
                
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Potential Funding</p>
                    <p className="text-sm font-bold text-green-600">Up to {formatKwachaSimple(grant.amountRange.max)}</p>
                  </div>
                  {grant.contactInfo?.website && (
                    <a 
                      href={`https://${grant.contactInfo.website.replace(/^https?:\/\//, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" /> Apply / Get Forms
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      {/* Small Legal Footer Note */}
      <p className="text-center text-[11px] text-gray-400 mt-12">
        Simulated directory for educational purposes only. Review our compliance declarations on the <Link to="/agreement" className="underline font-bold text-gray-500 hover:text-primary">Platform Governance & Disclaimers</Link> page.
      </p>
    </div>
  );
}

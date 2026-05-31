import { useState, useEffect } from 'react';
import { DollarSign, X, Bookmark, BookmarkCheck, ExternalLink, Filter, Globe, Phone, Mail, Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { FUNDING_SOURCES, filterFundingSources } from '../data/fundingSources';
import useAuthStore from '../store/authStore';
import { useFirestore } from '../hooks/useFirestore';
import { formatKwachaSimple } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';

const CATEGORY_COLORS = {
  government: 'badge-government',
  ngo: 'badge-ngo',
  competition: 'badge-competition',
  international: 'badge-international',
  bank: 'badge-bank',
};

const FUNDING_TYPE_COLORS = {
  grant: 'badge-grant',
  loan: 'badge-loan',
  competition: 'badge-competition',
  training: 'badge-ngo',
};

export default function FundingFinder() {
  const { userProfile } = useAuthStore();
  const { addDocument, deleteDocument, getUserDocuments } = useFirestore();
  const { toast, show, hide } = useToast();
  const [filters, setFilters] = useState({
    businessStage: userProfile?.experience === 'registered' ? 'operating' : userProfile?.experience === 'started' ? 'registered' : 'idea',
    sector: '',
    province: userProfile?.province || '',
  });
  const [results, setResults] = useState(FUNDING_SOURCES);
  const [selected, setSelected] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    const saved = await getUserDocuments('bookmarkedFunding');
    setBookmarks(saved);
    setBookmarkIds(new Set(saved.map(b => b.fundingId)));
  }

  function applyFilters() {
    const filtered = filterFundingSources({
      age: userProfile?.age,
      sex: userProfile?.sex,
      occupation: userProfile?.occupation,
      businessStage: filters.businessStage,
      sector: filters.sector || undefined,
      province: filters.province || undefined,
    });
    setResults(filtered);
  }

  useEffect(() => { applyFilters(); }, [filters]);

  async function toggleBookmark(source) {
    if (bookmarkIds.has(source.id)) {
      const bookmark = bookmarks.find(b => b.fundingId === source.id);
      if (bookmark) {
        await deleteDocument('bookmarkedFunding', bookmark.id);
        setBookmarkIds(prev => { const s = new Set(prev); s.delete(source.id); return s; });
        setBookmarks(prev => prev.filter(b => b.fundingId !== source.id));
        show('Removed from bookmarks');
      }
    } else {
      await addDocument('bookmarkedFunding', { fundingId: source.id, fundingName: source.name });
      setBookmarkIds(prev => new Set([...prev, source.id]));
      loadBookmarks();
      show('Bookmarked! Find it in your profile.');
    }
  }

  const totalPotential = results.reduce((sum, s) => sum + s.amountRange.max, 0);
  const grantCount = results.filter(s => s.fundingType === 'grant').length;
  const loanCount = results.filter(s => s.fundingType === 'loan').length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Funding Finder</h1>
          <p className="text-gray-500 text-sm">25+ real Zambian funding sources with application guides</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card">
          <p className="text-xl font-bold text-primary">{results.length}</p>
          <p className="text-xs text-gray-500">Sources Found</p>
        </div>
        <div className="stat-card">
          <p className="text-xl font-bold text-accent-green">{grantCount} Grants</p>
          <p className="text-xs text-gray-500">{loanCount} Loans</p>
        </div>
        <div className="stat-card">
          <p className="text-xl font-bold text-accent-gold">{formatKwachaSimple(totalPotential)}</p>
          <p className="text-xs text-gray-500">Total potential</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-700">Filter by Your Situation</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Business Stage</label>
            <select value={filters.businessStage} onChange={e => setFilters(prev => ({ ...prev, businessStage: e.target.value }))} className="select-field">
              <option value="idea">Just an idea</option>
              <option value="registered">Registered business</option>
              <option value="operating">Operating business</option>
            </select>
          </div>
          <div>
            <label className="label">Business Sector</label>
            <select value={filters.sector} onChange={e => setFilters(prev => ({ ...prev, sector: e.target.value }))} className="select-field">
              <option value="">All sectors</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Technology">Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Services</option>
              <option value="Retail">Retail</option>
              <option value="Health">Health</option>
            </select>
          </div>
          <div>
            <label className="label">Province</label>
            <select value={filters.province} onChange={e => setFilters(prev => ({ ...prev, province: e.target.value }))} className="select-field">
              <option value="">All provinces</option>
              {['Lusaka', 'Copperbelt', 'Southern', 'Eastern', 'Northern', 'Western', 'Luapula', 'Central', 'Muchinga', 'North-Western'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Funding cards */}
      <div className="space-y-3">
        {results.map(source => (
          <div key={source.id} className="funding-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`badge ${CATEGORY_COLORS[source.category] || 'badge-government'}`}>{source.category}</span>
                  <span className={`badge ${FUNDING_TYPE_COLORS[source.fundingType] || 'badge-grant'}`}>{source.fundingType}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{source.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{source.description}</p>
                <p className="text-primary font-semibold text-sm">
                  {formatKwachaSimple(source.amountRange.min)} – {formatKwachaSimple(source.amountRange.max)}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => toggleBookmark(source)} className={`p-2 rounded-lg transition-colors ${bookmarkIds.has(source.id) ? 'text-accent-gold bg-yellow-50' : 'text-gray-300 hover:text-accent-gold'}`}>
                  {bookmarkIds.has(source.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button onClick={() => setSelected(source)} className="btn-primary text-xs px-3 py-1.5 min-h-0">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-gray-500">No funding sources match your filters. Try changing the filters above.</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-start justify-between">
              <div>
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className={`badge ${CATEGORY_COLORS[selected.category]}`}>{selected.category}</span>
                  <span className={`badge ${FUNDING_TYPE_COLORS[selected.fundingType]}`}>{selected.fundingType}</span>
                </div>
                <h2 className="font-bold text-gray-800">{selected.name}</h2>
                <p className="text-primary font-bold">{formatKwachaSimple(selected.amountRange.min)} – {formatKwachaSimple(selected.amountRange.max)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-surface-light rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="font-semibold text-sm text-gray-700 mb-1">About this Funding</p>
                <p className="text-sm text-gray-600">{selected.description}</p>
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-700 mb-1">Documents Required</p>
                <ul className="space-y-1">{selected.documentsRequired.map(d => <li key={d} className="text-sm text-gray-600 flex gap-2"><span>•</span>{d}</li>)}</ul>
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-700 mb-1">How to Apply</p>
                <p className="text-sm text-gray-600">{selected.applicationProcess}</p>
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-700 mb-1">Pro Tips</p>
                <ul className="space-y-1">{selected.tips.map(t => <li key={t} className="text-sm text-primary flex gap-2"><span>→</span>{t}</li>)}</ul>
              </div>

              <div className="bg-surface-light rounded-xl p-3 text-sm space-y-2">
                <p className="font-semibold text-gray-700 flex items-center gap-1"><FileText className="w-4 h-4" /> Contact & Links</p>
                {selected.contactInfo.website && (
                  <a href={`https://${selected.contactInfo.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline font-medium">
                    <Globe className="w-4 h-4 shrink-0" /> {selected.contactInfo.website}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {selected.contactInfo.phone && (
                  <a href={`tel:${selected.contactInfo.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-primary">
                    <Phone className="w-4 h-4 shrink-0" /> {selected.contactInfo.phone}
                  </a>
                )}
                {selected.contactInfo.email && (
                  <a href={`mailto:${selected.contactInfo.email}`} className="flex items-center gap-2 text-gray-600 hover:text-primary">
                    <Mail className="w-4 h-4 shrink-0" /> {selected.contactInfo.email}
                  </a>
                )}
                {selected.contactInfo.address && (
                  <p className="text-gray-500 text-xs">{selected.contactInfo.address}</p>
                )}
                <div className="flex items-center gap-1 text-gray-500 text-xs pt-1">
                  <Clock className="w-3 h-3" /> Deadline: <span className="font-medium">{selected.deadline}</span>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {selected.contactInfo.website && (
                  <a href={`https://${selected.contactInfo.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                    className="btn-primary flex-1 gap-2">
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
                <button onClick={() => toggleBookmark(selected)} className={`btn-secondary gap-2 ${bookmarkIds.has(selected.id) ? 'text-accent-gold border-accent-gold' : ''}`}>
                  {bookmarkIds.has(selected.id) ? <><BookmarkCheck className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

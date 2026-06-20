import { useState, useEffect } from 'react';
import { User, LogOut, Trash2, Edit2, Save, X, Star, KeyRound, Shield, Settings, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import { getProvinces, getDistricts } from '../data/provinces';
import { getDaysSince, getInitials, OCCUPATION_LABELS } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';

const card = 'bg-white dark:bg-[#1e2128] border border-gray-100 dark:border-[#2d3139] rounded-2xl shadow-sm';
const sectionLabel = 'text-[11px] font-extrabold text-gray-400 dark:text-[#9aa0a6] uppercase tracking-wider mb-3 px-1';
const inp = 'w-full border border-gray-200 dark:border-[#2d3139] rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-[#e8eaed] dark:bg-[#252830] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white';
const lbl = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5';

function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <Icon className="w-4 h-4 text-primary" />
      <h2 className={sectionLabel.replace('mb-3 px-1', '')}>{label}</h2>
    </div>
  );
}

export default function Profile() {
  const { user, userProfile, logout, updateProfile, resetPassword } = useAuth();
  const { getUserDocumentCount, getUserDocuments, deleteDocument } = useFirestore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [counts, setCounts] = useState({ ideas: 0, plans: 0, calcs: 0, bookmarks: 0 });
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    const [ideas, plans, calcs, bookmarks] = await Promise.all([
      getUserDocumentCount('businessIdeas'),
      getUserDocumentCount('businessPlans'),
      getUserDocumentCount('pricingCalculations'),
      getUserDocumentCount('bookmarkedFunding'),
    ]);
    setCounts({ ideas, plans, calcs, bookmarks });
    const savedIdeasData = await getUserDocuments('businessIdeas', null);
    setSavedIdeas(savedIdeasData);
  }

  function startEdit() {
    setEditData({ ...userProfile });
    setSelectedProvince(userProfile?.province || '');
    setEditing(true);
  }

  async function saveEdit() {
    try {
      await updateProfile(editData);
      setEditing(false);
      show('Profile updated!');
    } catch { show('Update failed.', 'error'); }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    if (!window.confirm('All your data will be permanently deleted. Continue?')) return;
    try {
      const collections = ['businessIdeas', 'businessPlans', 'pricingCalculations', 'milestones', 'monthlyReports', 'goals', 'bookmarkedFunding'];
      for (const col of collections) {
        const q = query(collection(db, col), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        for (const d of snap.docs) await deleteDoc(d.ref);
      }
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);
      navigate('/');
    } catch {
      show('Delete failed. Please re-login and try again.', 'error');
    }
  }

  const districts = getDistricts(selectedProvince || editData.province || '');
  const daysSince = getDaysSince(userProfile?.createdAt);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in text-left mt-2 pb-24 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      {/* ── Section 1: Business Details ── */}
      <div>
        <SectionTitle icon={User} label="Business Details" />
        <div className={`${card} p-5`}>
          {/* Avatar + Info */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-md shrink-0">
              {getInitials(userProfile?.fullName || '?')}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-gray-800 dark:text-[#e8eaed] leading-tight">{userProfile?.fullName || '—'}</h3>
              <p className="text-gray-400 dark:text-[#9aa0a6] text-sm mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {userProfile?.occupation && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light font-semibold">
                    {OCCUPATION_LABELS[userProfile.occupation] || userProfile.occupation}
                  </span>
                )}
                {userProfile?.province && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#252830] text-gray-600 dark:text-gray-400 font-semibold">
                    {userProfile.district ? `${userProfile.district}, ` : ''}{userProfile.province}
                  </span>
                )}
              </div>
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#252830] text-gray-600 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary-light text-xs font-bold transition-all shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {/* Day counter */}
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-[#9aa0a6] font-medium border-t border-gray-50 dark:border-[#2d3139] pt-4">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Day {daysSince + 1} on IMPUNGA
          </div>

          {/* Edit form */}
          {editing && (
            <div className="space-y-3 border-t border-gray-100 dark:border-[#2d3139] pt-4 mt-4">
              <div>
                <label className={lbl}>Full Name</label>
                <input value={editData.fullName || ''} onChange={e => setEditData(p => ({ ...p, fullName: e.target.value }))} className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Age</label>
                  <input type="number" value={editData.age || ''} onChange={e => setEditData(p => ({ ...p, age: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Sex</label>
                  <select value={editData.sex || ''} onChange={e => setEditData(p => ({ ...p, sex: e.target.value }))} className={inp}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="preferNotToSay">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Province</label>
                  <select value={editData.province || ''} onChange={e => { setEditData(p => ({ ...p, province: e.target.value })); setSelectedProvince(e.target.value); }} className={inp}>
                    <option value="">Select</option>
                    {getProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>District</label>
                  <select value={editData.district || ''} onChange={e => setEditData(p => ({ ...p, district: e.target.value }))} className={inp}>
                    <option value="">Select</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Occupation</label>
                <select value={editData.occupation || ''} onChange={e => setEditData(p => ({ ...p, occupation: e.target.value }))} className={inp}>
                  <option value="student">Secondary School Student</option>
                  <option value="outOfSchool">Out of School Youth</option>
                  <option value="university">University Student</option>
                  <option value="jobseeker">Job Seeker / Unemployed</option>
                  <option value="vendor">Market Vendor</option>
                  <option value="farmer">Farmer</option>
                  <option value="artisan">Local Artisan / Tradesperson</option>
                  <option value="employed">Employed Person</option>
                  <option value="retired">Retired Person</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditing(false)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-[#2d3139] text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Profile Settings ── */}
      <div>
        <SectionTitle icon={Settings} label="Profile Settings" />

        {/* Activity stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Ideas Validated', value: counts.ideas },
            { label: 'Business Plans', value: counts.plans },
            { label: 'Pricing Calcs', value: counts.calcs },
            { label: 'Bookmarks', value: counts.bookmarks },
          ].map(({ label, value }) => (
            <div key={label} className={`${card} p-4 text-center`}>
              <p className="text-2xl font-extrabold text-primary">{value}</p>
              <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Saved ideas */}
        <div className={`${card} p-5 mb-3`}>
          <h3 className="font-extrabold text-gray-800 dark:text-[#e8eaed] text-sm mb-3">Saved Business Ideas</h3>
          {savedIdeas.length === 0 ? (
            <p className="text-gray-400 dark:text-[#9aa0a6] text-sm">No ideas validated yet. Try the Idea Validator.</p>
          ) : (
            <ul className="space-y-2">
              {savedIdeas.map(idea => (
                <li key={idea.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252830] rounded-xl">
                  <span className={`w-7 h-7 text-xs font-bold flex-shrink-0 rounded-lg flex items-center justify-center text-white ${idea.score >= 8 ? 'bg-green-500' : idea.score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}>
                    {idea.score ?? '?'}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{idea.wizardData?.solution || idea.ideaText || 'Business Idea'}</span>
                  <button onClick={async () => { await deleteDocument('businessIdeas', idea.id); loadData(); show('Deleted'); }} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Password reset */}
        <div className={`${card} overflow-hidden`}>
          <button
            onClick={() => { resetPassword(user.email); show('Password reset email sent!'); }}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors text-left"
          >
            <KeyRound className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <div>
              <p className="font-semibold">Reset Password</p>
              <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-0.5">A reset link will be sent to {user?.email}</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Section 3: Data Privacy ── */}
      <div>
        <SectionTitle icon={Shield} label="Data Privacy" />
        <div className={`${card} overflow-hidden`}>
          {/* Navigate to full Data Privacy module */}
          <Link
            to="/data-privacy"
            className="flex items-center gap-3 px-5 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors border-b border-gray-50 dark:border-[#2d3139] group"
          >
            <Shield className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Privacy & Your Data</p>
              <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-0.5">View what data is stored, your rights, and deletion options</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-b border-gray-50 dark:border-[#2d3139]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-semibold">Log Out</p>
              <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-0.5">Sign out of your IMPUNGA account</p>
            </div>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-semibold">Delete Account</p>
              <p className="text-xs text-gray-400 dark:text-[#9aa0a6] mt-0.5">Permanently remove all your data — this cannot be undone</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

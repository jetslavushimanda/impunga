import { useState, useEffect } from 'react';
import { User, LogOut, Trash2, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import useAuthStore from '../store/authStore';
import { getProvinces, getDistricts } from '../data/provinces';
import { getDaysSince, getInitials, OCCUPATION_LABELS, formatDate } from '../lib/utils';
import { Toast, useToast } from '../components/shared/SuccessToast';

export default function Profile() {
  const { user, userProfile, logout, updateProfile, resetPassword } = useAuth();
  const { getUserDocumentCount, getUserDocuments, deleteDocument } = useFirestore();
  const { toast, show, hide } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [counts, setCounts] = useState({ ideas: 0, plans: 0, calcs: 0, bookmarks: 0 });
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [activeTab, setActiveTab] = useState('ideas');
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
    const savedIdeasData = await getUserDocuments('businessIdeas');
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
    } catch (err) {
      show('Delete failed. Please re-login and try again.', 'error');
    }
  }

  const districts = getDistricts(selectedProvince || editData.province || '');
  const daysSince = getDaysSince(userProfile?.createdAt);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      </div>

      {/* Profile card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {getInitials(userProfile?.fullName || '?')}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{userProfile?.fullName}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userProfile?.occupation && <span className="badge badge-government">{OCCUPATION_LABELS[userProfile.occupation] || userProfile.occupation}</span>}
              {userProfile?.province && <span className="badge bg-gray-100 text-gray-700">{userProfile.province}</span>}
              <span className="badge bg-blue-50 text-blue-700">Day {daysSince + 1} on IMPUNGA</span>
            </div>
          </div>
          {!editing && <button onClick={startEdit} className="btn-secondary gap-2 text-sm"><Edit2 className="w-4 h-4" /> Edit</button>}
        </div>

        {editing ? (
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div><label className="label">Full Name</label><input value={editData.fullName || ''} onChange={e => setEditData(p => ({ ...p, fullName: e.target.value }))} className="input-field" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Age</label><input type="number" value={editData.age || ''} onChange={e => setEditData(p => ({ ...p, age: e.target.value }))} className="input-field" /></div>
              <div><label className="label">Sex</label>
                <select value={editData.sex || ''} onChange={e => setEditData(p => ({ ...p, sex: e.target.value }))} className="select-field">
                  <option value="male">Male</option><option value="female">Female</option><option value="preferNotToSay">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Province</label>
                <select value={editData.province || ''} onChange={e => { setEditData(p => ({ ...p, province: e.target.value })); setSelectedProvince(e.target.value); }} className="select-field">
                  <option value="">Select</option>{getProvinces().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="label">District</label>
                <select value={editData.district || ''} onChange={e => setEditData(p => ({ ...p, district: e.target.value }))} className="select-field">
                  <option value="">Select</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Occupation</label>
              <select value={editData.occupation || ''} onChange={e => setEditData(p => ({ ...p, occupation: e.target.value }))} className="select-field">
                <option value="student">Secondary School Student</option>
                <option value="outOfSchool">Out of School Youth</option>
                <option value="university">University Student</option>
                <option value="vendor">Market Vendor</option>
                <option value="farmer">Farmer</option>
                <option value="employed">Employed Person</option>
                <option value="retired">Retired Person</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1 gap-2"><X className="w-4 h-4" /> Cancel</button>
              <button onClick={saveEdit} className="btn-primary flex-1 gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Ideas', value: counts.ideas },
          { label: 'Plans', value: counts.plans },
          { label: 'Calcs', value: counts.calcs },
          { label: 'Bookmarks', value: counts.bookmarks },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card"><p className="text-xl font-bold text-primary">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
        ))}
      </div>

      {/* Saved items */}
      <div className="card mb-4">
        <h3 className="font-bold text-gray-800 mb-3">Saved Items</h3>
        <div className="flex gap-2 mb-3 flex-wrap">
          {['ideas', 'plans'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-primary text-white' : 'bg-surface-light text-gray-600'}`}>{tab}</button>
          ))}
        </div>
        {activeTab === 'ideas' && (
          savedIdeas.length === 0 ? <p className="text-gray-400 text-sm">No ideas validated yet.</p> : (
            <ul className="space-y-2">
              {savedIdeas.map(idea => (
                <li key={idea.id} className="flex items-start gap-2 text-sm p-2 bg-surface-light rounded-lg">
                  <span className={`score-circle w-6 h-6 text-xs font-bold flex-shrink-0 ${idea.viabilityScore >= 8 ? 'bg-accent-green' : idea.viabilityScore >= 5 ? 'bg-accent-orange' : 'bg-accent-red'} text-white rounded-full flex items-center justify-center`}>{idea.viabilityScore ?? '?'}</span>
                  <span className="flex-1 text-gray-700 line-clamp-1">{idea.ideaText}</span>
                  <button onClick={async () => { await deleteDocument('businessIdeas', idea.id); loadData(); show('Deleted'); }} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      {/* Account settings */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">Account</h3>
        <div className="space-y-2">
          <button onClick={() => { resetPassword(user.email); show('Password reset email sent!'); }} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-surface-light rounded-lg">
            Reset Password
          </button>
          <hr className="border-gray-100" />
          <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 text-accent-red hover:bg-red-50 rounded-lg font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <hr className="border-gray-100" />
          <button onClick={handleDeleteAccount} className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

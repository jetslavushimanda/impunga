import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  OAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import useAuthStore from '../store/authStore';

// Auth-state syncing (onAuthStateChanged -> user/userProfile/loading) lives
// solely in App.jsx's top-level listener, which runs unconditionally on
// every load. This hook used to run a second, identical listener of its own
// (extra Firestore getDoc + updateDoc) that fired every time Header mounted,
// i.e. on every authenticated page — doubling auth/profile round-trips on
// every refresh for no benefit. Don't re-add a listener here.
export function useAuth() {
  const { user, userProfile, loading, setUserProfile, clearUser, setSelectedPath } = useAuthStore();

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const profile = {
        fullName: user.displayName || '',
        email: user.email || '',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      };
      await setDoc(docRef, profile);
      setUserProfile(profile);
    } else {
      const data = docSnap.data();
      setUserProfile(data);
      if (data.selectedPath) {
        setSelectedPath(data.selectedPath);
      }
    }
    return user;
  }

  async function loginWithApple() {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const profile = {
        fullName: user.displayName || '',
        email: user.email || '',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      };
      await setDoc(docRef, profile);
      setUserProfile(profile);
    } else {
      const data = docSnap.data();
      setUserProfile(data);
      if (data.selectedPath) {
        setSelectedPath(data.selectedPath);
      }
    }
    return user;
  }

  async function register(email, password, profileData) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const profile = {
      ...profileData,
      email: user.email,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    setUserProfile(profile);
    return user;
  }

  async function logout() {
    await signOut(auth);
    clearUser();
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateProfile(updates) {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { ...updates, lastActive: serverTimestamp() }, { merge: true });
    setUserProfile({ ...userProfile, ...updates });
  }

  return { user, userProfile, loading, login, loginWithGoogle, loginWithApple, register, logout, resetPassword, updateProfile };
}
